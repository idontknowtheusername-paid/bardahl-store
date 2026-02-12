import { Link } from 'react-router-dom';
import { useNewArrivals } from '@/hooks/use-supabase-api';
import { getNewProducts } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCarouselSkeleton } from '@/components/product/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useState, useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';

export function NewArrivalsSection() {
  const { data: newProducts, isLoading } = useNewArrivals();
  const [isHovering, setIsHovering] = useState(false);

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: 2500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    []
  );

  if (isLoading) {
    return (
      <section className="py-6 md:py-10">
        <div className="container">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div className="flex-1 min-w-0">
              <span className="text-rose text-sm font-medium tracking-widest uppercase">
                Fraîchement arrivés
              </span>
              <h2 className="font-serif text-2xl md:text-4xl font-medium mt-2">
                Nouveautés
              </h2>
            </div>
          </div>
          <ProductCarouselSkeleton count={4} />
        </div>
      </section>
    );
  }

  // Hide section if no products
  if (!newProducts || newProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex-1 min-w-0">
            <span className="text-rose text-sm font-medium tracking-widest uppercase">
              Fraîchement arrivés
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-medium mt-2">
              Nouveautés
            </h2>
          </div>
          <Button variant="link" className="p-0 text-primary shrink-0 ml-4" asChild>
            <Link to="/nouveautes">Voir tout</Link>
          </Button>
        </div>

        <div className="relative">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[autoplayPlugin]}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {newProducts.map((product, index) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 md:pl-6 basis-[45%] sm:basis-[40%] md:basis-1/3 lg:basis-1/4"
                >
                  <ProductCard
                    product={product}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
            <CarouselNext className="-right-4 md:-right-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
