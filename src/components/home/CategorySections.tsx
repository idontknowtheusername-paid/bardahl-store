import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton, ProductCarouselSkeleton } from '@/components/product/ProductCardSkeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useProducts } from '@/hooks/use-supabase-api';
import { useState, useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { staticProducts } from '@/data/products';

// Configuration des 8 sections de catégories (ordre selon display_order en base)
const CATEGORY_CONFIG = [
  { slug: 'ensembles', title: 'Ensembles & Combinaison', layout: 'carousel' as const },
  { slug: 'soutiens-gorge', title: 'Soutiens-gorge', layout: 'carousel' as const },
  { slug: 'culottes', title: 'Culottes & Strings', layout: 'carousel' as const },
  { slug: 'nuisettes', title: 'Nuisettes & Pyjamas', layout: 'carousel' as const },
  { slug: 'pyjamas', title: 'Crop-top & Bodysuits', layout: 'carousel' as const },
  { slug: 'accessoires', title: 'Accessoires & Cosmétique', layout: 'carousel' as const },
  { slug: 'shorts-boxers', title: 'Shorts & Collants', layout: 'carousel' as const },
  { slug: 'autres', title: 'Autres', layout: 'carousel' as const },
];

interface CategorySectionProps {
  title: string;
  slug: string;
  layout: 'grid' | 'carousel';
}

function CategorySection({ title, slug, layout }: CategorySectionProps) {
  const { data: categoryProducts, isLoading } = useProducts({ categorySlug: slug, limit: 8 });
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
      <section className={`py-6 md:py-10 ${layout === 'grid' ? 'bg-background' : 'bg-muted/30'}`}>
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">
              {title}
            </h2>
          </div>
          {layout === 'grid' ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <ProductCarouselSkeleton count={4} />
          )}
        </div>
      </section>
    );
  }

  // Hide section if no products
  if (!categoryProducts || categoryProducts.length === 0) return null;

  if (layout === 'grid') {
    return (
      <section className="py-6 md:py-10 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">
              {title}
            </h2>
            <Button variant="link" className="p-0 text-primary shrink-0 ml-4" asChild>
              <Link to={`/collections/${slug}`}>Voir tout</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categoryProducts.slice(0, 8).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-10 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">
            {title}
          </h2>
          <Button variant="link" className="p-0 text-primary shrink-0 ml-4" asChild>
            <Link to={`/collections/${slug}`}>Voir tout</Link>
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
      </div>
    </section>
  );
}

export function CategorySections() {
  return (
    <>
      {CATEGORY_CONFIG.map((category) => (
        <CategorySection
          key={category.slug}
          title={category.title}
          slug={category.slug}
          layout={category.layout}
        />
      ))}
    </>
  );
}
