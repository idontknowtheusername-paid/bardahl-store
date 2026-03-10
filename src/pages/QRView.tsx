import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, ClipboardList, Droplets, Calendar, Gauge, Fuel, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Vehicle {
  id: string;
  license_plate: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  fuel_type: string | null;
  mileage: number | null;
}

interface MaintenanceRecord {
  id: string;
  maintenance_type: string;
  last_date: string | null;
  next_date: string | null;
  mileage_at_service: number | null;
  notes: string | null;
}

interface LubricationPlan {
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

export default function QRView() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [plan, setPlan] = useState<LubricationPlan | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      // Get QR code → vehicle_id
      const { data: qr, error: qrError } = await supabase
        .from('vehicle_qr_codes')
        .select('vehicle_id, is_paid')
        .eq('qr_token', token)
        .maybeSingle();

      if (qrError || !qr) {
        setError('QR code invalide ou introuvable.');
        setLoading(false);
        return;
      }
      if (!qr.is_paid) {
        setError('Ce QR code n\'est pas encore activé.');
        setLoading(false);
        return;
      }

      // Fetch vehicle, maintenance, plan
      const [{ data: v }, { data: recs }, { data: lub }] = await Promise.all([
        supabase.from('customer_vehicles').select('*').eq('id', qr.vehicle_id).single(),
        supabase.from('maintenance_records').select('*').eq('vehicle_id', qr.vehicle_id).order('last_date', { ascending: false }),
        supabase.from('lubrication_plans').select('*').eq('vehicle_id', qr.vehicle_id).maybeSingle(),
      ]);

      setVehicle(v as unknown as Vehicle);
      setRecords((recs as unknown as MaintenanceRecord[]) || []);
      setPlan(lub as unknown as LubricationPlan | null);
      setLoading(false);
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Accès impossible</h1>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <Link to="/" className="text-primary underline text-sm">Retour au site</Link>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Carnet d'entretien {vehicle?.license_plate} | Autopassion BJ</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-[70vh] bg-muted/30">
        <section className="bg-secondary text-secondary-foreground py-8">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <ClipboardList className="h-3.5 w-3.5" /> Carnet d'entretien digital
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              {vehicle?.brand && vehicle?.model ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule'}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-secondary-foreground/70 text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vehicle?.license_plate}</span>
              {vehicle?.year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {vehicle.year}</span>}
              {vehicle?.fuel_type && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type}</span>}
              {vehicle?.mileage && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {vehicle.mileage.toLocaleString()} km</span>}
            </div>
          </div>
        </section>

        <div className="container py-8 max-w-2xl space-y-8">
          {/* Historique entretien */}
          <section>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><ClipboardList className="h-5 w-5 text-primary" /> Historique d'entretien</h2>
            {records.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Aucun entretien enregistré.</p>
            ) : (
              <div className="space-y-3">
                {records.map(r => (
                  <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-sm">{r.maintenance_type}</h4>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      {r.last_date && <span>Fait le : {new Date(r.last_date).toLocaleDateString('fr-FR')}</span>}
                      {r.next_date && <span className="text-primary font-medium">Prochain : {new Date(r.next_date).toLocaleDateString('fr-FR')}</span>}
                      {r.mileage_at_service && <span>{r.mileage_at_service.toLocaleString()} km</span>}
                    </div>
                    {r.notes && <p className="text-xs text-muted-foreground mt-1 italic">{r.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Plan de lubrification */}
          {plan && (
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Droplets className="h-5 w-5 text-primary" /> Plan de lubrification</h2>
              <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-2 gap-4 text-sm">
                {plan.oil_type_engine && <div><span className="text-muted-foreground text-xs block">🛢️ Huile moteur</span><span className="font-semibold">{plan.oil_type_engine}</span></div>}
                {plan.engine_cleaner && <div><span className="text-muted-foreground text-xs block">🧹 Nettoyant moteur</span><span className="font-semibold">{plan.engine_cleaner}</span></div>}
                {plan.oil_type_gearbox && <div><span className="text-muted-foreground text-xs block">⚙️ Huile boîte</span><span className="font-semibold">{plan.oil_type_gearbox}</span></div>}
                {plan.gearbox_cleaner && <div><span className="text-muted-foreground text-xs block">🧹 Nettoyant boîte</span><span className="font-semibold">{plan.gearbox_cleaner}</span></div>}
                {plan.oil_quantity_engine && <div><span className="text-muted-foreground text-xs block">📏 Qté moteur</span><span className="font-semibold">{plan.oil_quantity_engine}</span></div>}
                {plan.oil_quantity_gearbox && <div><span className="text-muted-foreground text-xs block">📏 Qté boîte</span><span className="font-semibold">{plan.oil_quantity_gearbox}</span></div>}
                {plan.coolant_type && <div><span className="text-muted-foreground text-xs block">❄️ Liquide refroidissement</span><span className="font-semibold">{plan.coolant_type}</span></div>}
                {plan.brake_fluid_type && <div><span className="text-muted-foreground text-xs block">🔴 Liquide de frein</span><span className="font-semibold">{plan.brake_fluid_type}</span></div>}
                {plan.radiator_cleaner && <div><span className="text-muted-foreground text-xs block">🧹 Nettoyant radiateur</span><span className="font-semibold">{plan.radiator_cleaner}</span></div>}
                {plan.change_frequency_km && <div><span className="text-muted-foreground text-xs block">📅 Fréquence</span><span className="font-semibold">{plan.change_frequency_km.toLocaleString()} km</span></div>}
                {plan.change_frequency_months && <div><span className="text-muted-foreground text-xs block">📅 Fréquence</span><span className="font-semibold">{plan.change_frequency_months} mois</span></div>}
              </div>
            </section>
          )}

          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Propulsé par <Link to="/" className="text-primary font-semibold">Autopassion BJ</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
