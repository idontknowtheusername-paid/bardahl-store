import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Shield, Truck, Award, Stethoscope, Wrench, ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { OilSelectorModal } from './OilSelectorModal';

export function HeroSection() {
  const t = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const whatsappUrl = `https://wa.me/22996786284?text=${encodeURIComponent("Bonjour, j'aimerais un conseil pour mon véhicule")}`;

  return (
    <>
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-secondary" style={{ height: '70vh' }}>
        <div className="container relative z-10 py-14 md:py-16">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-sm font-bold px-4 py-2 rounded-full mb-5 backdrop-blur-sm">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Entretien automobile & solutions moteur
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Prenez soin de votre moteur.
              <br />
              <span className="text-accent">Nous vous aidons à choisir.</span>
            </h1>

            {/* Description */}
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-6 max-w-xl mx-auto">
              Huiles moteur, additifs et solutions pour protéger votre véhicule et prolonger la durée de vie de votre moteur.
            </p>

            {/* Trust checkmarks */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Produits certifiés</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Assistance WhatsApp rapide</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Conseils d'experts automobile</span>
              </div>
            </div>

            {/* 3 Main CTAs — responsive layout */}
            <div className="flex flex-col gap-3 mb-8 justify-center">
              {/* Mobile: 2 buttons on first row */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => setModalOpen(true)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base px-6 group shadow-lg w-full sm:w-auto"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Trouver mon huile
                </Button>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-6 group w-full sm:w-auto"
                  asChild
                >
                  <Link to="/diagnostic">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Diagnostic
                  </Link>
                </Button>
              </div>
              {/* Third button centered below on mobile, inline on desktop */}
              <div className="flex justify-center sm:hidden">
                <Button
                  size="lg"
                  className="border border-white/25 text-white hover:border-white/50 font-semibold backdrop-blur-sm bg-transparent hover:bg-white/10 text-base px-6 group w-full"
                  asChild
                >
                  <Link to="/entretien">
                    <Wrench className="h-5 w-5 mr-2" />
                    Entretenir mon moteur
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              {/* Desktop: show third button inline */}
              <div className="hidden sm:flex justify-center -mt-3">
                <Button
                  size="lg"
                  className="border border-white/25 text-white hover:border-white/50 font-semibold backdrop-blur-sm bg-transparent hover:bg-white/10 text-base px-6 group"
                  asChild
                >
                  <Link to="/entretien">
                    <Wrench className="h-5 w-5 mr-2" />
                    Entretenir mon moteur
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OilSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
