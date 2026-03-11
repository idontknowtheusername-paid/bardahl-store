import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate, formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Mail, Phone, Eye, Car } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerData {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  created_at: string;
  vehicleCount: number;
  orderCount: number;
  totalSpent: number;
  lastOrder: string | null;
}

export default function Customers() {
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => {
      let query = supabase.from('customers' as any).select('*');
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data: customerRows } = await query.order('created_at', { ascending: false });
      if (!customerRows) return [];

      const customerIds = customerRows.map((c: any) => c.id);
      const { data: vehicleRows } = await supabase
        .from('customer_vehicles' as any).select('id, customer_id').in('customer_id', customerIds);

      const phones = customerRows.map((c: any) => c.phone);
      const { data: orderRows } = await supabase
        .from('orders').select('customer_phone, total, created_at').in('customer_phone', phones);

      // For CSV export with lubrication data, fetch plans
      const { data: lubPlans } = await supabase
        .from('lubrication_plans' as any).select('vehicle_id, oil_type_engine, oil_quantity_engine, change_frequency_km');

      return customerRows.map((c: any): CustomerData & { _vehicles: any[]; _lubPlans: any[] } => {
        const custVehicles = (vehicleRows as any[] || []).filter((v: any) => v.customer_id === c.id);
        const custOrders = (orderRows || []).filter((o: any) => o.customer_phone === c.phone);
        return {
          id: c.id,
          full_name: c.full_name,
          phone: c.phone,
          email: c.email,
          city: c.city,
          created_at: c.created_at,
          vehicleCount: custVehicles.length,
          orderCount: custOrders.length,
          totalSpent: custOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          lastOrder: custOrders.length > 0 ? custOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : null,
          _vehicles: custVehicles,
          _lubPlans: lubPlans || [],
        };
      });
    },
  });

  const exportCSV = () => {
    if (!customers?.length) return;
    const headers = ['Nom', 'Téléphone', 'Email', 'Ville', 'Nb Véhicules', 'Commandes', 'Total dépensé', 'Inscription'];
    const rows = customers.map(c => [
      c.full_name, c.phone, c.email || '', c.city || '',
      c.vehicleCount, c.orderCount, c.totalSpent.toFixed(0), formatDate(c.created_at),
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `clients-autopassion-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export CSV réussi');
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
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total clients</p>
          <p className="text-2xl font-bold">{customers?.length || 0}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Véhicules enregistrés</p>
          <p className="text-2xl font-bold">{customers?.reduce((sum, c) => sum + c.vehicleCount, 0) || 0}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Chiffre d'affaires clients</p>
          <p className="text-2xl font-bold">{formatPrice(customers?.reduce((sum, c) => sum + c.totalSpent, 0) || 0)}</p>
        </CardContent></Card>
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
                <Link
                  key={customer.id}
                  to={`/customers/${customer.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:flex items-center gap-2">
                      <Badge variant="outline" className="text-xs gap-1"><Car className="h-3 w-3" />{customer.vehicleCount}</Badge>
                      {customer.orderCount > 0 && <Badge variant="secondary" className="text-xs">{customer.orderCount} cmd</Badge>}
                      {customer.totalSpent > 0 && <span className="text-xs font-medium text-muted-foreground">{formatPrice(customer.totalSpent)}</span>}
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
