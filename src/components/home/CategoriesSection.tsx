import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/use-supabase-api';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';
import { staticCategories } from '@/data/products';

function CategoryCardSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden aspect-[4/5]">
      <Skeleton className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 space-y-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
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
        <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-2xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const [autoplayRef] = useState(() =>
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      rootNode: (emblaRoot) => emblaRoot.parentElement,
    })
  );

  // Transform API categories to display format, fallback to static
  const displayCollections = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.title,
        description: cat.description || '',
        image: cat.image_url || 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80',
        productCount: 0,
      }));
    }
    return staticCategories;
  }, [categories]);

  // Group categories into pairs for 2x2 grid
  const categoryPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < displayCollections.length; i += 4) {
      pairs.push(displayCollections.slice(i, i + 4));
    }
    return pairs;
  }, [displayCollections]);

  // Update carousel state
  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setCount(api.scrollSnapList().length);
  }, [api]);

  // Set up carousel API
  useMemo(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
  }, [api, onSelect]);

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

        <div className="relative max-w-3xl mx-auto">
          <Carousel
            opts={{
              align: 'center',
              loop: true,
            }}
            plugins={[autoplayRef]}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent>
              {categoryPairs.map((pair, pairIndex) => (
                <CarouselItem key={pairIndex}>
                  <div className="grid grid-cols-2 gap-2 md:gap-3 px-2">
                    {pair.map((collection, index) => (
                      <Link
                        key={collection.id}
                        to={`/collections/${collection.slug}`}
                        className="group relative block rounded-lg overflow-hidden hover-lift animate-fade-in aspect-[4/5]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                          <h3 className="font-serif text-xs md:text-sm font-medium text-background line-clamp-1">
                            {collection.name}
                          </h3>
                          <div className="flex items-center gap-1 text-rose text-[10px] md:text-xs font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            Découvrir
                            <ArrowRight className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation buttons - hidden on mobile, visible on md+ */}
            <CarouselPrevious className="hidden md:flex -left-12 lg:-left-16" />
            <CarouselNext className="hidden md:flex -right-12 lg:-right-16" />
          </Carousel>

          {/* Dots indicator */}
          {count > 1 && (
            <div className="flex justify-center gap-1.5 mt-6">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-1.5 rounded-full transition-all ${index === current
                      ? 'w-6 bg-rose'
                      : 'w-1.5 bg-rose/30 hover:bg-rose/50'
                    }`}
                  aria-label={`Aller à la page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
