import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate, formatDateShort, formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, Car, Phone, Mail, MapPin, Calendar, Droplets, ClipboardList,
  QrCode, ShoppingBag, MessageCircle, Pencil, Check, X, Loader2, Save, Shield, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  license_plate: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  fuel_type: string | null;
  mileage: number | null;
  vin: string | null;
}

interface LubricationPlan {
  id: string;
  vehicle_id: string;
  oil_type_engine: string | null;
  oil_type_gearbox: string | null;
  oil_quantity_engine: string | null;
  oil_quantity_gearbox: string | null;
  change_frequency_km: number | null;
  change_frequency_months: number | null;
  coolant_type: string | null;
  brake_fluid_type: string | null;
  engine_cleaner: string | null;
  gearbox_cleaner: string | null;
  radiator_cleaner: string | null;
}

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  last_date: string | null;
  next_date: string | null;
  mileage_at_service: number | null;
  notes: string | null;
  admin_validated: boolean;
  admin_validated_at: string | null;
  admin_validated_by: string | null;
}

interface QRCode {
  id: string;
  vehicle_id: string;
  qr_token: string;
  is_paid: boolean;
  created_at: string;
}

const MAINTENANCE_TYPES = [
  'Vidange moteur', 'Vidange boîte', 'Remplacement batterie',
  'Remplacement filtres', 'Freins', 'Pneus',
  'Assurance', 'Visite technique', 'TVM'
];

const PLAN_FIELDS = [
  { key: 'oil_type_engine', label: 'Huile moteur', icon: '🛢️' },
  { key: 'oil_quantity_engine', label: 'Quantité moteur', icon: '📏' },
  { key: 'oil_type_gearbox', label: 'Huile boîte', icon: '⚙️' },
  { key: 'oil_quantity_gearbox', label: 'Quantité boîte', icon: '📏' },
  { key: 'change_frequency_km', label: 'Fréquence (km)', icon: '🔄' },
  { key: 'change_frequency_months', label: 'Fréquence (mois)', icon: '📅' },
  { key: 'coolant_type', label: 'Liquide refroidissement', icon: '❄️' },
  { key: 'brake_fluid_type', label: 'Liquide frein', icon: '🛑' },
  { key: 'engine_cleaner', label: 'Nettoyant moteur', icon: '🧴' },
  { key: 'gearbox_cleaner', label: 'Nettoyant boîte', icon: '🧹' },
  { key: 'radiator_cleaner', label: 'Nettoyant radiateur', icon: '🌡️' },
];

