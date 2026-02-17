export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  collection: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  cupSizes?: string[];
  description: string;
  composition: string;
  care: string;
  style: string;
  isNew?: boolean;
  isBestseller?: boolean;
  stock: Record<string, number>;
  // Technical specs for motor oils
  viscosity?: string;
  capacity?: string;
  apiNorm?: string;
  aceaNorm?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSize {
  size: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  cupSize?: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface FilterState {
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  cupSizes: string[];
  styles: string[];
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity';
