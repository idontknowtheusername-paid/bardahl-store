import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate, formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Mail, Phone, ShoppingBag, Car, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerData {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  created_at: string;
  vehicles: { id: string; license_plate: string; brand: string | null; model: string | null; year: number | null; fuel_type: string | null }[];
  orderCount: number;
  totalSpent: number;
  lastOrder: string | null;
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => {
      // Fetch registered customers
      let query = supabase.from('customers' as any).select('*');
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data: customerRows } = await query.order('created_at', { ascending: false });
      if (!customerRows) return [];

      // Fetch vehicles for all customers
      const customerIds = customerRows.map((c: any) => c.id);
      const { data: vehicleRows } = await supabase
        .from('customer_vehicles' as any)
        .select('*')
        .in('customer_id', customerIds);

      // Fetch order stats from orders table (by phone match)
      const phones = customerRows.map((c: any) => c.phone);
      const { data: orderRows } = await supabase
        .from('orders')
        .select('customer_phone, total, created_at')
        .in('customer_phone', phones);

      // Build enriched customer data
      return customerRows.map((c: any): CustomerData => {
        const custVehicles = (vehicleRows as any[] || []).filter((v: any) => v.customer_id === c.id);
        const custOrders = (orderRows || []).filter((o: any) => o.customer_phone === c.phone);
        return {
          id: c.id,
          full_name: c.full_name,
          phone: c.phone,
          email: c.email,
          city: c.city,
          created_at: c.created_at,
          vehicles: custVehicles,
          orderCount: custOrders.length,
          totalSpent: custOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          lastOrder: custOrders.length > 0 ? custOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : null,
        };
      });
    },
  });

  const exportCSV = () => {
    if (!customers?.length) return;
    const headers = ['Nom', 'Téléphone', 'Email', 'Ville', 'Véhicules', 'Commandes', 'Total dépensé', 'Inscription'];
    const rows = customers.map(c => [
      c.full_name, c.phone, c.email || '', c.city || '',
      c.vehicles.map(v => `${v.license_plate} ${v.brand || ''} ${v.model || ''}`).join(' | '),
      c.orderCount, c.totalSpent.toFixed(0), formatDate(c.created_at),
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `clients-autopassion-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export CSV réussi');
  };

  const sendWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`Bonjour ${name}, nous vous contactons depuis Autopassion BJ concernant l'entretien de votre véhicule.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients & Véhicules</h1>
        <Button onClick={exportCSV} variant="outline" disabled={!customers?.length}>
          <Download className="h-4 w-4 mr-2" />Exporter CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total clients</p>
            <p className="text-2xl font-bold">{customers?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Véhicules enregistrés</p>
            <p className="text-2xl font-bold">{customers?.reduce((sum, c) => sum + c.vehicles.length, 0) || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Chiffre d'affaires clients</p>
            <p className="text-2xl font-bold">{formatPrice(customers?.reduce((sum, c) => sum + c.totalSpent, 0) || 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom, téléphone, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : !customers?.length ? (
            <p className="text-center text-muted-foreground py-8">Aucun client enregistré</p>
          ) : (
            <div className="space-y-2">
              {customers.map(customer => (
                <div key={customer.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-primary text-sm">{customer.full_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{customer.full_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />{customer.phone}
                          {customer.email && <><Mail className="h-3 w-3 ml-1" />{customer.email}</>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <Badge variant="outline" className="text-xs">{customer.vehicles.length} véhicule{customer.vehicles.length > 1 ? 's' : ''}</Badge>
                        {customer.orderCount > 0 && <Badge variant="secondary" className="text-xs ml-1">{customer.orderCount} cmd</Badge>}
                      </div>
                      {expandedCustomer === customer.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {expandedCustomer === customer.id && (
                    <div className="border-t p-4 bg-muted/30 space-y-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => sendWhatsApp(customer.phone, customer.full_name)} className="gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-muted-foreground text-xs block">Inscription</span><span className="font-medium">{formatDate(customer.created_at)}</span></div>
                        <div><span className="text-muted-foreground text-xs block">Commandes</span><span className="font-medium">{customer.orderCount}</span></div>
                        <div><span className="text-muted-foreground text-xs block">Total dépensé</span><span className="font-medium">{formatPrice(customer.totalSpent)}</span></div>
                        <div><span className="text-muted-foreground text-xs block">Dernière commande</span><span className="font-medium">{customer.lastOrder ? formatDate(customer.lastOrder) : '-'}</span></div>
                      </div>

                      {customer.vehicles.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1"><Car className="h-4 w-4" /> Véhicules</h4>
                          <div className="grid gap-2">
                            {customer.vehicles.map(v => (
                              <div key={v.id} className="bg-background border rounded-lg p-3 flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-sm">{v.license_plate}</span>
                                  {(v.brand || v.model) && <span className="text-muted-foreground text-sm ml-2">{v.brand} {v.model}</span>}
                                  {v.year && <span className="text-muted-foreground text-xs ml-2">({v.year})</span>}
                                </div>
                                {v.fuel_type && <Badge variant="outline" className="text-xs">{v.fuel_type}</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
