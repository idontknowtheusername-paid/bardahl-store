import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

const PRODUCT_TYPES = [
  {
    slug: 'huiles-moteur',
    name: 'Huiles Moteur',
    description: 'Huiles moteur haute performance pour tous types de véhicules',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
  },
  {
    slug: 'additifs',
    name: 'Additifs & Traitements',
    description: 'Additifs moteur et carburant pour optimiser les performances',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
  },
  {
    slug: 'entretien',
    name: 'Entretien & Nettoyage',
    description: 'Produits d\'entretien et de nettoyage automobile',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80',
  },
  {
    slug: 'graisses',
    name: 'Graisses & Lubrifiants',
    description: 'Graisses et lubrifiants spécialisés',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
  },
  {
    slug: 'liquides',
    name: 'Liquides de refroidissement',
    description: 'Liquides de refroidissement et antigel haute performance',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
  },
  {
    slug: 'transmission',
    name: 'Transmission & Freinage',
    description: 'Huiles de transmission et liquides de frein',
    image: 'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=800&q=80',
  },
];

export default function Categories() {
  const t = useTranslation();

  return (
    <div className="py-12 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Nos Gammes</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre gamme complète de produits Bardahl pour l'entretien et la performance de votre véhicule
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {PRODUCT_TYPES.map((category, index) => (
            <Link key={category.slug} to={`/categories/${category.slug}`}
              className="group relative aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}>
              <img src={category.image} alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-background">{category.name}</h2>
                <p className="text-background/70 mt-2 max-w-md">{category.description}</p>
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
