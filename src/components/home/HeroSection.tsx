import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Stethoscope, Wrench, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { OilSelectorModal } from './OilSelectorModal';
import { motion } from 'framer-motion';

export function HeroSection() {
  const t = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-secondary">
        {/* Animated background elements — mobile simplified, desktop enhanced */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Mobile background - subtle gradient */}
          <div className="md:hidden absolute inset-0 bg-gradient-to-b from-secondary via-secondary/95 to-secondary/90" />

          {/* Desktop animated background */}
          <div className="hidden md:block">
            <motion.div
              className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl"
              animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl"
              animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 25, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Floating gear shapes */}
            <motion.div
              className="absolute top-1/4 right-[15%] w-16 h-16 border-2 border-accent/10 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute bottom-1/3 left-[10%] w-10 h-10 border border-accent/10 rounded-lg"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Mobile subtle elements */}
          <div className="md:hidden">
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-accent/3 blur-xl" />
            <div className="absolute bottom-20 left-5 w-24 h-24 rounded-full bg-primary/3 blur-xl" />
          </div>
        </div>

        <div className="container relative z-10 pt-2 pb-8 md:pt-8 md:pb-12 lg:pt-12 lg:pb-16">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse" />
              Entretien automobile & solutions moteur
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-3 sm:mb-6"
            >
              Prenez soin de votre moteur
              <br />
              <motion.span
                className="text-accent inline-block mt-1 sm:mt-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Nous vous aidons à choisir
              </motion.span>
            </motion.h1>

            {/* Trust checkmarks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center items-center mb-4 sm:mb-8"
            >
              {['Produits certifiés', 'Assistance WhatsApp rapide', 'Conseils d\'experts automobile'].map((text, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-base justify-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span className="whitespace-nowrap">{text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-3 sm:mb-4"
            >
              <div className="flex flex-row gap-3 w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={() => setModalOpen(true)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs sm:text-base px-3 sm:px-6 group shadow-lg flex-1 sm:flex-none h-9 sm:h-12"
                >
                  <Search className="h-3.5 w-3.5 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  Trouver mon huile
                </Button>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs sm:text-base px-3 sm:px-6 group flex-1 sm:flex-none h-9 sm:h-12"
                  asChild
                >
                  <Link to="/diagnostic">
                    <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Diagnostic
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                className="border border-white/25 text-white hover:border-white/50 font-semibold backdrop-blur-sm bg-transparent hover:bg-white/10 text-xs sm:text-base px-4 sm:px-6 group w-full sm:w-auto h-9 sm:h-12 max-w-xs"
                asChild
              >
                <Link to="/entretien">
                  <Wrench className="h-3.5 w-3.5 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  Entretenir mon moteur
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <OilSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
