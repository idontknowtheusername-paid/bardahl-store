import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Shield, Truck, Award } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { OilSelectorModal } from './OilSelectorModal';

export function HeroSection() {
  const t = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[62vh] flex items-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800">
        {/* Fond décoratif Bardahl */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30" />
          {/* Cercle décoratif lumineux */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 80% 50%, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
            }}
          />
          {/* Lignes décoratives */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-px h-48 bg-gradient-to-b from-transparent via-primary/40 to-transparent hidden lg:block" />
          <div className="absolute right-24 top-1/4 w-32 h-px bg-gradient-to-r from-primary/20 to-transparent hidden lg:block" />
        </div>

        <div className="container relative z-10 py-14 md:py-16">
          <div className="max-w-xl mx-auto md:mx-0 text-center md:text-left animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Technologie Polar Plus®
            </div>

            {/* Titre */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Performance<br />
              <span className="text-primary">Bardahl</span>
            </h1>

            {/* Description */}
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-7 max-w-md mx-auto md:mx-0">
              Huiles moteur, additifs et produits d'entretien automobile pour protéger votre moteur durablement.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8 justify-center md:justify-start">
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm px-6 group shadow-lg w-full sm:w-auto"
              >
                <Search className="h-4 w-4 mr-2" />
                Trouver mon huile
              </Button>
              <Button
                size="lg"
                className="border border-white/25 text-white hover:border-white/50 font-semibold backdrop-blur-sm bg-transparent hover:bg-white/10 text-sm px-6 group w-full sm:w-auto"
                asChild
              >
                <Link to="/categories">
                  Nos produits
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Truck className="h-3.5 w-3.5 text-primary" />
                <span>Livraison au Bénin</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span>Produits authentiques</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OilSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
