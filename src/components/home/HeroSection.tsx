import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function HeroSection() {
  const t = useTranslation();

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary/20">
      {/* Image de fond produit Bardahl */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-2/3">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1635784553857-4a87fb285e44?w=1600&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </div>
      </div>

      {/* Logo Bardahl en overlay */}
      <div className="absolute right-8 top-8 opacity-10 hidden lg:block">
        <img
          src="/Bardahl_idiSpcDptj_1.svg"
          alt="Bardahl Logo"
          className="h-64 w-64"
        />
      </div>

      <div className="container relative z-10 py-16 md:py-24">
        <div className="max-w-2xl animate-slide-up">
          {/* Tagline avec icônes */}
          <div className="inline-flex items-center gap-3 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>Depuis 1939 • Technologie Polar Plus®</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            <span className="text-white">Performance </span>
            <span className="text-primary block">Bardahl</span>
            <span className="text-white text-2xl md:text-3xl lg:text-4xl font-normal mt-4 block">
              pour votre moteur
            </span>
          </h1>

          {/* Description améliorée */}
          <div className="space-y-4 mb-8 max-w-xl">
            <p className="text-white/90 text-lg md:text-xl leading-relaxed">
              Huiles moteur, additifs et produits d'entretien avec la technologie exclusive
              <span className="text-primary font-semibold"> Polar Plus®</span> et
              <span className="text-primary font-semibold"> Fullerène C60</span>.
            </p>

            {/* Points clés */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Protection maximale</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span>Performance optimale</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span>Livraison gratuite dès 50 000 FCFA</span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 group shadow-lg" asChild>
              <Link to="/categories">
                Découvrir nos produits
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg"
              className="border-white/30 text-white hover:bg-white/10 font-bold text-base backdrop-blur-sm" asChild>
              <Link to="/selections/haute-performance">
                <Sparkles className="h-5 w-5 mr-2" />
                Haute Performance
              </Link>
            </Button>
          </div>

          {/* Appel vers le sélecteur d'huile */}
          <div className="mt-8">
            <p className="text-white/70 text-sm mb-2">Vous ne savez pas quelle huile choisir ?</p>
            <Link
              to="/#oil-selector"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm transition-colors"
            >
              <ArrowRight className="h-4 w-4 mr-1 rotate-90" />
              Trouvez l'huile idéale pour votre véhicule
            </Link>
          </div>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}
