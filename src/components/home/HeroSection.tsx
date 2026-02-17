import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function HeroSection() {
  const t = useTranslation();

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Image de fond produit Bardahl */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
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

      <div className="container relative z-10 py-16 md:py-20">
        <div className="max-w-2xl animate-slide-up">
          {/* Titre principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            <span className="text-white">Performance </span>
            <span className="text-primary">Bardahl</span>
          </h1>

          {/* Description */}
          <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8">
            Huiles moteur, additifs et produits d'entretien avec la technologie exclusive
            <span className="text-primary font-semibold"> Polar Plus®</span>.
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 group shadow-lg" asChild>
              <Link to="/categories">
                Découvrir nos produits
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg"
              className="border border-white/30 text-white hover:border-white/50 hover:text-white font-bold backdrop-blur-sm bg-transparent hover:bg-transparent" asChild>
              <Link to="/selections/haute-performance">
                Haute Performance
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
