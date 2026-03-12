import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Package } from 'lucide-react';
import { useProducts } from '@/hooks/use-supabase-api';

interface PacksCarouselProps {
  className?: string;
}

export function PacksCarousel({ className = '' }: PacksCarouselProps) {
  const { data: allProducts } = useProducts({ limit: 200 });

  const packs = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => p.style === 'packs-entretien' || p.category === 'packs-entretien');
  }, [allProducts]);

  if (packs.length === 0) return null;

  return (
    <section className={`py-10 md:py-16 bg-muted/30 ${className}`}>
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-primary text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Package className="h-4 w-4" /> PACKS
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Packs recommandés</h2>
            <p className="text-muted-foreground text-base mt-2 hidden md:block">
              Économisez avec nos packs d'entretien complets
            </p>
          </div>
          <Button variant="link" className="p-0 text-primary font-semibold shrink-0 ml-4" asChild>
            <Link to="/categories/packs-entretien">Voir tous</Link>
          </Button>
        </div>
        <Carousel opts={{ align: 'start', loop: packs.length > 3 }} className="w-full">
          <CarouselContent className="-ml-4 md:-ml-6">
            {packs.map((product, index) => (
              <CarouselItem key={product.id} className="pl-4 md:pl-6 basis-[45%] sm:basis-[40%] md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 md:-left-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
          <CarouselNext className="-right-4 md:-right-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
        </Carousel>
      </div>
    </section>
  );
}
