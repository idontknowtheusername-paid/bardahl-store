import { Link } from 'react-router-dom';
import { useNewArrivals } from '@/hooks/use-api';
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
  const { data: apiProducts, isLoading, error } = useNewArrivals();
  const [isHovering, setIsHovering] = useState(false);

  const [autoplayRef] = useState(() =>
    Autoplay({ delay: 2500, stopOnInteraction: false, playOnInit: false })
  );

  // Use API data if available, fallback to static data
  const newProducts = useMemo(() => {
    if (apiProducts && apiProducts.length > 0) {
      return apiProducts; // Already transformed by the hook
    }
    return getNewProducts();
  }, [apiProducts]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    autoplayRef.play();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    autoplayRef.stop();
  };

  if (isLoading) {
    return (
      <section className="py-6 md:py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-rose text-sm font-medium tracking-widest uppercase">
                Fraîchement arrivés
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-medium mt-2">
                Nouveautés
              </h2>
            </div>
          </div>
          <ProductCarouselSkeleton count={4} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-10">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="text-rose text-sm font-medium tracking-widest uppercase">
              Fraîchement arrivés
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium mt-2">
              Nouveautés
            </h2>
          </div>
          <Button variant="link" className="mt-4 md:mt-0 group p-0 text-primary" asChild>
            <Link to="/nouveautes">
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[autoplayRef]}
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
