import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { useProducts } from '@/hooks/use-supabase-api';
import { useMemo } from 'react';

const PRODUCT_TYPE_INFO: Record<string, { name: string; description: string }> = {
  'huiles-moteur': { name: 'Huiles Moteur', description: 'Huiles moteur haute performance pour tous types de véhicules' },
  'additifs': { name: 'Additifs & Traitements', description: 'Additifs moteur et carburant pour optimiser les performances' },
  'entretien': { name: 'Entretien & Nettoyage', description: 'Produits d\'entretien et de nettoyage automobile' },
  'graisses': { name: 'Graisses & Lubrifiants', description: 'Graisses et lubrifiants spécialisés' },
  'liquides': { name: 'Liquides de refroidissement', description: 'Liquides de refroidissement et antigel haute performance' },
  'transmission': { name: 'Transmission & Freinage', description: 'Huiles de transmission et liquides de frein' },
};

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: allProducts, isLoading } = useProducts();

  const categoryInfo = slug ? PRODUCT_TYPE_INFO[slug] : null;

  const products = useMemo(() => {
    return allProducts?.filter(p => p.style === slug) || [];
  }, [allProducts, slug]);

  if (isLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-medium mb-4">Gamme non trouvée</h1>
        <Link to="/categories" className="text-primary hover:underline">
          Retour aux gammes
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/categories" className="hover:text-foreground transition-colors">Gammes</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{categoryInfo.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryInfo.name}</h1>
          <p className="text-muted-foreground">{categoryInfo.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {products.length} produit{products.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Aucun produit disponible dans cette gamme pour le moment.</p>
              <Link to="/categories" className="text-primary hover:underline">
                Découvrir les autres gammes
              </Link>
            </div>
        )}
      </div>
    </div>
  );
}
