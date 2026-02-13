import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/use-supabase-api';
import { ArrowRight, Loader2 } from 'lucide-react';
import { staticCategories } from '@/data/products';
import { useTranslation } from '@/context/LanguageContext';

export default function Collections() {
  const t = useTranslation();
  const { data: categories, isLoading } = useCategories();

  const displayCollections = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(cat => ({
        id: cat.id, slug: cat.slug, name: cat.title,
        description: cat.description || '',
        image: cat.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
        productCount: 0,
      }));
    }
    return staticCategories;
  }, [categories]);

  if (isLoading) {
    return (
      <div className="py-12 md:py-20">
        <div className="container flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t.catalogTitle}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.catalogDescription}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {displayCollections.map((collection, index) => (
            <Link key={collection.id} to={`/collections/${collection.slug}`}
              className="group relative aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}>
              <img src={collection.image} alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-background">{collection.name}</h2>
                <p className="text-background/70 mt-2 max-w-md">{collection.description}</p>
                <div className="flex items-center gap-2 text-primary font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.viewProducts} <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
