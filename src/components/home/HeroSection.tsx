import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Stethoscope, Wrench, CheckCircle, MessageCircle, Smartphone } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { OilSelectorModal } from './OilSelectorModal';
import { PopularProductsCarousel } from '@/components/product/PopularProductsCarousel';
import { motion } from 'framer-motion';

export function HeroSection() {
  const t = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-secondary h-[85vh] flex flex-col">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary/95 to-secondary/90" />
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-accent/3 blur-xl" />
          <div className="absolute bottom-20 left-5 w-24 h-24 rounded-full bg-primary/3 blur-xl" />
        </div>

        <div className="container relative z-10 pt-2 pb-2 md:pt-3 md:pb-2 flex-shrink-0">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs font-bold px-3 py-1 rounded-full mb-2 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Entretien automobile & solutions moteur
            </motion.div>

            {/* Three mentions - 2 lines on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-1.5 justify-center items-center mb-0"
            >
              {/* First line: 2 items on desktop, stacked on mobile */}
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 justify-center items-center">
                <div className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                  <span>Produits certifiés</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm">
                  <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                  <span>Suivi d'entretien sur mobile</span>
                </div>
              </div>
              {/* Second line: 1 item centered */}
              <div className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                <span>Conseillers auto & assistance WhatsApp</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Popular Products Carousel inside Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative z-10 overflow-hidden mt-1 md:mt-1.5"
        >
          <PopularProductsCarousel
            title="Produits les plus populaires"
            description="Les produits préférés de nos clients"
            showDescription={false}
            showSeeAll={true}
            limit={6}
            compact={true}
            className="py-1 md:py-2 !bg-transparent [&_h2]:text-white [&_span]:text-accent [&_.text-muted-foreground]:text-white/60"
          />
        </motion.div>

        {/* CTAs at very bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="relative z-10 pb-4 md:pb-6 pt-3 md:pt-9 flex-shrink-0"
        >
          <div className="container">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  size="lg"
                  onClick={() => setModalOpen(true)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs sm:text-sm px-3 sm:px-4 group shadow-lg h-9 sm:h-10 flex-1 min-w-[140px] sm:flex-initial"
                >
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Trouver mon huile
                </Button>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs sm:text-sm px-3 sm:px-4 group h-9 sm:h-10 flex-1 min-w-[140px] sm:flex-initial"
                  asChild
                >
                  <Link to="/diagnostic">
                    <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    Diagnostic moteur
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="border border-white/25 text-white hover:border-white/50 font-semibold backdrop-blur-sm bg-transparent hover:bg-white/10 text-xs sm:text-sm px-3 sm:px-4 group h-9 sm:h-10 w-full sm:w-auto"
                  asChild
                >
                  <Link to="/entretien">
                    <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    Entretenir mon véhicule
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <OilSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
