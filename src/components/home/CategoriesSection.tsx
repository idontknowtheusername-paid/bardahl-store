import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import categoryTransmission from '@/assets/category-transmission.jpg';
import categoryHuiles from '@/assets/category-huiles.jpg';
import categoryAdditifs from '@/assets/category-additifs.jpg';
import categoryEntretien from '@/assets/category-entretien.jpg';
import categoryLiquides from '@/assets/category-liquides.jpg';
import categoryPurifiant from '@/assets/category-purifiant.jpg';
import categoryAtelier from '@/assets/category-atelier.jpg';
import categoryPacks from '@/assets/category-packs.jpg';
import categoryAccessoires from '@/assets/category-accessoires.jpg';
import categoryFiltres from '@/assets/category-filtres.jpg';
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
    image: categoryHuiles,
    description: 'Huiles moteur haute performance',
  },
  'transmission': {
    name: 'Huiles boîtes & Transmission',
    image: categoryTransmission,
    description: 'Huiles de transmission et liquides de frein',
  },
  'additifs': {
    name: 'Additifs & Traitements',
    image: categoryAdditifs,
    description: 'Additifs moteur et carburant',
  },
  'liquides': {
    name: 'Liquide de refroidissement & lave-glace',
    image: categoryLiquides,
    description: 'Liquides de refroidissement et antigel',
  },
  'purifiant-desodorisant': {
    name: 'Purifiant & désodorisant',
    image: categoryPurifiant,
    description: 'Purifiants d\'air et désodorisants habitacle',
  },
  'entretien': {
    name: 'Entretien & Nettoyage',
    image: categoryEntretien,
    description: 'Produits d\'entretien automobile',
  },
  'special-atelier': {
    name: 'Spécial atelier',
    image: categoryAtelier,
    description: 'Produits professionnels pour atelier',
  },
  'packs-entretien': {
    name: 'Packs entretien',
    image: categoryPacks,
    description: 'Packs complets pour votre véhicule',
  },
  'accessoires-electronique': {
    name: 'Accessoires & Électronique auto',
    image: categoryAccessoires,
    description: 'Accessoires et équipements électroniques',
  },
  'filtres': {
    name: 'Filtres',
    image: categoryFiltres,
    description: 'Filtres à huile, gasoil, air et plus',
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
