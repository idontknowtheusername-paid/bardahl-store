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
import { products as staticProducts } from '@/data/products';
import { useProducts } from '@/hooks/use-api';
import { useState, useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';

// Configuration des 6 sections de catégories
const CATEGORY_CONFIG = [
  { slug: 'ensembles', title: 'Ensembles', layout: 'carousel' as const },
  { slug: 'nuisettes', title: 'Nuisettes & Déshabillés', layout: 'carousel' as const },
  { slug: 'pyjamas', title: 'Pyjamas', layout: 'carousel' as const },
  { slug: 'soutiens-gorge', title: 'Soutiens-gorge', layout: 'grid' as const },
  { slug: 'culottes', title: 'Culottes & Strings', layout: 'grid' as const },
  { slug: 'accessoires', title: 'Accessoires', layout: 'carousel' as const },
];

interface CategorySectionProps {
  title: string;
  slug: string;
  layout: 'grid' | 'carousel';
}

function CategorySection({ title, slug, layout }: CategorySectionProps) {
  const { data: apiData, isLoading } = useProducts({ category: slug, pageSize: 8 });
  const [isHovering, setIsHovering] = useState(false);
  
  const [autoplayRef] = useState(() => 
    Autoplay({ delay: 2500, stopOnInteraction: false, playOnInit: false })
  );

  // Use API data if available, fallback to static
  const categoryProducts = useMemo(() => {
    if (apiData?.docs && apiData.docs.length > 0) {
      return apiData.docs; // Already transformed by the hook
    }
    return staticProducts.filter(p => p.category === slug);
  }, [apiData, slug]);
  
  if (isLoading) {
    return (
      <section className={`py-6 md:py-10 ${layout === 'grid' ? 'bg-background' : 'bg-muted/30'}`}>
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12">
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

  if (categoryProducts.length === 0) return null;

  if (layout === 'grid') {
    return (
      <section className="py-6 md:py-10 bg-background">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">
              {title}
            </h2>
            <Button variant="link" className="group p-0 self-start sm:self-auto text-primary" asChild>
              <Link to={`/collections/${slug}`}>
                Voir tout 
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
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

  const handleMouseEnter = () => {
    setIsHovering(true);
    autoplayRef.play();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    autoplayRef.stop();
  };

  return (
    <section className="py-6 md:py-10 bg-muted/30">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">
            {title}
          </h2>
          <Button variant="link" className="group p-0 self-start sm:self-auto text-primary" asChild>
            <Link to={`/collections/${slug}`}>
              Voir tout 
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
