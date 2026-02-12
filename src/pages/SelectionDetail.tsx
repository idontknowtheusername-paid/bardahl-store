import { useParams } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

const collections = {
  'saint-valentin': {
    name: 'Collection Saint-Valentin',
    description: 'Séduisez avec notre sélection spéciale Saint-Valentin',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=1200&q=80',
  },
  'essentiels': {
    name: 'Essentiels du Quotidien',
    description: 'Les indispensables pour votre confort au quotidien',
    image: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=1200&q=80',
  },
  'nuits-ete': {
    name: 'Nuits d\'Été',
    description: 'Légèreté et fraîcheur pour les nuits chaudes',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80',
  },
  'luxe-elegance': {
    name: 'Luxe & Élégance',
    description: 'Pièces d\'exception pour des moments uniques',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=1200&q=80',
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
