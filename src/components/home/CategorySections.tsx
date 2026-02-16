import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCarouselSkeleton } from '@/components/product/ProductCardSkeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useProducts } from '@/hooks/use-supabase-api';
import { useTranslation } from '@/context/LanguageContext';
import { useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';

const PRODUCT_TYPE_CONFIG = [
  { type: 'huiles-moteur', title: 'Huiles Moteur' },
  { type: 'additifs', title: 'Additifs & Traitements' },
  { type: 'entretien', title: 'Entretien & Nettoyage' },
  { type: 'graisses', title: 'Graisses & Lubrifiants' },
  { type: 'liquides', title: 'Liquides de refroidissement' },
  { type: 'transmission', title: 'Transmission & Freinage' },
];

function CategorySection({ title, productType }: { title: string; productType: string }) {
  const t = useTranslation();
  const { data: allProducts, isLoading } = useProducts();
  const autoplayPlugin = useMemo(() => Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true }), []);

  // Filter products by product_type (stored in style field)
  const categoryProducts = useMemo(() => {
    return allProducts?.filter(p => p.style === productType).slice(0, 8) || [];
  }, [allProducts, productType]);

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
            <Link to={`/categories/${productType}`}>{t.seeAll}</Link>
          </Button>
        </div>
        <Carousel opts={{ align: 'start', loop: true }} plugins={[autoplayPlugin]} className="w-full">
          <CarouselContent className="-ml-4 md:-ml-6">
            {categoryProducts.map((product, index) => (
              <CarouselItem key={product.id} className="pl-4 md:pl-6 basis-[45%] sm:basis-[40%] md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties} />
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
      {PRODUCT_TYPE_CONFIG.map((config) => (
        <CategorySection
          key={config.type}
          title={config.title}
          productType={config.type}
        />
      ))}
    </>
  );
}
