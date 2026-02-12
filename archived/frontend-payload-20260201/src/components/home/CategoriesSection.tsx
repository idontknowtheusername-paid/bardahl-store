import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/use-api';
import { categories as staticCategories } from '@/data/products';
import { ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/lib/api-payload';
import { useMemo, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';

function CategoryCardSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden aspect-[3/4]">
      <Skeleton className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <section className="py-12 md:py-16 bg-cream overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <Skeleton className="h-4 w-24 mx-auto mb-2" />
          <Skeleton className="h-8 w-48 mx-auto" />
        </div>
      </div>
      <div className="w-full">
        <div className="flex gap-2 md:gap-3 px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 basis-[38%] sm:basis-[35%] md:basis-[32%] lg:basis-[28%] xl:basis-[25%]"
            >
              <CategoryCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();

  const [autoplayRef] = useState(() =>
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  // Transform API categories to display format, fallback to static
  const displayCollections = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.title,
        description: cat.description || '',
        image: getImageUrl(cat.image),
        productCount: 0, // Would need a count query
      }));
    }
    return staticCategories;
  }, [categories]);

  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  return (
    <section className="py-12 md:py-16 bg-cream overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-rose text-sm font-medium tracking-widest uppercase">
            Explorez
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium mt-2">
            Nos Catégories
          </h2>
        </div>
      </div>

      <div className="w-full">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[autoplayRef]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-3">
            {displayCollections.map((collection, index) => (
              <CarouselItem
                key={collection.id}
                className="pl-2 md:pl-3 basis-[38%] sm:basis-[35%] md:basis-[32%] lg:basis-[28%] xl:basis-[25%]"
              >
                <Link
                  to={`/collections/${collection.slug}`}
                  className="group relative block rounded-lg overflow-hidden hover-lift animate-fade-in aspect-[3/4]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3">
                    <h3 className="font-serif text-xs md:text-sm font-medium text-background line-clamp-1">
                      {collection.name}
                    </h3>
                    <div className="flex items-center gap-1 text-rose text-[10px] md:text-xs font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Découvrir
                      <ArrowRight className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
