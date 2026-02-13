// Static data fallback for products and categories
import type { Product, Collection } from '@/types/product';

// Static categories — Bardahl automotive
export const categories: Collection[] = [
  {
    id: 'huiles-moteur',
    slug: 'huiles-moteur',
    name: 'Huiles Moteur',
    description: 'Huiles moteur haute performance avec technologie Polar Plus®',
    image: 'https://images.unsplash.com/photo-1635784553857-4a87fb285e44?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'additifs',
    slug: 'additifs',
    name: 'Additifs & Traitements',
    description: 'Additifs moteur, carburant et traitements spécialisés',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'entretien',
    slug: 'entretien',
    name: 'Entretien & Nettoyage',
    description: 'Produits d\'entretien et de nettoyage automobile',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'graisses',
    slug: 'graisses',
    name: 'Graisses & Lubrifiants',
    description: 'Graisses et lubrifiants spécialisés pour tous types de mécanismes',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'liquides',
    slug: 'liquides',
    name: 'Liquides de refroidissement',
    description: 'Liquides de refroidissement et antigel haute performance',
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'transmission',
    slug: 'transmission',
    name: 'Transmission & Freinage',
    description: 'Huiles de transmission, liquides de frein et direction assistée',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    productCount: 0,
  },
];

// Sample static products — Bardahl automotive
export const products: Product[] = [
  {
    id: 'bardahl-xtc-5w30',
    slug: 'bardahl-xtc-c60-5w30',
    name: 'Bardahl XTC C60 5W-30',
    price: 25000,
    originalPrice: 28000,
    images: ['https://images.unsplash.com/photo-1635784553857-4a87fb285e44?w=800&q=80'],
    category: 'huiles-moteur',
    collection: 'xtc-c60',
    colors: [{ name: '1L', hex: '#FFD000' }, { name: '5L', hex: '#1a1a1a' }],
    sizes: [{ size: '1L', available: true }, { size: '5L', available: true }],
    description: 'Huile moteur 100% synthèse avec technologie Polar Plus® et Fullerène C60. Norme ACEA C2/C3, API SN/CF. Protection maximale du moteur.',
    composition: 'Base synthétique PAO + Fullerène C60 + Polar Plus®',
    care: 'Viscosité: 5W-30 | Normes: ACEA C2/C3, API SN/CF',
    style: 'Synthèse',
    isNew: true,
    isBestseller: true,
    stock: { global: 100 },
  },
  {
    id: 'bardahl-xtc-5w40',
    slug: 'bardahl-xtc-c60-5w40',
    name: 'Bardahl XTC C60 5W-40',
    price: 22000,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80'],
    category: 'huiles-moteur',
    collection: 'xtc-c60',
    colors: [{ name: '1L', hex: '#FFD000' }, { name: '5L', hex: '#1a1a1a' }],
    sizes: [{ size: '1L', available: true }, { size: '5L', available: true }],
    description: 'Huile moteur 100% synthèse polyvalente. Technologie Polar Plus® pour une lubrification optimale.',
    composition: 'Base synthétique + Fullerène C60',
    care: 'Viscosité: 5W-40 | Normes: ACEA A3/B4, API SN/CF',
    style: 'Synthèse',
    isNew: false,
    isBestseller: true,
    stock: { global: 80 },
  },
  {
    id: 'bardahl-10w40',
    slug: 'bardahl-xtc-10w40',
    name: 'Bardahl XTC 10W-40',
    price: 15000,
    images: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80'],
    category: 'huiles-moteur',
    collection: 'xtc',
    colors: [{ name: '1L', hex: '#FFD000' }],
    sizes: [{ size: '1L', available: true }, { size: '4L', available: true }, { size: '5L', available: true }],
    description: 'Huile moteur semi-synthèse pour moteurs essence et diesel. Excellent rapport qualité-prix.',
    composition: 'Base semi-synthétique + additifs Polar Plus®',
    care: 'Viscosité: 10W-40 | Normes: ACEA A3/B4',
    style: 'Semi-synthèse',
    isNew: false,
    isBestseller: false,
    stock: { global: 120 },
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
  return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
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
    p.description.toLowerCase().includes(lowerQuery)
  );
}

export const staticCategories = categories;
export const staticProducts = products;
