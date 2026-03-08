import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Shield, Truck, Award, Stethoscope, Wrench, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { OilSelectorModal } from './OilSelectorModal';

export function HeroSection() {
  const t = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[62vh] flex items-center overflow-hidden bg-secondary">

        <div className="container relative z-10 py-14 md:py-16">
          <div className="max-w-2xl mx-auto text-center animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs font-bold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Entretien automobile & solutions moteur
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Prenez soin de votre moteur.
              <br />
              <span className="text-accent">Nous vous guidons.</span>
            </h1>

            {/* Description */}
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
              Huiles moteur, additifs, diagnostic intelligent et carnet d'entretien digital pour votre véhicule.
            </p>

            {/* 3 Main CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8 justify-center">
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-sm px-6 group shadow-lg w-full sm:w-auto"
              >
                <Search className="h-4 w-4 mr-2" />
                Trouver mon huile
              </Button>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm px-6 group w-full sm:w-auto"
                asChild
              >
                <Link to="/diagnostic">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Diagnostiquer ma voiture
                </Link>
              </Button>
              <Button
                size="lg"
                className="border border-white/25 text-white hover:border-white/50 font-semibold backdrop-blur-sm bg-transparent hover:bg-white/10 text-sm px-6 group w-full sm:w-auto"
                asChild
              >
                <Link to="/entretien">
                  <Wrench className="h-4 w-4 mr-2" />
                  Entretenir mon moteur
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Truck className="h-3.5 w-3.5 text-accent" />
                <span>Livraison rapide</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Shield className="h-3.5 w-3.5 text-accent" />
                <span>Paiement sécurisé Mobile Money</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Award className="h-3.5 w-3.5 text-accent" />
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