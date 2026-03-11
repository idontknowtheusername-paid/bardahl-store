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
      <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-secondary">
        {/* Animated background elements — desktop only */}
        <div className="absolute inset-0 overflow-hidden hidden md:block pointer-events-none">
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

        <div className="container relative z-10 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-sm font-bold px-4 py-2 rounded-full mb-5 backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Entretien automobile & solutions moteur
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
            >
              Prenez soin de votre moteur.
              <br />
              <motion.span
                className="text-accent inline-block"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Nous vous aidons à choisir.
              </motion.span>
            </motion.h1>

            {/* Trust checkmarks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8"
            >
              {['Produits certifiés', 'Assistance WhatsApp rapide', 'Conseils d\'experts automobile'].map((text, i) => (
                <div key={i} className="flex items-center gap-1.5 text-white/80 text-xs sm:text-sm">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-4"
            >
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                className="border border-white/25 text-white hover:border-white/50 font-semibold backdrop-blur-sm bg-transparent hover:bg-white/10 text-base px-6 group w-full sm:w-auto"
                asChild
              >
                <Link to="/entretien">
                  <Wrench className="h-5 w-5 mr-2" />
                  Entretenir mon moteur
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
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
