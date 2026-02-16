import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function HeroSection() {
  const t = useTranslation();

  return (
    <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-[hsl(0,0%,12%)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(0,0%,12%)] via-[hsl(0,0%,12%)]/95 to-[hsl(0,0%,12%)]/60" />
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
        <div className="absolute inset-0 bg-gradient-to-l from-primary/30 to-transparent" />
      </div>

      <div className="container relative z-10 py-16 md:py-24">
        <div className="max-w-2xl animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
            {t.heroTag}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            {t.heroTitle1}
            <span className="text-primary block">{t.heroTitle2}</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
            {t.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 group" asChild>
              <Link to="/categories">
                {t.heroCta}
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg"
              className="border-white/30 text-white hover:bg-white/10 font-bold text-base" asChild>
              <Link to="/a-propos">{t.heroSecondary}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
