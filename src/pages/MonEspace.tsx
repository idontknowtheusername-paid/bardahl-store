import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, Plus, Trash2, LogOut, User, Fuel, Gauge, Calendar, MapPin, Loader2, ChevronRight, Settings, Mail, KeyRound, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function MonEspace() {
  const { isAuthenticated, isLoading: authLoading, profile, vehicles, logout, addVehicle, deleteVehicle, refreshProfile } = useCustomerAuth();
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

  // Settings form
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/connexion');
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || '');
      setEditEmail(profile.email || '');
      setEditCity(profile.city || '');
    }
  }, [profile]);

  if (authLoading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return null;

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) { toast.error("L'immatriculation est obligatoire."); return; }
    setIsAdding(true);
    const { error } = await addVehicle({
      license_plate: plate.trim().toUpperCase(),
      brand: brand.trim() || null, model: model.trim() || null,
      year: year ? parseInt(year) : null, fuel_type: fuelType || null,
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

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) { toast.error('Le nom est obligatoire.'); return; }
    setSavingProfile(true);
    const { error } = await supabase.from('customers').update({
      full_name: editName.trim(),
      email: editEmail.trim() || null,
      city: editCity.trim() || null,
    }).eq('id', profile!.id);
    setSavingProfile(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Profil mis à jour !');
    await refreshProfile();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Min. 6 caractères.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Mot de passe modifié !');
    setNewPassword(''); setConfirmPassword('');
  };

  return (
    <>
      <Helmet><title>Mon espace | Autopassion BJ</title></Helmet>

      <div className="min-h-[70vh] bg-muted/30">
        {/* Header */}
        <section className="bg-secondary text-secondary-foreground py-6 md:py-10">
          <div className="container">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white truncate">
                    {profile?.full_name} 👋
                  </h1>
                  <p className="text-secondary-foreground/60 text-xs truncate">
                    {profile?.phone} {profile?.email && `· ${profile.email}`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="border border-white/20 text-secondary-foreground hover:bg-white/10 shrink-0">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline ml-1.5">Déconnexion</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Content with Tabs */}
        <div className="container py-5">
          <Tabs defaultValue="vehicules" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-5">
              <TabsTrigger value="vehicules" className="gap-1.5 text-xs sm:text-sm">
                <Car className="h-4 w-4 hidden sm:block" /> Mes véhicules
              </TabsTrigger>
              <TabsTrigger value="parametres" className="gap-1.5 text-xs sm:text-sm">
                <Settings className="h-4 w-4 hidden sm:block" /> Paramètres
              </TabsTrigger>
            </TabsList>

            {/* TAB: Véhicules */}
            <TabsContent value="vehicules" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" /> Véhicules ({vehicles.length})
                </h2>
                <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddVehicle} className="bg-card border border-border rounded-xl p-4 shadow-card">
                  <h3 className="font-bold mb-3 text-sm">Nouveau véhicule</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Immatriculation *</label>
                      <input type="text" placeholder="AB-1234-CD" value={plate} onChange={(e) => setPlate(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Marque</label>
                      <input type="text" placeholder="Toyota" value={brand} onChange={(e) => setBrand(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Modèle</label>
                      <input type="text" placeholder="Corolla" value={model} onChange={(e) => setModel(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Année</label>
                      <input type="number" placeholder="2018" value={year} onChange={(e) => setYear(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Carburant</label>
                      <div className="flex gap-2">
                        {['Diesel', 'Essence'].map(t => (
                          <button key={t} type="button" onClick={() => setFuelType(t)}
                            className={`flex-1 p-2 rounded-lg border-2 text-xs font-semibold transition-all ${fuelType === t ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Kilométrage</label>
                      <input type="number" placeholder="120000" value={mileage} onChange={(e) => setMileage(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}><X className="h-4 w-4 mr-1" /> Annuler</Button>
                    <Button type="submit" size="sm" disabled={isAdding}>
                      {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Enregistrer</>}
                    </Button>
                  </div>
                </form>
              )}

              {vehicles.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold mb-1">Aucun véhicule</p>
                  <p className="text-sm text-muted-foreground">Ajoutez votre premier véhicule.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map(v => (
                    <Link key={v.id} to={`/mon-espace/vehicule/${v.id}`} className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-md hover:border-primary/30 transition-all flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{v.license_plate}</span>
                        </div>
                        <h3 className="font-bold text-sm truncate">
                          {v.brand && v.model ? `${v.brand} ${v.model}` : 'Véhicule'}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground mt-0.5">
                          {v.year && <span>{v.year}</span>}
                          {v.fuel_type && <span>· {v.fuel_type}</span>}
                          {v.mileage && <span>· {v.mileage.toLocaleString()} km</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={(e) => { e.preventDefault(); handleDelete(v.id); }} className="text-muted-foreground hover:text-destructive p-1.5 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB: Paramètres */}
            <TabsContent value="parametres" className="space-y-5">
              {/* Profile info */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-card">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-4"><User className="h-4 w-4 text-primary" /> Informations personnelles</h3>
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Nom complet *</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="votre@email.com"
                        className="w-full pl-10 pr-3 p-2.5 rounded-lg border border-input bg-background text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Ville</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="Cotonou"
                        className="w-full pl-10 pr-3 p-2.5 rounded-lg border border-input bg-background text-sm" />
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-2">
                      📞 Téléphone : <span className="font-semibold text-foreground">{profile?.phone}</span>
                      <span className="text-muted-foreground ml-1">(non modifiable)</span>
                    </p>
                  </div>
                  <Button type="submit" size="sm" disabled={savingProfile} className="w-full sm:w-auto">
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Sauvegarder</>}
                  </Button>
                </form>
              </div>

              {/* Change password */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-card">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-4"><KeyRound className="h-4 w-4 text-primary" /> Changer le mot de passe</h3>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Nouveau mot de passe</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 caractères"
                      className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Confirmer</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Retapez le mot de passe"
                      className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" required minLength={6} />
                  </div>
                  <Button type="submit" size="sm" variant="outline" disabled={savingPassword} className="w-full sm:w-auto">
                    {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <><KeyRound className="h-4 w-4 mr-1" /> Modifier</>}
                  </Button>
                </form>
              </div>

              {/* Logout */}
              <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full gap-1.5">
                <LogOut className="h-4 w-4" /> Se déconnecter
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
