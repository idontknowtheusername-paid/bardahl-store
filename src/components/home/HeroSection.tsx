import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCarouselSkeleton } from '@/components/product/ProductCardSkeleton';
import { useFeaturedProducts } from '@/hooks/use-supabase-api';
import { staticProducts } from '@/data/products';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function HeroSection() {
  const { data: apiProducts, isLoading } = useFeaturedProducts();
  
  // Use API data if available, fallback to static bestsellers
  const featuredProducts = apiProducts && apiProducts.length > 0
    ? apiProducts
    : staticProducts.filter(p => p.isBestseller || p.isNew).slice(0, 8);

  return (
    <>
      {/* Hero Compact - 60vh */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/CBEEF825-5683-4ADE-9480-376346E815F2.jpeg"
            alt="Lingerie élégante Cannesh - Collection Bénin"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>

        {/* Content - Centré */}
        <div className="container relative z-10 px-4">
          <div className="max-w-2xl mx-auto text-center animate-slide-up">
            <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-3">
              Cannesh Lingerie • Bénin
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-background leading-tight mb-4">
              Sublimez votre féminité avec élégance
            </h1>
            <p className="text-background/90 text-base md:text-lg mb-6 leading-relaxed max-w-xl mx-auto">
              Découvrez notre collection exclusive de lingerie raffinée. Livraison partout au Bénin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="hero"
                size="lg"
                className="group bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link to="/collections">
                  Voir la Collection
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="elegant"
                size="lg"
                className="border-background text-background hover:bg-background hover:text-foreground"
                asChild
              >
                <Link to="/nouveautes">Nouveautés</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Strip */}
      <section className="py-8 bg-muted/30 border-b border-border/50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground">
              Nos Vedettes
            </h2>
            <Button variant="link" className="p-0 text-primary shrink-0 ml-4" asChild>
              <Link to="/collections">Tout voir</Link>
            </Button>
          </div>

          {isLoading ? (
            <ProductCarouselSkeleton count={4} />
          ) : (
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {featuredProducts.map((product, index) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-4 basis-[45%] sm:basis-[35%] md:basis-1/4 lg:basis-1/5"
                  >
                    <ProductCard
                      product={product}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                    />
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
