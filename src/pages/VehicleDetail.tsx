import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, ArrowLeft, Plus, Trash2, Wrench, Droplets, Calendar, Gauge, Fuel, MapPin, Loader2, ClipboardList, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const { isAuthenticated, isLoading: authLoading, vehicles } = useCustomerAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [plan, setPlan] = useState<LubricationPlan | null>(null);
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMaint, setShowAddMaint] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add maintenance form
  const [maintType, setMaintType] = useState('');
  const [maintLastDate, setMaintLastDate] = useState('');
  const [maintNextDate, setMaintNextDate] = useState('');
  const [maintMileage, setMaintMileage] = useState('');
  const [maintNotes, setMaintNotes] = useState('');

  // Edit plan form
  const [planEngine, setPlanEngine] = useState('');
  const [planGearbox, setPlanGearbox] = useState('');
  const [planQtyEngine, setPlanQtyEngine] = useState('');
  const [planQtyGearbox, setPlanQtyGearbox] = useState('');
  const [planFreqKm, setPlanFreqKm] = useState('');
  const [planFreqMonths, setPlanFreqMonths] = useState('');

  const vehicle = vehicles.find(v => v.id === id);

  const fetchData = async () => {
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
  };

  useEffect(() => { if (isAuthenticated && id) fetchData(); }, [isAuthenticated, id]);

  if (authLoading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) { navigate('/connexion'); return null; }
  if (!vehicle) return <div className="container py-20 text-center"><p>Véhicule non trouvé.</p><Button asChild className="mt-4"><Link to="/mon-espace">Retour</Link></Button></div>;

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintType) return;
    setSaving(true);
    const { error } = await supabase.from('maintenance_records').insert({
      vehicle_id: id!,
      maintenance_type: maintType,
      last_date: maintLastDate || null,
      next_date: maintNextDate || null,
      mileage_at_service: maintMileage ? parseInt(maintMileage) : null,
      notes: maintNotes.trim() || null,
    } as any);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Entretien ajouté !');
    setShowAddMaint(false);
    setMaintType(''); setMaintLastDate(''); setMaintNextDate(''); setMaintMileage(''); setMaintNotes('');
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
    // Create QR code entry (unpaid)
    const { error } = await supabase.from('vehicle_qr_codes').insert({ vehicle_id: id! } as any);
    if (error) { toast.error(error.message); return; }
    toast.info('QR code créé. Procédez au paiement de 1 000 FCFA pour l\'activer.');
    fetchData();
  };

  const handlePayQR = () => {
    // TODO: integrate with KkiaPay/GeniusPay for 1000 FCFA payment
    toast.info('Paiement QR code : fonctionnalité en cours d\'intégration. Contactez-nous sur WhatsApp.');
  };

  return (
    <>
      <Helmet><title>{vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : vehicle.license_plate} | Autopassion BJ</title></Helmet>

      <div className="min-h-[70vh] bg-muted/30">
        <section className="bg-secondary text-secondary-foreground py-8 md:py-12">
          <div className="container">
            <Link to="/mon-espace" className="inline-flex items-center gap-1 text-secondary-foreground/70 hover:text-white text-sm mb-4">
              <ArrowLeft className="h-4 w-4" /> Retour à Mon espace
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  {vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : 'Mon véhicule'}
                </h1>
                <div className="flex flex-wrap gap-3 text-secondary-foreground/70 text-sm mt-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vehicle.license_plate}</span>
                  {vehicle.year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {vehicle.year}</span>}
                  {vehicle.fuel_type && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type}</span>}
                  {vehicle.mileage && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {vehicle.mileage.toLocaleString()} km</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8 space-y-8">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* Carnet d'entretien */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Carnet d'entretien</h2>
                  <Button size="sm" onClick={() => setShowAddMaint(!showAddMaint)} className="gap-1.5"><Plus className="h-4 w-4" /> Ajouter</Button>
                </div>

                {showAddMaint && (
                  <form onSubmit={handleAddMaintenance} className="bg-card border border-border rounded-xl p-5 mb-4 shadow-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
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
                        <label className="block text-sm font-semibold mb-1">Kilométrage au service</label>
                        <input type="number" value={maintMileage} onChange={e => setMaintMileage(e.target.value)} placeholder="120000" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Notes</label>
                        <input type="text" value={maintNotes} onChange={e => setMaintNotes(e.target.value)} placeholder="Optionnel" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button type="button" variant="outline" onClick={() => setShowAddMaint(false)}>Annuler</Button>
                      <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}</Button>
                    </div>
                  </form>
                )}

                {records.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <Wrench className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun entretien enregistré. Ajoutez votre premier entretien.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.map(r => (
                      <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{r.maintenance_type}</h4>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                            {r.last_date && <span>Dernière : {new Date(r.last_date).toLocaleDateString('fr-FR')}</span>}
                            {r.next_date && <span className="text-primary font-medium">Prochaine : {new Date(r.next_date).toLocaleDateString('fr-FR')}</span>}
                            {r.mileage_at_service && <span>{r.mileage_at_service.toLocaleString()} km</span>}
                          </div>
                          {r.notes && <p className="text-xs text-muted-foreground mt-1 italic">{r.notes}</p>}
                        </div>
                        <button onClick={() => handleDeleteMaintenance(r.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Plan de lubrification */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Droplets className="h-5 w-5 text-primary" /> Plan de lubrification</h2>
                  <Button size="sm" variant="outline" onClick={() => setShowEditPlan(!showEditPlan)}>
                    {plan ? 'Modifier' : 'Configurer'}
                  </Button>
                </div>

                {showEditPlan && (
                  <form onSubmit={handleSavePlan} className="bg-card border border-border rounded-xl p-5 mb-4 shadow-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Button type="button" variant="outline" onClick={() => setShowEditPlan(false)}>Annuler</Button>
                      <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sauvegarder'}</Button>
                    </div>
                  </form>
                )}

                {!plan && !showEditPlan ? (
                  <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <Droplets className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun plan de lubrification configuré.</p>
                  </div>
                ) : plan && !showEditPlan ? (
                  <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {plan.oil_type_engine && <div><span className="text-muted-foreground text-xs block">Huile moteur</span><span className="font-semibold">{plan.oil_type_engine}</span></div>}
                    {plan.oil_type_gearbox && <div><span className="text-muted-foreground text-xs block">Huile boîte</span><span className="font-semibold">{plan.oil_type_gearbox}</span></div>}
                    {plan.oil_quantity_engine && <div><span className="text-muted-foreground text-xs block">Qté moteur</span><span className="font-semibold">{plan.oil_quantity_engine}</span></div>}
                    {plan.oil_quantity_gearbox && <div><span className="text-muted-foreground text-xs block">Qté boîte</span><span className="font-semibold">{plan.oil_quantity_gearbox}</span></div>}
                    {plan.change_frequency_km && <div><span className="text-muted-foreground text-xs block">Fréquence</span><span className="font-semibold">{plan.change_frequency_km.toLocaleString()} km</span></div>}
                    {plan.change_frequency_months && <div><span className="text-muted-foreground text-xs block">Fréquence</span><span className="font-semibold">{plan.change_frequency_months} mois</span></div>}
                  </div>
                ) : null}
              </section>

              {/* QR Code */}
              <section>
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><QrCode className="h-5 w-5 text-primary" /> QR Code carnet d'entretien</h2>
                <div className="bg-card border border-border rounded-xl p-6">
                  {!qrCode ? (
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">Générez un QR code unique pour accéder au carnet d'entretien de ce véhicule. À coller dans votre voiture !</p>
                      <p className="text-xs text-muted-foreground mb-4">Prix : <span className="font-bold text-foreground">1 000 FCFA</span> (paiement unique)</p>
                      <Button onClick={handleGenerateQR}>Générer mon QR code</Button>
                    </div>
                  ) : !qrCode.is_paid ? (
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-accent mx-auto mb-3" />
                      <p className="font-semibold mb-1">QR code créé</p>
                      <p className="text-sm text-muted-foreground mb-4">Finalisez le paiement de 1 000 FCFA pour activer votre QR code.</p>
                      <Button onClick={handlePayQR} className="bg-accent text-accent-foreground">Payer 1 000 FCFA</Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 inline-block mb-4">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/qr/' + qrCode.qr_token)}`}
                          alt="QR Code"
                          className="w-48 h-48 mx-auto"
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
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
