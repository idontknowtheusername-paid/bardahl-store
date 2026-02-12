import { useMemo } from 'react';
import { useNewArrivals } from '@/hooks/use-supabase-api';
import { getNewProducts } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';

export default function NewArrivals() {
  const { data: products, isLoading } = useNewArrivals();

  if (isLoading) {
    return (
      <div className="py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-rose text-sm font-medium tracking-widest uppercase">
              Fraîchement arrivés
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-medium mt-2 mb-4">
              Nouveautés
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos dernières créations, conçues avec les plus belles matières 
              pour sublimer votre féminité.
            </p>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-12 md:py-20">
        <div className="container">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">
              Nouveautés
            </h1>
            <p className="text-muted-foreground">
              Aucune nouveauté pour le moment. Revenez bientôt !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-rose text-sm font-medium tracking-widest uppercase">
            Fraîchement arrivés
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-medium mt-2 mb-4">
            Nouveautés
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos dernières créations, conçues avec les plus belles matières 
            pour sublimer votre féminité.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
