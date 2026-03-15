import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Wrench, Loader2, Car, CheckCircle, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/format';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  payment_status: string;
  items: { product_title: string; quantity: number; unit_price: number }[];
}

interface MaintenanceEntry {
  id: string;
  maintenance_type: string;
  last_date: string | null;
  mileage_at_service: number | null;
  notes: string | null;
  admin_validated: boolean;
  vehicle_plate: string;
  vehicle_name: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  confirmed: { label: 'Confirmée', variant: 'default' },
  processing: { label: 'En cours', variant: 'default' },
  shipped: { label: 'Expédiée', variant: 'default' },
  delivered: { label: 'Livrée', variant: 'default' },
  cancelled: { label: 'Annulée', variant: 'destructive' },
  refunded: { label: 'Remboursée', variant: 'outline' },
};

export default function CustomerHistory() {
  const { isAuthenticated, isLoading: authLoading, profile, vehicles } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceEntry[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMaint, setLoadingMaint] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/connexion');
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!profile) return;
    // Fetch orders by phone
    (async () => {
      setLoadingOrders(true);

      // Normalize phone number (remove spaces, +, etc.)
      const normalizePhone = (phone: string) => phone.replace(/[\s\+\-\(\)]/g, '');
      const profilePhone = normalizePhone(profile.phone);

      console.log('🔍 Recherche commandes pour:', profile.phone, '(normalisé:', profilePhone + ')');

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total, status, payment_status, customer_phone, customer_profile_id')
        .order('created_at', { ascending: false });

      console.log('📦 Toutes les commandes:', ordersData?.length || 0);

      if (ordersData) {
        // Log all customer phones for debugging
        console.log('📞 Téléphones dans les commandes:', ordersData.map(o => o.customer_phone));

        // Filter by customer_profile_id (priority) OR normalized phone (fallback)
        const filtered = ordersData.filter(o => {
          // Priority: match by customer_profile_id
          if (o.customer_profile_id === profile.id) {
            console.log(`✅ Match par profile_id: ${o.order_number}`);
            return true;
          }

          // Fallback: match by phone
          const orderPhone = normalizePhone(o.customer_phone || '');
          const phoneMatch = orderPhone === profilePhone ||
            orderPhone.endsWith(profilePhone) ||
            profilePhone.endsWith(orderPhone);
          if (phoneMatch) {
            console.log(`✅ Match par téléphone: ${o.order_number} (${o.customer_phone})`);
          }
          return phoneMatch;
        });

        console.log('✅ Commandes filtrées:', filtered.length);

        const withItems = await Promise.all(
          filtered.map(async (o) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('product_title, quantity, unit_price')
              .eq('order_id', o.id);
            return { ...o, items: items || [] };
          })
        );
        setOrders(withItems);
      }
      setLoadingOrders(false);
    })();
  }, [profile]);

  useEffect(() => {
    if (!vehicles.length) { setLoadingMaint(false); return; }
    (async () => {
      setLoadingMaint(true);
      const vehicleIds = vehicles.map(v => v.id);
      const { data } = await supabase
        .from('maintenance_records')
        .select('id, maintenance_type, last_date, mileage_at_service, notes, admin_validated, vehicle_id')
        .in('vehicle_id', vehicleIds)
        .order('last_date', { ascending: false });

      if (data) {
        const entries: MaintenanceEntry[] = data.map(m => {
          const v = vehicles.find(v => v.id === m.vehicle_id);
          return {
            ...m,
            admin_validated: m.admin_validated ?? false,
            vehicle_plate: v?.license_plate || '',
            vehicle_name: v?.brand && v?.model ? `${v.brand} ${v.model}` : v?.license_plate || '',
          };
        });
        setMaintenance(entries);
      }
      setLoadingMaint(false);
    })();
  }, [vehicles]);

  if (authLoading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return null;

  const formatDate = (d: string | null) => d ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d)) : '—';

  // Group maintenance by vehicle
  const grouped = maintenance.reduce<Record<string, MaintenanceEntry[]>>((acc, m) => {
    const key = m.vehicle_plate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <>
      <Helmet><title>Historique | Autopassion BJ</title></Helmet>
      <div className="min-h-[70vh] bg-muted/30">
        <section className="bg-secondary text-secondary-foreground py-6">
          <div className="container">
            <button
              onClick={() => navigate('/mon-espace')}
              className="flex items-center gap-2 text-secondary-foreground/80 hover:text-white transition-colors mb-3 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à Mon espace
            </button>
            <h1 className="text-xl font-extrabold text-white">📋 Mon Historique</h1>
            <p className="text-secondary-foreground/70 text-sm mt-1">
              Consultez vos commandes et entretiens
            </p>
          </div>
        </section>

        <div className="container py-5">
          <Tabs defaultValue="commandes" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-5">
              <TabsTrigger value="commandes" className="gap-1.5 text-xs sm:text-sm">
                <ShoppingBag className="h-4 w-4 hidden sm:block" /> Mes Commandes
              </TabsTrigger>
              <TabsTrigger value="entretiens" className="gap-1.5 text-xs sm:text-sm">
                <Wrench className="h-4 w-4 hidden sm:block" /> Mes Entretiens
              </TabsTrigger>
            </TabsList>

            <TabsContent value="commandes" className="space-y-3">
              {loadingOrders ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Aucune commande</p>
                </div>
              ) : (
                orders.map(order => {
                  const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
                  return (
                    <div key={order.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">{order.order_number}</span>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{formatDate(order.created_at)}</p>
                      <div className="space-y-1 mb-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="truncate flex-1">{item.quantity}x {item.product_title}</span>
                            <span className="font-medium ml-2">{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="entretiens" className="space-y-4">
              {loadingMaint ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : maintenance.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wrench className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Aucun entretien enregistré</p>
                </div>
              ) : (
                Object.entries(grouped).map(([plate, entries]) => (
                  <div key={plate} className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Car className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm">{entries[0].vehicle_name}</span>
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">{plate}</span>
                    </div>
                    {entries.map(m => (
                      <div key={m.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Wrench className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{m.maintenance_type}</span>
                            {m.admin_validated && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-0.5">
                                <CheckCircle className="h-3 w-3" /> Validé
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>{formatDate(m.last_date)}</span>
                            {m.mileage_at_service && <span>{m.mileage_at_service.toLocaleString()} km</span>}
                          </div>
                          {m.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{m.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
