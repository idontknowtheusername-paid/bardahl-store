import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/use-supabase-api';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { staticCategories } from '@/data/products';

function CategoryCardSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden aspect-[4/5]">
      <Skeleton className="absolute inset-0 w-full h-full" />
    </div>
  );
}

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();

  const displayCollections = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.title,
        description: cat.description || '',
        image: cat.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
        productCount: 0,
      }));
    }
    return staticCategories;
  }, [categories]);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-bardahl-light">
        <div className="container">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-bardahl-light">
      <div className="container">
        <div className="text-center mb-10">
          <span className="text-primary text-sm font-bold tracking-widest uppercase">
            Catalogue
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
            Nos Catégories
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayCollections.slice(0, 8).map((collection, index) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className="group relative block rounded-xl overflow-hidden hover-lift animate-fade-in aspect-[4/5]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-sm md:text-base text-white">
                  {collection.name}
                </h3>
                <div className="flex items-center gap-1 text-primary text-xs font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir les produits
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
