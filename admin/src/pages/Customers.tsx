import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate, formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Mail, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: async () => {
      let query = supabase.from('orders').select('customer_email, customer_name, customer_phone, created_at, total', { count: 'exact' });
      if (search) query = query.or(`customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`);
      const { data: orders, count } = await query.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);

      const customersMap = new Map();
      orders?.forEach(order => {
        const email = order.customer_email;
        if (!email) return;
        if (!customersMap.has(email)) {
          customersMap.set(email, { email, name: order.customer_name, phone: order.customer_phone, firstOrder: order.created_at, lastOrder: order.created_at, totalOrders: 1, totalSpent: order.total });
        } else {
          const c = customersMap.get(email);
          c.totalOrders += 1;
          c.totalSpent += order.total;
          if (new Date(order.created_at) > new Date(c.lastOrder)) c.lastOrder = order.created_at;
          if (new Date(order.created_at) < new Date(c.firstOrder)) c.firstOrder = order.created_at;
        }
      });
      return { customers: Array.from(customersMap.values()), total: count || 0 };
    },
  });

  const exportCSV = () => {
    if (!data?.customers.length) return;
    const headers = ['Email', 'Nom', 'Téléphone', 'Première commande', 'Dernière commande', 'Nb commandes', 'Total dépensé'];
    const rows = data.customers.map(c => [c.email, c.name || '', c.phone || '', formatDate(c.firstOrder), formatDate(c.lastOrder), c.totalOrders, c.totalSpent.toFixed(2)]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export CSV réussi');
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button onClick={exportCSV} variant="outline" disabled={!data?.customers.length}><Download className="h-4 w-4 mr-2" />Exporter CSV</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par email, nom..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : !data?.customers.length ? (
            <p className="text-center text-muted-foreground py-8">Aucun client trouvé</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead><TableHead>Contact</TableHead><TableHead>Première commande</TableHead><TableHead>Dernière commande</TableHead><TableHead className="text-right">Commandes</TableHead><TableHead className="text-right">Total dépensé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.customers.map((customer) => (
                    <TableRow key={customer.email}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{customer.phone || '-'}</TableCell>
                      <TableCell className="text-sm">{formatDate(customer.firstOrder)}</TableCell>
                      <TableCell className="text-sm">{formatDate(customer.lastOrder)}</TableCell>
                      <TableCell className="text-right"><span className="inline-flex items-center gap-1"><ShoppingBag className="h-3 w-3" />{customer.totalOrders}</span></TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(customer.totalSpent)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} sur {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Précédent</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
