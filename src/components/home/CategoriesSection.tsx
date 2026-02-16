import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { staticCategories } from '@/data/products';
import { useTranslation } from '@/context/LanguageContext';
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useProducts } from '@/hooks/use-supabase-api';

function CategoryCardSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden aspect-[4/5]">
      <Skeleton className="absolute inset-0 w-full h-full" />
    </div>
  );
}

// Map product_type to display info
const PRODUCT_TYPE_INFO: Record<string, { name: string; image: string; description: string }> = {
  'huiles-moteur': {
    name: 'Huiles Moteur',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    description: 'Huiles moteur haute performance',
  },
  'additifs': {
    name: 'Additifs & Traitements',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80',
    description: 'Additifs moteur et carburant',
  },
  'entretien': {
    name: 'Entretien & Nettoyage',
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80',
    description: 'Produits d\'entretien automobile',
  },
  'graisses': {
    name: 'Graisses & Lubrifiants',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    description: 'Graisses et lubrifiants spécialisés',
  },
  'liquides': {
    name: 'Liquides de refroidissement',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    description: 'Liquides de refroidissement et antigel',
  },
  'transmission': {
    name: 'Transmission & Freinage',
    image: 'https://images.unsplash.com/photo-1635784553857-4a87fb285e44?w=800&q=80',
    description: 'Huiles de transmission et liquides de frein',
  },
};

export function CategoriesSection() {
  const t = useTranslation();
  const { data: products, isLoading } = useProducts();

  const displayCollections = useMemo(() => {
    // Always show all product types, even if no products yet
    const allTypes = Object.keys(PRODUCT_TYPE_INFO);

    return allTypes.map(type => {
      const info = PRODUCT_TYPE_INFO[type];
      const productCount = products?.filter(p => p.style === type).length || 0;

      return {
        id: type,
        slug: type,
        name: info.name,
        description: info.description,
        image: info.image,
        productCount,
      };
    });
  }, [products]);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-8"><Skeleton className="h-8 w-48 mx-auto" /></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <span className="text-primary text-sm font-bold tracking-widest uppercase">{t.catalog}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2">{t.ourCategories}</h2>
        </div>
        <Carousel
          opts={{ align: 'start', loop: true }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {displayCollections.map((collection, index) => (
              <CarouselItem key={collection.id} className="pl-4 basis-[45%] sm:basis-[35%] md:basis-1/3 lg:basis-1/4">
                <Link to={`/collections/${collection.slug}`}
                  className="group relative block rounded-xl overflow-hidden hover-lift animate-fade-in aspect-[4/5]"
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <img src={collection.image} alt={collection.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-sm md:text-base text-white">{collection.name}</h3>
                    <div className="flex items-center gap-1 text-primary text-xs font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.viewProducts} <ArrowRight className="h-3 w-3" />
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
