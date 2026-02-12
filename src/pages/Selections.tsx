import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    id: '1',
    slug: 'saint-valentin',
    name: 'Collection Saint-Valentin',
    description: 'Séduisez avec notre sélection spéciale Saint-Valentin',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    productCount: 12,
  },
  {
    id: '2',
    slug: 'essentiels',
    name: 'Essentiels du Quotidien',
    description: 'Les indispensables pour votre confort au quotidien',
    image: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80',
    productCount: 18,
  },
  {
    id: '3',
    slug: 'nuits-ete',
    name: 'Nuits d\'Été',
    description: 'Légèreté et fraîcheur pour les nuits chaudes',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    productCount: 10,
  },
  {
    id: '4',
    slug: 'luxe-elegance',
    name: 'Luxe & Élégance',
    description: 'Pièces d\'exception pour des moments uniques',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    productCount: 15,
  },
];

export default function Selections() {
  return (
    <div className="py-12 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Nos Sélections
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos collections thématiques soigneusement sélectionnées pour chaque occasion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/selections/${collection.slug}`}
              className="group relative overflow-hidden rounded-lg aspect-[4/3] bg-muted"
            >
              <img
                src={collection.image}
                alt={collection.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h2 className="font-serif text-2xl md:text-3xl font-medium text-white mb-2">
                  {collection.name}
                </h2>
                <p className="text-white/90 text-sm md:text-base mb-4">
                  {collection.description}
                </p>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-sm">{collection.productCount} produits</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
