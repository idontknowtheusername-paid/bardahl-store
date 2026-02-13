import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCarouselSkeleton } from '@/components/product/ProductCardSkeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useProducts } from '@/hooks/use-supabase-api';
import { useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';

const CATEGORY_CONFIG = [
  { slug: 'huiles-moteur', title: 'Huiles Moteur', layout: 'carousel' as const },
  { slug: 'additifs', title: 'Additifs & Traitements', layout: 'carousel' as const },
  { slug: 'entretien', title: 'Entretien & Nettoyage', layout: 'carousel' as const },
  { slug: 'graisses', title: 'Graisses & Lubrifiants', layout: 'carousel' as const },
];

function CategorySection({ title, slug }: { title: string; slug: string }) {
  const { data: categoryProducts, isLoading } = useProducts({ categorySlug: slug, limit: 8 });
  
  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true }),
    []
  );

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{title}</h2>
          <ProductCarouselSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (!categoryProducts || categoryProducts.length === 0) return null;

  return (
    <section className="py-8 md:py-12 even:bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <Button variant="link" className="p-0 text-primary font-semibold shrink-0 ml-4" asChild>
            <Link to={`/collections/${slug}`}>Voir tout</Link>
          </Button>
        </div>
        
        <Carousel
          opts={{ align: 'start', loop: true }}
          plugins={[autoplayPlugin]}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {categoryProducts.map((product, index) => (
              <CarouselItem 
                key={product.id} 
                className="pl-4 md:pl-6 basis-[45%] sm:basis-[40%] md:basis-1/3 lg:basis-1/4"
              >
                <ProductCard
                  product={product}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                />
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

export function CategorySections() {
  return (
    <>
      {CATEGORY_CONFIG.map((category) => (
        <CategorySection key={category.slug} title={category.title} slug={category.slug} />
      ))}
    </>
  );
}
