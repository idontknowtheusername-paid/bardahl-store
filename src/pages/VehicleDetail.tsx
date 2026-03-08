import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, ArrowLeft, Plus, Trash2, Wrench, Droplets, Calendar, Gauge, Fuel, MapPin, Loader2, ClipboardList, QrCode, TestTube, Pencil, Bell, Check } from 'lucide-react';
import HealthDashboard from '@/components/vehicle/HealthDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const QR_DEFAULT_PRICE = 1000;

interface MaintenanceRecord {
  id: string;
  maintenance_type: string;
  last_date: string | null;
  next_date: string | null;
  mileage_at_service: number | null;
  notes: string | null;
}

interface LubricationPlan {
  id: string;
  oil_type_engine: string | null;
  oil_type_gearbox: string | null;
  oil_quantity_engine: string | null;
  oil_quantity_gearbox: string | null;
  change_frequency_km: number | null;
  change_frequency_months: number | null;
  reminder_frequency_months: number | null;
}

interface QRCode {
  id: string;
  qr_token: string;
  is_paid: boolean;
}

const MAINTENANCE_TYPES = [
  'Vidange moteur', 'Vidange boîte', 'Remplacement batterie',
  'Remplacement filtres', 'Freins', 'Pneus',
  'Assurance', 'Visite technique', 'TVM'
];

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading, vehicles, profile } = useCustomerAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [qrPrice, setQrPrice] = useState<number>(QR_DEFAULT_PRICE);
  const [plan, setPlan] = useState<LubricationPlan | null>(null);
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMaint, setShowAddMaint] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [saving, setSaving] = useState(false);

  const [maintType, setMaintType] = useState('');
  const [maintLastDate, setMaintLastDate] = useState('');
  const [maintNextDate, setMaintNextDate] = useState('');
  const [maintMileage, setMaintMileage] = useState('');
  const [maintNotes, setMaintNotes] = useState('');

  const [planEngine, setPlanEngine] = useState('');
  const [planGearbox, setPlanGearbox] = useState('');
  const [planQtyEngine, setPlanQtyEngine] = useState('');
  const [planQtyGearbox, setPlanQtyGearbox] = useState('');
  const [planFreqKm, setPlanFreqKm] = useState('');
  const [planFreqMonths, setPlanFreqMonths] = useState('');

  // Alert preferences
  const [alertReminder, setAlertReminder] = useState<any>(null);
  const [alertPrefs, setAlertPrefs] = useState({ midpoint: true, one_week: true, one_day: true });
  const [alertInterval, setAlertInterval] = useState('6');
  const [savingAlerts, setSavingAlerts] = useState(false);

  const vehicle = vehicles.find(v => v.id === id);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: recs }, { data: lubPlan }, { data: qr }] = await Promise.all([
      supabase.from('maintenance_records').select('*').eq('vehicle_id', id).order('last_date', { ascending: false }),
      supabase.from('lubrication_plans').select('*').eq('vehicle_id', id).maybeSingle(),
      supabase.from('vehicle_qr_codes').select('*').eq('vehicle_id', id).maybeSingle(),
    ]);
    setRecords((recs as unknown as MaintenanceRecord[]) || []);
    setPlan(lubPlan as unknown as LubricationPlan | null);
    setQRCode(qr as unknown as QRCode | null);

    // Fetch alert reminder for this vehicle
    const veh = vehicles.find(v => v.id === id);
    if (veh) {
      const { data: reminder } = await supabase
        .from('oil_change_reminders')
        .select('*')
        .eq('is_active', true)
        .limit(50);
      const match = reminder?.find((r: any) =>
        r.vehicle_brand === veh.brand && r.vehicle_model === veh.model
      );
      if (match) {
        setAlertReminder(match);
        setAlertPrefs((match as any).alert_preferences || { midpoint: true, one_week: true, one_day: true });
        setAlertInterval(String(match.reminder_interval_months || 6));
      }
    }

    if (lubPlan) {
      const p = lubPlan as any;
      setPlanEngine(p.oil_type_engine || '');
      setPlanGearbox(p.oil_type_gearbox || '');
      setPlanQtyEngine(p.oil_quantity_engine || '');
      setPlanQtyGearbox(p.oil_quantity_gearbox || '');
      setPlanFreqKm(p.change_frequency_km?.toString() || '');
      setPlanFreqMonths(p.change_frequency_months?.toString() || '');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { if (isAuthenticated && id) fetchData(); }, [isAuthenticated, id, fetchData]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/connexion');
  }, [authLoading, isAuthenticated, navigate]);

  const activateQR = useCallback(async (qrId: string, transactionId?: string) => {
    const { error } = await supabase
      .from('vehicle_qr_codes')
      .update({ is_paid: true, payment_id: transactionId || 'TEST_MODE' } as any)
      .eq('id', qrId);
    if (error) { toast.error('Erreur activation QR : ' + error.message); return; }
    toast.success('✅ QR code activé avec succès !');
    fetchData();
  }, [fetchData]);

  if (authLoading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return null;
  if (!vehicle) return <div className="container py-20 text-center"><p>Véhicule non trouvé.</p><Button asChild className="mt-4"><Link to="/mon-espace">Retour</Link></Button></div>;

  const resetMaintForm = () => {
    setMaintType(''); setMaintLastDate(''); setMaintNextDate(''); setMaintMileage(''); setMaintNotes('');
    setEditingRecord(null);
    setShowAddMaint(false);
  };

  const startEditRecord = (r: MaintenanceRecord) => {
    setEditingRecord(r.id);
    setMaintType(r.maintenance_type);
    setMaintLastDate(r.last_date ? r.last_date.split('T')[0] : '');
    setMaintNextDate(r.next_date ? r.next_date.split('T')[0] : '');
    setMaintMileage(r.mileage_at_service?.toString() || '');
    setMaintNotes(r.notes || '');
    setShowAddMaint(true);
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintType) return;
    setSaving(true);
    const payload = {
      vehicle_id: id!,
      maintenance_type: maintType,
      last_date: maintLastDate || null,
      next_date: maintNextDate || null,
      mileage_at_service: maintMileage ? parseInt(maintMileage) : null,
      notes: maintNotes.trim() || null,
    };
    if (editingRecord) {
      const { error } = await supabase.from('maintenance_records').update(payload as any).eq('id', editingRecord);
      setSaving(false);
      if (error) { toast.error(error.message); return; }
      toast.success('Entretien modifié !');
    } else {
      const { error } = await supabase.from('maintenance_records').insert(payload as any);
      setSaving(false);
      if (error) { toast.error(error.message); return; }
      toast.success('Entretien ajouté !');
    }
    resetMaintForm();
    fetchData();
  };

  const handleDeleteMaintenance = async (recId: string) => {
    if (!confirm('Supprimer cet entretien ?')) return;
    await supabase.from('maintenance_records').delete().eq('id', recId);
    toast.success('Supprimé.');
    fetchData();
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      vehicle_id: id!,
      oil_type_engine: planEngine || null,
      oil_type_gearbox: planGearbox || null,
      oil_quantity_engine: planQtyEngine || null,
      oil_quantity_gearbox: planQtyGearbox || null,
      change_frequency_km: planFreqKm ? parseInt(planFreqKm) : null,
      change_frequency_months: planFreqMonths ? parseInt(planFreqMonths) : null,
    };
    if (plan) {
      await supabase.from('lubrication_plans').update(payload as any).eq('id', plan.id);
    } else {
      await supabase.from('lubrication_plans').insert(payload as any);
    }
    setSaving(false);
    toast.success('Plan de lubrification sauvegardé !');
    setShowEditPlan(false);
    fetchData();
  };

  const handleGenerateQR = async () => {
    if (qrCode) return;
    const { error } = await supabase.from('vehicle_qr_codes').insert({ vehicle_id: id! } as any);
    if (error) { toast.error(error.message); return; }
    toast.info('QR code créé. Procédez au paiement de 1 000 FCFA pour l\'activer.');
    fetchData();
  };

  // Fetch QR price from site settings
  useEffect(() => {
    supabase.from('site_settings').select('qr_activation_price').single().then(({ data }) => {
      if (data?.qr_activation_price) setQrPrice(data.qr_activation_price);
    });
  }, []);

  const handlePayQR = () => {
    if (!qrCode) return;
    const { openKkiapayWidget, addSuccessListener, addFailedListener } = window as any;
    if (!openKkiapayWidget) { toast.error('Le module de paiement n\'est pas chargé.'); return; }
    addSuccessListener((response: any) => {
      toast.success('Paiement reçu ! Activation du QR code...');
      activateQR(qrCode.id, response.transactionId);
    });
    addFailedListener(() => toast.error('Le paiement a échoué.'));
    openKkiapayWidget({
      amount: qrPrice, key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || '',
      sandbox: false, phone: '',
      name: vehicle?.brand ? `${vehicle.brand} ${vehicle.model}` : 'QR Carnet',
      data: JSON.stringify({ type: 'qr_activation', vehicle_id: id, qr_id: qrCode.id }),
      theme: '#F59E0B',
    });
  };

  return (
    <>
      <Helmet><title>{vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : vehicle.license_plate} | Autopassion BJ</title></Helmet>

      <div className="min-h-[70vh] bg-muted/30">
        {/* Header véhicule */}
        <section className="bg-secondary text-secondary-foreground py-6 md:py-10">
          <div className="container">
            <Link to="/mon-espace" className="inline-flex items-center gap-1 text-secondary-foreground/70 hover:text-white text-sm mb-3">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-extrabold text-white truncate">
                  {vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : 'Mon véhicule'}
                </h1>
                <div className="flex flex-wrap gap-2 text-secondary-foreground/70 text-xs mt-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vehicle.license_plate}</span>
                  {vehicle.year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {vehicle.year}</span>}
                  {vehicle.fuel_type && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type}</span>}
                  {vehicle.mileage && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {vehicle.mileage.toLocaleString()} km</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contenu avec Tabs */}
        <div className="container py-5">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue="entretien" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-5">
                <TabsTrigger value="entretien" className="gap-1.5 text-xs sm:text-sm">
                  <ClipboardList className="h-4 w-4 hidden sm:block" /> Entretien
                </TabsTrigger>
                <TabsTrigger value="lubrification" className="gap-1.5 text-xs sm:text-sm">
                  <Droplets className="h-4 w-4 hidden sm:block" /> Lubrification
                </TabsTrigger>
                <TabsTrigger value="alertes" className="gap-1.5 text-xs sm:text-sm">
                  <Bell className="h-4 w-4 hidden sm:block" /> Alertes
                </TabsTrigger>
                <TabsTrigger value="qrcode" className="gap-1.5 text-xs sm:text-sm">
                  <QrCode className="h-4 w-4 hidden sm:block" /> QR Code
                </TabsTrigger>
              </TabsList>

              {/* TAB: Entretien */}
              <TabsContent value="entretien" className="space-y-4">
                <HealthDashboard records={records} />

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Carnet d'entretien</h2>
                  <Button size="sm" onClick={() => { resetMaintForm(); setShowAddMaint(true); }} className="gap-1.5"><Plus className="h-4 w-4" /> Ajouter</Button>
                </div>

                {showAddMaint && (
                  <form onSubmit={handleSaveMaintenance} className="bg-card border border-border rounded-xl p-4 shadow-card">
                    <h3 className="font-semibold text-sm mb-3">{editingRecord ? '✏️ Modifier l\'entretien' : '➕ Nouvel entretien'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold mb-1">Type d'entretien *</label>
                        <select value={maintType} onChange={e => setMaintType(e.target.value)} className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" required>
                          <option value="">Sélectionner...</option>
                          {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Dernière date</label>
                        <input type="date" value={maintLastDate} onChange={e => setMaintLastDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Prochaine date</label>
                        <input type="date" value={maintNextDate} onChange={e => setMaintNextDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Kilométrage</label>
                        <input type="number" value={maintMileage} onChange={e => setMaintMileage(e.target.value)} placeholder="120000" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Notes</label>
                        <input type="text" value={maintNotes} onChange={e => setMaintNotes(e.target.value)} placeholder="Optionnel" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button type="button" variant="outline" size="sm" onClick={resetMaintForm}>Annuler</Button>
                      <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingRecord ? 'Modifier' : 'Enregistrer'}</Button>
                    </div>
                  </form>
                )}

                {records.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Wrench className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun entretien enregistré.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {records.map(r => (
                      <div key={r.id} className="bg-card border border-border rounded-xl p-3.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm">{r.maintenance_type}</h4>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                            {r.last_date && <span>Dernière : {new Date(r.last_date).toLocaleDateString('fr-FR')}</span>}
                            {r.next_date && <span className="text-primary font-medium">Prochaine : {new Date(r.next_date).toLocaleDateString('fr-FR')}</span>}
                            {r.mileage_at_service && <span>{r.mileage_at_service.toLocaleString()} km</span>}
                          </div>
                          {r.notes && <p className="text-xs text-muted-foreground mt-1 italic truncate">{r.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => startEditRecord(r)} className="text-muted-foreground hover:text-primary p-1"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDeleteMaintenance(r.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TAB: Lubrification */}
              <TabsContent value="lubrification" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Droplets className="h-5 w-5 text-primary" /> Plan de lubrification</h2>
                  <Button size="sm" variant="outline" onClick={() => setShowEditPlan(!showEditPlan)}>
                    {plan ? 'Modifier' : 'Configurer'}
                  </Button>
                </div>

                {showEditPlan && (
                  <form onSubmit={handleSavePlan} className="bg-card border border-border rounded-xl p-4 shadow-card">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Huile moteur</label>
                        <input type="text" value={planEngine} onChange={e => setPlanEngine(e.target.value)} placeholder="Ex: 5W-30" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Huile boîte</label>
                        <input type="text" value={planGearbox} onChange={e => setPlanGearbox(e.target.value)} placeholder="Ex: 75W-90" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Quantité moteur</label>
                        <input type="text" value={planQtyEngine} onChange={e => setPlanQtyEngine(e.target.value)} placeholder="Ex: 4.5L" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Quantité boîte</label>
                        <input type="text" value={planQtyGearbox} onChange={e => setPlanQtyGearbox(e.target.value)} placeholder="Ex: 2L" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Fréquence (km)</label>
                        <input type="number" value={planFreqKm} onChange={e => setPlanFreqKm(e.target.value)} placeholder="10000" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Fréquence (mois)</label>
                        <input type="number" value={planFreqMonths} onChange={e => setPlanFreqMonths(e.target.value)} placeholder="6" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowEditPlan(false)}>Annuler</Button>
                      <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sauvegarder'}</Button>
                    </div>
                  </form>
                )}

                {!plan && !showEditPlan ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Droplets className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun plan de lubrification configuré.</p>
                  </div>
                ) : plan && !showEditPlan ? (
                  <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
                    {plan.oil_type_engine && <div><span className="text-muted-foreground text-xs block">Huile moteur</span><span className="font-semibold">{plan.oil_type_engine}</span></div>}
                    {plan.oil_type_gearbox && <div><span className="text-muted-foreground text-xs block">Huile boîte</span><span className="font-semibold">{plan.oil_type_gearbox}</span></div>}
                    {plan.oil_quantity_engine && <div><span className="text-muted-foreground text-xs block">Qté moteur</span><span className="font-semibold">{plan.oil_quantity_engine}</span></div>}
                    {plan.oil_quantity_gearbox && <div><span className="text-muted-foreground text-xs block">Qté boîte</span><span className="font-semibold">{plan.oil_quantity_gearbox}</span></div>}
                    {plan.change_frequency_km && <div><span className="text-muted-foreground text-xs block">Fréquence</span><span className="font-semibold">{plan.change_frequency_km.toLocaleString()} km</span></div>}
                    {plan.change_frequency_months && <div><span className="text-muted-foreground text-xs block">Fréquence</span><span className="font-semibold">{plan.change_frequency_months} mois</span></div>}
                  </div>
                ) : null}
              </TabsContent>

              {/* TAB: Alertes */}
              <TabsContent value="alertes" className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" /> Préférences d'alertes
                </h2>

                {!alertReminder ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">Aucun rappel configuré pour ce véhicule.</p>
                    <p className="text-xs text-muted-foreground mb-4">Activez les rappels pour recevoir des alertes avant chaque vidange.</p>
                    <Button
                      disabled={savingAlerts}
                      onClick={async () => {
                        setSavingAlerts(true);
                        const next = new Date();
                        next.setMonth(next.getMonth() + 6);
                        const { data: newReminder, error } = await supabase
                          .from('oil_change_reminders')
                          .insert({
                            customer_email: profile?.email || `${profile?.phone}@autopassion.local`,
                            customer_name: profile?.full_name || '',
                            customer_phone: profile?.phone || '',
                            vehicle_brand: vehicle.brand || null,
                            vehicle_model: vehicle.model || null,
                            reminder_interval_months: 6,
                            next_reminder_date: next.toISOString(),
                            alert_preferences: { midpoint: true, one_week: true, one_day: true },
                          } as any)
                          .select()
                          .single();
                        setSavingAlerts(false);
                        if (error) { toast.error('Erreur: ' + error.message); return; }
                        toast.success('🔔 Rappels vidange activés ! (par défaut : tous les 6 mois)');
                        fetchData();
                      }}
                      className="gap-2"
                    >
                      {savingAlerts ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Bell className="h-4 w-4" /> Activer les rappels vidange</>}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                    {/* Interval */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Fréquence de vidange</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['3', '6', '9', '12'].map(m => (
                          <button
                            key={m}
                            onClick={() => setAlertInterval(m)}
                            className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                              alertInterval === m
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-background border-input hover:border-primary/50'
                            }`}
                          >
                            {m} mois
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alert preferences */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Quand recevoir les alertes ?</label>
                      <div className="space-y-2.5">
                        {[
                          { key: 'midpoint' as const, label: 'À mi-chemin', desc: `~${Math.round(parseInt(alertInterval) / 2 * 30)} jours avant` },
                          { key: 'one_week' as const, label: '1 semaine avant', desc: '7 jours avant la date prévue' },
                          { key: 'one_day' as const, label: 'La veille', desc: '1 jour avant — rappel urgent' },
                        ].map(({ key, label, desc }) => (
                          <button
                            key={key}
                            onClick={() => setAlertPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              alertPrefs[key]
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-background border-input'
                            }`}
                          >
                            <div className="text-left">
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                              alertPrefs[key] ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground/30'
                            }`}>
                              {alertPrefs[key] && <Check className="h-3 w-3" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info on what emails contain */}
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground text-sm">📧 Chaque alerte contient :</p>
                      <p>• Infos de votre véhicule et produit recommandé</p>
                      <p>• Lien pour commander sur le site</p>
                      <p>• Lien WhatsApp pour commande rapide</p>
                      <p>• 🚚 Livraison gratuite pour les commandes vidange !</p>
                    </div>

                    <Button
                      className="w-full"
                      disabled={savingAlerts}
                      onClick={async () => {
                        setSavingAlerts(true);
                        const next = new Date();
                        next.setMonth(next.getMonth() + parseInt(alertInterval));
                        const { error } = await supabase
                          .from('oil_change_reminders')
                          .update({
                            reminder_interval_months: parseInt(alertInterval),
                            next_reminder_date: next.toISOString(),
                            alert_preferences: alertPrefs as any,
                            alerts_sent: {} as any,
                          } as any)
                          .eq('id', alertReminder.id);
                        setSavingAlerts(false);
                        if (error) { toast.error('Erreur: ' + error.message); return; }
                        toast.success('Préférences d\'alertes sauvegardées !');
                        fetchData();
                      }}
                    >
                      {savingAlerts ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sauvegarder mes préférences'}
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* TAB: QR Code */}
              <TabsContent value="qrcode" className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" /> QR Code carnet
                  
                </h2>
                <div className="bg-card border border-border rounded-xl p-6">
                  {!qrCode ? (
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">Générez un QR code unique pour accéder au carnet d'entretien. À coller dans votre voiture !</p>
                      <p className="text-xs text-muted-foreground mb-4">Prix : <span className="font-bold text-foreground">{qrPrice.toLocaleString()} FCFA</span></p>
                      <Button onClick={handleGenerateQR}>Générer mon QR code</Button>
                    </div>
                  ) : !qrCode.is_paid ? (
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-accent mx-auto mb-3" />
                      <p className="font-semibold mb-1">QR code créé</p>
                      <p className="text-sm text-muted-foreground mb-4">Finalisez le paiement de {qrPrice.toLocaleString()} FCFA.</p>
                      <Button onClick={handlePayQR} className="bg-accent text-accent-foreground gap-2">
                        Payer {qrPrice.toLocaleString()} FCFA
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 inline-block mb-4">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/qr/' + qrCode.qr_token)}`}
                          alt="QR Code"
                          className="w-40 h-40 sm:w-48 sm:h-48 mx-auto"
                        />
                      </div>
                      <p className="font-semibold text-primary mb-1">✅ QR code actif</p>
                      <p className="text-xs text-muted-foreground mb-3">Imprimez et collez ce QR code dans votre véhicule.</p>
                      <a
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(window.location.origin + '/qr/' + qrCode.qr_token)}`}
                        download={`qr-${vehicle.license_plate}.png`}
                        className="text-sm text-primary underline"
                      >
                        Télécharger le QR code
                      </a>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
