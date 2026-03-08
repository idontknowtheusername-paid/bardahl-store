import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, Phone, KeyRound, User, Mail, CreditCard, Loader2, Eye, EyeOff, Shield, Wrench, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { toast } from 'sonner';
import authIllustration from '@/assets/auth-illustration.jpg';

export default function CustomerAuth() {
  const { isAuthenticated, login, register } = useCustomerAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/mon-espace');
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setIsLoading(true);
    const { error } = await login(identifier.trim(), password);
    setIsLoading(false);
    if (error) toast.error(error);
    else { toast.success('Connexion réussie !'); navigate('/mon-espace'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !regPassword) return;
    if (regPassword.length < 6) { toast.error('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setIsLoading(true);
    const { error } = await register({
      full_name: fullName.trim(), phone: phone.trim(), password: regPassword,
      email: email.trim() || undefined, license_plate: licensePlate.trim() || undefined,
    });
    setIsLoading(false);
    if (error) toast.error(error);
    else { toast.success('Compte créé avec succès !'); navigate('/mon-espace'); }
  };

  const features = [
    { icon: Car, text: 'Gérez tous vos véhicules' },
    { icon: Wrench, text: 'Carnet d\'entretien numérique' },
    { icon: Shield, text: 'QR code pour accès rapide' },
  ];

  return (
    <>
      <Helmet>
        <title>{mode === 'login' ? 'Connexion' : 'Inscription'} | Autopassion BJ</title>
        <meta name="description" content="Connectez-vous pour gérer vos véhicules et votre carnet d'entretien." />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
        {/* Left: Illustration panel (hidden on mobile, shown on lg+) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-secondary overflow-hidden">
          <img src={authIllustration} alt="Service automobile" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-secondary/30" />
          <div className="relative z-10 flex flex-col justify-end p-10 xl:p-14">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 w-fit">
              <Car className="h-3.5 w-3.5" />
              Autopassion BJ
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white mb-3 leading-tight">
              Votre garage<br />numérique
            </h2>
            <p className="text-secondary-foreground/70 text-sm mb-8 max-w-sm">
              Suivez l'entretien de vos véhicules, accédez à votre plan de lubrification et partagez votre carnet via QR code.
            </p>
            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form panel */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 bg-muted/30">
          <div className="w-full max-w-[420px]">
            {/* Mobile hero */}
            <div className="lg:hidden text-center mb-6">
              <div className="relative h-36 rounded-2xl overflow-hidden mb-4">
                <img src={authIllustration} alt="Service automobile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">
                {mode === 'login' ? 'Bon retour !' : 'Bienvenue'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'login' ? 'Accédez à votre espace véhicule.' : 'Créez votre compte en 30 secondes.'}
              </p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-extrabold text-foreground">
                {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'login' ? 'Connectez-vous à votre espace véhicule.' : 'Rejoignez Autopassion en quelques clics.'}
              </p>
            </div>

            {/* Card */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-7 shadow-card">
              {/* Tabs */}
              <div className="flex mb-5 bg-muted rounded-xl p-1">
                <button onClick={() => setMode('login')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                  Connexion
                </button>
                <button onClick={() => setMode('register')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                  Inscription
                </button>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Téléphone ou immatriculation</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="+229 XX XX XX XX ou AB-1234-CD" value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full py-3 font-bold text-sm rounded-xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Se connecter'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Nom complet *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Téléphone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="+229 96 78 62 84" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Email <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="email" placeholder="jean@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Mot de passe *</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Min. 6 caractères" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Immatriculation <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="AB-1234-CD" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full py-3 font-bold text-sm rounded-xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer mon compte'}
                  </Button>
                </form>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Sécurisé</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 100% gratuit</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
