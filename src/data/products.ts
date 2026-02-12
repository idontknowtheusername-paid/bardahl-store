// Static data fallback for products and categories
import type { Product, Collection } from '@/types/product';

// Static categories fallback (synchronized with database)
export const categories: Collection[] = [
  {
    id: 'ensembles',
    slug: 'ensembles',
    name: 'Ensembles & Combinaison',
    description: 'Ensembles de lingerie coordonnés et combinaisons',
    image: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'soutiens-gorge',
    slug: 'soutiens-gorge',
    name: 'Soutiens-gorge',
    description: 'Soutiens-gorge confortables et élégants',
    image: 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'culottes',
    slug: 'culottes',
    name: 'Culottes & Strings',
    description: 'Culottes, strings et bas de lingerie',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'nuisettes',
    slug: 'nuisettes',
    name: 'Nuisettes & Pyjamas',
    description: 'Nuisettes, pyjamas et vêtements de nuit',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'pyjamas',
    slug: 'pyjamas',
    name: 'Crop-top & Bodysuits',
    description: 'Crop-tops, bodysuits et hauts tendance',
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'accessoires',
    slug: 'accessoires',
    name: 'Accessoires & Cosmétique',
    description: 'Accessoires de lingerie et cosmétiques beauté',
    image: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'shorts-boxers',
    slug: 'shorts-boxers',
    name: 'Shorts & Collants',
    description: 'Shorts, collants et bas de contention',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'autres',
    slug: 'autres',
    name: 'Autres',
    description: 'Autres articles et produits divers',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
    productCount: 0,
  },
];

// Sample static products
export const products: Product[] = [
  {
    id: 'prod-1',
    slug: 'ensemble-dentelle-rose',
    name: 'Ensemble Dentelle Rose',
    price: 15000,
    originalPrice: 18000,
    images: [
      'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80',
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    ],
    category: 'ensembles',
    collection: 'saint-valentin',
    colors: [
      { name: 'Rose', hex: '#D4A5A5' },
      { name: 'Noir', hex: '#1a1a1a' },
    ],
    sizes: [
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: false },
    ],
    description: 'Un ensemble de lingerie en dentelle fine, parfait pour les occasions spéciales.',
    composition: '90% Polyamide, 10% Elasthanne',
    care: 'Lavage à la main recommandé. Ne pas sécher au sèche-linge.',
    style: 'Sexy',
    isNew: true,
    isBestseller: true,
    stock: { S: 5, M: 10, L: 8, XL: 0 },
  },
  {
    id: 'prod-2',
    slug: 'nuisette-satin-noir',
    name: 'Nuisette Satin Noir',
    price: 12000,
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    ],
    category: 'nuisettes',
    collection: 'essentiels',
    colors: [
      { name: 'Noir', hex: '#1a1a1a' },
      { name: 'Ivoire', hex: '#FFFFF0' },
    ],
    sizes: [
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
    ],
    description: 'Nuisette en satin doux avec finitions en dentelle.',
    composition: '95% Polyester, 5% Elasthanne',
    care: 'Lavage délicat 30°C',
    style: 'Classique',
    isNew: false,
    isBestseller: false,
    stock: { S: 3, M: 7, L: 5 },
  },
  {
    id: 'prod-3',
    slug: 'soutien-gorge-push-up',
    name: 'Soutien-gorge Push-up',
    price: 8500,
    images: [
      'https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=800&q=80',
    ],
    category: 'soutiens-gorge',
    collection: 'essentiels',
    colors: [
      { name: 'Noir', hex: '#1a1a1a' },
      { name: 'Nude', hex: '#E8C4A4' },
    ],
    sizes: [
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
    ],
    cupSizes: ['A', 'B', 'C', 'D'],
    description: 'Soutien-gorge push-up avec rembourrage léger.',
    composition: '80% Polyamide, 20% Elasthanne',
    care: 'Lavage à la main',
    style: 'Classique',
    isNew: true,
    isBestseller: false,
    stock: { S: 12, M: 15, L: 8 },
  },
];

// Helper functions
export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(p => p.category === categorySlug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getRelatedProducts(product: Product): Product[] {
  return products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
}

export function getNewProducts(): Product[] {
  return products.filter(p => p.isNew);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.isBestseller || p.isNew).slice(0, 8);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.colors.some(c => c.name.toLowerCase().includes(lowerQuery))
  );
}

// Static categories alias
export const staticCategories = categories;
export const staticProducts = products;
