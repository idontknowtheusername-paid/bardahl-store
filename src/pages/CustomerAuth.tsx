import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, Phone, KeyRound, User, Mail, CreditCard, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { toast } from 'sonner';

export default function CustomerAuth() {
  const { isAuthenticated, login, register } = useCustomerAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  if (isAuthenticated) {
    navigate('/mon-espace');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setIsLoading(true);
    const { error } = await login(identifier.trim(), password);
    setIsLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Connexion réussie !');
      navigate('/mon-espace');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !regPassword) return;
    if (regPassword.length < 6) { toast.error('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setIsLoading(true);
    const { error } = await register({
      full_name: fullName.trim(),
      phone: phone.trim(),
      password: regPassword,
      email: email.trim() || undefined,
      license_plate: licensePlate.trim() || undefined,
    });
    setIsLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Compte créé avec succès !');
      navigate('/mon-espace');
    }
  };

  return (
    <>
      <Helmet>
        <title>Mon espace véhicule | Autopassion BJ</title>
        <meta name="description" content="Connectez-vous pour gérer vos véhicules, votre carnet d'entretien et votre plan de lubrification." />
      </Helmet>

      <div className="min-h-[70vh] bg-muted/30">
        <section className="bg-secondary text-secondary-foreground py-10 md:py-14">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Car className="h-3.5 w-3.5" />
              Mon espace véhicule
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-secondary-foreground/70 max-w-md mx-auto">
              {mode === 'login'
                ? 'Connectez-vous avec votre numéro de téléphone ou une plaque d\'immatriculation.'
                : 'Créez votre compte pour gérer vos véhicules et suivre votre entretien.'}
            </p>
          </div>
        </section>

        <div className="container py-10">
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card">
              {/* Tabs */}
              <div className="flex mb-6 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'login' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'register' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  Inscription
                </button>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Numéro de téléphone ou immatriculation</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="+229 XX XX XX XX ou AB-1234-CD"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Se connecter'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Nom complet *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Numéro de téléphone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="+229 96 78 62 84" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Email (optionnel)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="email" placeholder="jean@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Mot de passe *</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Min. 6 caractères" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Immatriculation véhicule (optionnel)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="AB-1234-CD" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer mon compte"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
