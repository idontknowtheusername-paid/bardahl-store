import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Award } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCarouselSkeleton } from '@/components/product/ProductCardSkeleton';
import { useFeaturedProducts } from '@/hooks/use-supabase-api';
import { staticProducts } from '@/data/products';
import { useTranslation } from '@/context/LanguageContext';
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from '@/components/ui/carousel';

export function HeroSection() {
  const t = useTranslation();
  const { data: apiProducts, isLoading } = useFeaturedProducts();
  
  const featuredProducts = apiProducts && apiProducts.length > 0
    ? apiProducts
    : staticProducts.filter(p => p.isBestseller || p.isNew).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/60" />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/30 to-transparent" />
        </div>

        <div className="container relative z-10 py-16 md:py-24">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
              <Zap className="h-4 w-4" />
              {t.heroTag}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary-foreground leading-tight mb-6">
              {t.heroTitle1}
              <span className="text-primary block">{t.heroTitle2}</span>
            </h1>
            <p className="text-secondary-foreground/70 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 group" asChild>
                <Link to="/collections">
                  {t.heroCta}
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg"
                className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 font-bold text-base" asChild>
                <Link to="/a-propos">{t.heroSecondary}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t.popularProducts}</h2>
            <Button variant="link" className="p-0 text-primary font-semibold shrink-0 ml-4" asChild>
              <Link to="/collections">{t.seeAll}</Link>
            </Button>
          </div>

          {isLoading ? (
            <ProductCarouselSkeleton count={4} />
          ) : (
            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {featuredProducts.map((product, index) => (
                  <CarouselItem key={product.id} className="pl-4 basis-[45%] sm:basis-[35%] md:basis-1/4 lg:basis-1/5">
                    <ProductCard product={product} className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
              <CarouselNext className="-right-4 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
            </Carousel>
          )}
        </div>
      </section>
    </>
  );
}
