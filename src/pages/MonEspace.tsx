import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, Plus, Trash2, LogOut, User, Fuel, Gauge, Calendar, MapPin, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { toast } from 'sonner';

export default function MonEspace() {
  const { isAuthenticated, isLoading: authLoading, profile, vehicles, logout, addVehicle, deleteVehicle } = useCustomerAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Add vehicle form
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [mileage, setMileage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/connexion');
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) { toast.error("L'immatriculation est obligatoire."); return; }
    setIsAdding(true);
    const { error } = await addVehicle({
      license_plate: plate.trim().toUpperCase(),
      brand: brand.trim() || null,
      model: model.trim() || null,
      year: year ? parseInt(year) : null,
      fuel_type: fuelType || null,
      mileage: mileage ? parseInt(mileage) : null,
    });
    setIsAdding(false);
    if (error) { toast.error(error); return; }
    toast.success('Véhicule ajouté !');
    setShowAddForm(false);
    setPlate(''); setBrand(''); setModel(''); setYear(''); setFuelType(''); setMileage('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce véhicule ?')) return;
    await deleteVehicle(id);
    toast.success('Véhicule supprimé.');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Mon espace véhicule | Autopassion BJ</title>
      </Helmet>

      <div className="min-h-[70vh] bg-muted/30">
        <section className="bg-secondary text-secondary-foreground py-8 md:py-14">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1 truncate">
                  Bonjour, {profile?.full_name} 👋
                </h1>
                <p className="text-secondary-foreground/70 text-xs sm:text-sm flex flex-wrap items-center gap-1">
                  <User className="inline h-3.5 w-3.5 shrink-0" /><span>{profile?.phone}</span>
                  {profile?.email && <span className="ml-2 truncate">{profile.email}</span>}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10 gap-1.5 self-start sm:self-center shrink-0">
                <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Déconnexion</span><span className="sm:hidden">Sortir</span>
              </Button>
            </div>
          </div>
        </section>

        <div className="container py-10">
          {/* Vehicles section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" /> Mes véhicules ({vehicles.length})
            </h2>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </div>

          {/* Add vehicle form */}
          {showAddForm && (
            <form onSubmit={handleAddVehicle} className="bg-card border border-border rounded-xl p-5 mb-6 shadow-card">
              <h3 className="font-bold mb-4">Nouveau véhicule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Immatriculation *</label>
                  <input type="text" placeholder="AB-1234-CD" value={plate} onChange={(e) => setPlate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Marque</label>
                  <input type="text" placeholder="Toyota" value={brand} onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Modèle</label>
                  <input type="text" placeholder="Corolla" value={model} onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Année</label>
                  <input type="number" placeholder="2018" value={year} onChange={(e) => setYear(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Carburant</label>
                  <div className="flex gap-2">
                    {['Diesel', 'Essence'].map(t => (
                      <button key={t} type="button" onClick={() => setFuelType(t)}
                        className={`flex-1 p-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${fuelType === t ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Kilométrage</label>
                  <input type="number" placeholder="120000" value={mileage} onChange={(e) => setMileage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Annuler</Button>
                <Button type="submit" disabled={isAdding} className="bg-primary text-primary-foreground">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
                </Button>
              </div>
            </form>
          )}

          {/* Vehicle list */}
          {vehicles.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold mb-1">Aucun véhicule enregistré</p>
              <p className="text-sm text-muted-foreground">Ajoutez votre premier véhicule pour commencer à suivre son entretien.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.map(v => (
                <Link key={v.id} to={`/mon-espace/vehicule/${v.id}`} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md hover:border-primary/30 transition-all block">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                        <MapPin className="h-3 w-3" /> {v.license_plate}
                      </div>
                      <h3 className="font-bold text-lg">
                        {v.brand && v.model ? `${v.brand} ${v.model}` : 'Véhicule'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.preventDefault(); handleDelete(v.id); }} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {v.year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {v.year}</span>}
                    {v.fuel_type && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {v.fuel_type}</span>}
                    {v.mileage && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {v.mileage.toLocaleString()} km</span>}
                  </div>
                  <p className="text-xs text-primary mt-3 font-medium">Voir carnet d'entretien →</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
