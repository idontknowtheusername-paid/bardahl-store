import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    id: '1',
    slug: 'haute-performance',
    name: 'Haute Performance',
    description: 'Produits premium pour une protection et performance maximales',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    productCount: 12,
  },
  {
    id: '2',
    slug: 'entretien-complet',
    name: 'Entretien Complet',
    description: 'Gamme complète pour l\'entretien et la maintenance de votre véhicule',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    productCount: 18,
  },
  {
    id: '3',
    slug: 'technologie-avancee',
    name: 'Technologie Avancée',
    description: 'Solutions innovantes avec la technologie Polar Plus® exclusive',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    productCount: 10,
  },
  {
    id: '4',
    slug: 'economie-durable',
    name: 'Économie & Durabilité',
    description: 'Produits pour réduire la consommation et prolonger la durée de vie',
    image: 'https://images.unsplash.com/photo-1563720223485-8d6d5c5c8c6b?w=800&q=80',
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
