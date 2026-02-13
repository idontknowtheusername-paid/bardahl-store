import { Link } from 'react-router-dom';
import { useNewArrivals } from '@/hooks/use-supabase-api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCarouselSkeleton } from '@/components/product/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';

export function NewArrivalsSection() {
  const t = useTranslation();
  const { data: newProducts, isLoading } = useNewArrivals();
  const autoplayPlugin = useMemo(() => Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true }), []);

  if (isLoading) {
    return (
      <section className="py-10 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-primary text-sm font-bold tracking-widest uppercase">{t.newTag}</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">{t.newArrivals}</h2>
            </div>
          </div>
          <ProductCarouselSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (!newProducts || newProducts.length === 0) return null;

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-primary text-sm font-bold tracking-widest uppercase">{t.newTag}</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">{t.newArrivals}</h2>
          </div>
          <Button variant="link" className="p-0 text-primary font-semibold shrink-0 ml-4" asChild>
            <Link to="/nouveautes">{t.seeAll}</Link>
          </Button>
        </div>
        <Carousel opts={{ align: 'start', loop: true }} plugins={[autoplayPlugin]} className="w-full">
          <CarouselContent className="-ml-4 md:-ml-6">
            {newProducts.map((product, index) => (
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