export default function CustomerDetail() {
  const { id: customerId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Selected vehicle tab
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  // Edit states
  const [editingPlan, setEditingPlan] = useState(false);
  const [planForm, setPlanForm] = useState<Record<string, any>>({});
  const [editingMaint, setEditingMaint] = useState<string | null>(null);
  const [maintForm, setMaintForm] = useState<Record<string, any>>({});
  const [addingMaint, setAddingMaint] = useState(false);

  // Fetch customer
  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['admin-customer', customerId],
    queryFn: async () => {
      const { data } = await supabase.from('customers' as any).select('*').eq('id', customerId).single();
      return data as any;
    },
    enabled: !!customerId,
  });

  // Fetch vehicles
  const { data: vehicles } = useQuery({
    queryKey: ['admin-customer-vehicles', customerId],
    queryFn: async () => {
      const { data } = await supabase.from('customer_vehicles' as any).select('*').eq('customer_id', customerId);
      return (data || []) as Vehicle[];
    },
    enabled: !!customerId,
  });

  // Fetch order stats
  const { data: orders } = useQuery({
    queryKey: ['admin-customer-orders', customer?.phone],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('id, order_number, total, status, created_at, customer_phone').eq('customer_phone', customer.phone);
      return data || [];
    },
    enabled: !!customer?.phone,
  });

  // Auto-select first vehicle
  useEffect(() => {
    if (vehicles?.length && !selectedVehicleId) setSelectedVehicleId(vehicles[0].id);
  }, [vehicles, selectedVehicleId]);

  const vehicleIds = vehicles?.map(v => v.id) || [];

  // Fetch lubrication plans for all vehicles
  const { data: lubPlans } = useQuery({
    queryKey: ['admin-lub-plans', vehicleIds],
    queryFn: async () => {
      if (!vehicleIds.length) return [];
      const { data } = await supabase.from('lubrication_plans' as any).select('*').in('vehicle_id', vehicleIds);
      return (data || []) as LubricationPlan[];
    },
    enabled: vehicleIds.length > 0,
  });

  // Fetch maintenance records
  const { data: maintRecords } = useQuery({
    queryKey: ['admin-maint-records', vehicleIds],
    queryFn: async () => {
      if (!vehicleIds.length) return [];
      const { data } = await supabase.from('maintenance_records' as any).select('*').in('vehicle_id', vehicleIds).order('last_date', { ascending: false });
      return (data || []) as MaintenanceRecord[];
    },
    enabled: vehicleIds.length > 0,
  });

  // Fetch QR codes
  const { data: qrCodes } = useQuery({
    queryKey: ['admin-qr-codes', vehicleIds],
    queryFn: async () => {
      if (!vehicleIds.length) return [];
      const { data } = await supabase.from('vehicle_qr_codes' as any).select('*').in('vehicle_id', vehicleIds);
      return (data || []) as QRCode[];
    },
    enabled: vehicleIds.length > 0,
  });

  const selectedVehicle = vehicles?.find(v => v.id === selectedVehicleId);
  const selectedPlan = lubPlans?.find(p => p.vehicle_id === selectedVehicleId);
  const selectedRecords = maintRecords?.filter(r => r.vehicle_id === selectedVehicleId) || [];
  const selectedQR = qrCodes?.filter(q => q.vehicle_id === selectedVehicleId) || [];

  // Save lubrication plan
  const savePlan = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const payload = { ...data, vehicle_id: selectedVehicleId };
      if (selectedPlan) {
        await supabase.from('lubrication_plans' as any).update(payload).eq('id', selectedPlan.id);
      } else {
        await supabase.from('lubrication_plans' as any).insert(payload);
      }
    },
    onSuccess: () => {
      toast.success('Plan de lubrification sauvegardé');
      setEditingPlan(false);
      queryClient.invalidateQueries({ queryKey: ['admin-lub-plans'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Validate maintenance
  const validateMaint = useMutation({
    mutationFn: async ({ id, validated }: { id: string; validated: boolean }) => {
      await supabase.from('maintenance_records' as any).update({
        admin_validated: validated,
        admin_validated_at: validated ? new Date().toISOString() : null,
        admin_validated_by: validated ? 'admin' : null,
      }).eq('id', id);
    },
    onSuccess: () => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-maint-records'] });
    },
  });

  // Save maintenance record (edit or add)
  const saveMaint = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Record<string, any> }) => {
      if (id) {
        await supabase.from('maintenance_records' as any).update(data).eq('id', id);
      } else {
        await supabase.from('maintenance_records' as any).insert({ ...data, vehicle_id: selectedVehicleId });
      }
    },
    onSuccess: () => {
      toast.success('Entretien sauvegardé');
      setEditingMaint(null);
      setAddingMaint(false);
      setMaintForm({});
      queryClient.invalidateQueries({ queryKey: ['admin-maint-records'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const sendWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`Bonjour ${name}, nous vous contactons depuis Autopassion BJ concernant l'entretien de votre véhicule.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${msg}`, '_blank');
  };

  const startEditPlan = () => {
    setPlanForm(selectedPlan ? { ...selectedPlan } : {});
    setEditingPlan(true);
  };

  const startEditMaint = (r: MaintenanceRecord) => {
    setMaintForm({
      maintenance_type: r.maintenance_type,
      last_date: r.last_date?.split('T')[0] || '',
      next_date: r.next_date?.split('T')[0] || '',
      mileage_at_service: r.mileage_at_service || '',
      notes: r.notes || '',
    });
    setEditingMaint(r.id);
  };

  const startAddMaint = () => {
    setMaintForm({ maintenance_type: '', last_date: '', next_date: '', mileage_at_service: '', notes: '' });
    setAddingMaint(true);
  };

  if (loadingCustomer) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!customer) return <div className="text-center py-20"><p>Client introuvable</p><Button asChild className="mt-4"><Link to="/customers">Retour</Link></Button></div>;

  const isOverdue = (nextDate: string | null) => {
    if (!nextDate) return false;
    return new Date(nextDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/customers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{customer.full_name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {customer.phone}</span>
            {customer.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>}
            {customer.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {customer.city}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Inscrit le {formatDateShort(customer.created_at)}</span>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => sendWhatsApp(customer.phone, customer.full_name)} className="gap-1.5">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Véhicules</p>
          <p className="text-xl font-bold">{vehicles?.length || 0}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Commandes</p>
          <p className="text-xl font-bold">{orders?.length || 0}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Total dépensé</p>
          <p className="text-xl font-bold">{formatPrice(orders?.reduce((s: number, o: any) => s + (o.total || 0), 0) || 0)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">QR codes actifs</p>
          <p className="text-xl font-bold">{qrCodes?.filter(q => q.is_paid).length || 0}</p>
        </CardContent></Card>
      </div>

      {/* Vehicle selector */}
      {vehicles && vehicles.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Car className="h-5 w-5" /> Véhicules</h2>
          <div className="flex flex-wrap gap-2">
            {vehicles.map(v => (
              <Button
                key={v.id}
                variant={selectedVehicleId === v.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedVehicleId(v.id)}
                className="gap-2"
              >
                <Car className="h-3.5 w-3.5" />
                {v.license_plate}
                {v.brand && ` - ${v.brand} ${v.model || ''}`}
              </Button>
            ))}
          </div>

          {selectedVehicle && (
            <div className="space-y-6">
              {/* Vehicle info card */}
              <Card>
                <CardHeader><CardTitle className="text-base">Infos véhicule</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs block">Plaque</span><span className="font-medium">{selectedVehicle.license_plate}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Marque</span><span className="font-medium">{selectedVehicle.brand || '-'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Modèle</span><span className="font-medium">{selectedVehicle.model || '-'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Année</span><span className="font-medium">{selectedVehicle.year || '-'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Carburant</span><span className="font-medium">{selectedVehicle.fuel_type || '-'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Kilométrage</span><span className="font-medium">{selectedVehicle.mileage ? `${selectedVehicle.mileage.toLocaleString()} km` : '-'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">VIN</span><span className="font-medium">{selectedVehicle.vin || '-'}</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code status */}
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><QrCode className="h-4 w-4" /> QR Code</CardTitle></CardHeader>
                <CardContent>
                  {selectedQR.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun QR code généré</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedQR.map(qr => (
                        <div key={qr.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="text-sm">
                            <span className="font-mono text-xs">{qr.qr_token.substring(0, 16)}...</span>
                            <span className="text-muted-foreground text-xs ml-2">Créé le {formatDateShort(qr.created_at)}</span>
                          </div>
                          <Badge variant={qr.is_paid ? 'default' : 'destructive'}>
                            {qr.is_paid ? '✅ Payé & Actif' : '⏳ Non payé'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lubrication Plan */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><Droplets className="h-4 w-4" /> Plan de lubrification</CardTitle>
                    <Button size="sm" variant="outline" onClick={startEditPlan} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" /> {selectedPlan ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingPlan ? (
                    <form onSubmit={e => { e.preventDefault(); const { id, vehicle_id, ...rest } = planForm; savePlan.mutate(rest); }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PLAN_FIELDS.map(f => (
                          <div key={f.key}>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">{f.icon} {f.label}</label>
                            <Input
                              value={planForm[f.key] || ''}
                              onChange={e => setPlanForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                              placeholder={f.label}
                              type={f.key.includes('frequency') ? 'number' : 'text'}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingPlan(false)}><X className="h-4 w-4 mr-1" /> Annuler</Button>
                        <Button type="submit" size="sm" disabled={savePlan.isPending}>
                          {savePlan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Sauvegarder
                        </Button>
                      </div>
                    </form>
                  ) : selectedPlan ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {PLAN_FIELDS.map(f => (
                        <div key={f.key}>
                          <span className="text-muted-foreground text-xs block">{f.icon} {f.label}</span>
                          <span className="font-medium">{(selectedPlan as any)[f.key] || '-'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun plan de lubrification configuré</p>
                  )}
                </CardContent>
              </Card>

              {/* Maintenance Records */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Carnet d'entretien</CardTitle>
                    <Button size="sm" variant="outline" onClick={startAddMaint} className="gap-1.5">
                      + Ajouter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Add form */}
                  {addingMaint && (
                    <MaintForm
                      form={maintForm}
                      setForm={setMaintForm}
                      onCancel={() => { setAddingMaint(false); setMaintForm({}); }}
                      onSave={() => saveMaint.mutate({ data: {
                        maintenance_type: maintForm.maintenance_type,
                        last_date: maintForm.last_date || null,
                        next_date: maintForm.next_date || null,
                        mileage_at_service: maintForm.mileage_at_service ? parseInt(maintForm.mileage_at_service) : null,
                        notes: maintForm.notes || null,
                      }})}
                      saving={saveMaint.isPending}
                      title="Ajouter un entretien"
                    />
                  )}

                  {selectedRecords.length === 0 && !addingMaint ? (
                    <p className="text-sm text-muted-foreground">Aucun entretien enregistré</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {selectedRecords.map(r => (
                        <div key={r.id} className="border rounded-lg p-3">
                          {editingMaint === r.id ? (
                            <MaintForm
                              form={maintForm}
                              setForm={setMaintForm}
                              onCancel={() => { setEditingMaint(null); setMaintForm({}); }}
                              onSave={() => saveMaint.mutate({ id: r.id, data: {
                                maintenance_type: maintForm.maintenance_type,
                                last_date: maintForm.last_date || null,
                                next_date: maintForm.next_date || null,
                                mileage_at_service: maintForm.mileage_at_service ? parseInt(maintForm.mileage_at_service) : null,
                                notes: maintForm.notes || null,
                              }})}
                              saving={saveMaint.isPending}
                              title="Modifier l'entretien"
                            />
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{r.maintenance_type}</span>
                                  {r.admin_validated ? (
                                    <Badge variant="default" className="text-xs gap-1"><Shield className="h-3 w-3" /> Validé</Badge>
                                  ) : isOverdue(r.next_date) ? (
                                    <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" /> En retard</Badge>
                                  ) : r.next_date ? (
                                    <Badge variant="secondary" className="text-xs">Prévu</Badge>
                                  ) : null}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                  {r.last_date && <span>Fait le: {formatDateShort(r.last_date)}</span>}
                                  {r.next_date && <span>Prochain: {formatDateShort(r.next_date)}</span>}
                                  {r.mileage_at_service && <span>{r.mileage_at_service.toLocaleString()} km</span>}
                                  {r.notes && <span>"{r.notes}"</span>}
                                </div>
                                {r.admin_validated && r.admin_validated_at && (
                                  <p className="text-xs text-green-600 mt-1">Validé le {formatDateShort(r.admin_validated_at)}</p>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  size="sm"
                                  variant={r.admin_validated ? 'secondary' : 'default'}
                                  className="gap-1 text-xs h-7"
                                  onClick={() => validateMaint.mutate({ id: r.id, validated: !r.admin_validated })}
                                >
                                  {r.admin_validated ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                  {r.admin_validated ? 'Annuler' : 'Valider'}
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEditMaint(r)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Orders for this customer */}
              {orders && orders.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Commandes</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {orders.map((o: any) => (
                        <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <span className="font-medium text-sm">{o.order_number}</span>
                            <span className="text-xs text-muted-foreground ml-2">{formatDateShort(o.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{o.status}</Badge>
                            <span className="font-semibold text-sm">{formatPrice(o.total)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun véhicule enregistré pour ce client</CardContent></Card>
      )}
    </div>
  );
}

function MaintForm({ form, setForm, onCancel, onSave, saving, title }: {
  form: Record<string, any>;
  setForm: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  title: string;
}) {
  return (
    <div className="bg-muted/30 border rounded-lg p-3 space-y-3 mb-3">
      <h4 className="font-semibold text-sm">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium block mb-1">Type *</label>
          <select
            value={form.maintenance_type || ''}
            onChange={e => setForm(p => ({ ...p, maintenance_type: e.target.value }))}
            className="w-full p-2 rounded-md border border-input bg-background text-sm"
            required
          >
            <option value="">Sélectionner...</option>
            {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Dernière date</label>
          <Input type="date" value={form.last_date || ''} onChange={e => setForm(p => ({ ...p, last_date: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Prochaine date</label>
          <Input type="date" value={form.next_date || ''} onChange={e => setForm(p => ({ ...p, next_date: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Kilométrage</label>
          <Input type="number" value={form.mileage_at_service || ''} onChange={e => setForm(p => ({ ...p, mileage_at_service: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Notes</label>
          <Input value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Annuler</Button>
        <Button size="sm" onClick={onSave} disabled={saving || !form.maintenance_type}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Sauvegarder
        </Button>
      </div>
    </div>
  );
}
