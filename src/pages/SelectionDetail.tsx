import { useParams } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

const collections = {
  'haute-performance': {
    name: 'Haute Performance',
    description: 'Produits premium pour une protection et performance maximales',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80',
  },
  'entretien-complet': {
    name: 'Entretien Complet',
    description: 'Gamme complète pour l\'entretien et la maintenance de votre véhicule',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80',
  },
  'technologie-avancee': {
    name: 'Technologie Avancée',
    description: 'Solutions innovantes avec la technologie Polar Plus® exclusive',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  },
  'economie-durable': {
    name: 'Économie & Durabilité',
    description: 'Produits pour réduire la consommation et prolonger la durée de vie',
    image: 'https://images.unsplash.com/photo-1563720223485-8d6d5c5c8c6b?w=1200&q=80',
  },
};

export default function SelectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const collection = slug ? collections[slug as keyof typeof collections] : null;

  if (!collection) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-3xl mb-4">Sélection non trouvée</h1>
        <p className="text-muted-foreground">Cette sélection n'existe pas.</p>
      </div>
    );
  }

  // Pour l'instant, on affiche tous les produits
  // Plus tard, on filtrera par collection depuis le backend
  const collectionProducts = products.slice(0, 12);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={collection.image}
          alt={collection.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-white mb-4">
              {collection.name}
            </h1>
            <p className="text-white/90 text-lg max-w-2xl">
              {collection.description}
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="py-12 md:py-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
