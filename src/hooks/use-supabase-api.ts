// React Query hooks for Supabase API
import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/lib/supabase-api';
import type { Product } from '@/types/product';
import type { Database } from '@/integrations/supabase/types';

type DbProduct = Database['public']['Tables']['products']['Row'];

// Transform Supabase product to frontend Product type
export function transformProduct(dbProduct: DbProduct & { 
  product_images?: { image_url: string; alt_text?: string | null }[];
  product_categories?: { categories: { id: string; title: string; slug: string } | null }[];
}): Product {
  const images = dbProduct.product_images?.map(img => img.image_url) || [];
  
  // Parse available_colors from JSONB
  let colors: { name: string; hex: string }[] = [];
  if (dbProduct.available_colors) {
    try {
      const parsed = typeof dbProduct.available_colors === 'string'
        ? JSON.parse(dbProduct.available_colors)
        : dbProduct.available_colors;
      colors = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing available_colors:', e);
    }
  }

  // Fallback to default color if none
  if (colors.length === 0) {
    colors = [{ name: 'Noir', hex: '#1a1a1a' }];
  }

  // Get available sizes from array
  const availableSizes = dbProduct.available_sizes || ['S', 'M', 'L'];
  const sizes = availableSizes.map(size => ({
    size,
    available: true, // Always available if global stock > 0
  }));

  // Get available cup sizes (can be null)
  const cupSizes = dbProduct.available_cup_sizes || [];

  // Get category from relation
  const category = dbProduct.product_categories?.[0]?.categories?.slug || 'autres';

  // Global stock
  const globalStock = dbProduct.stock || 0;

  // Build technical specs string
  const techSpecs: string[] = [];
  if (dbProduct.viscosity) techSpecs.push(`Viscosité: ${dbProduct.viscosity}`);
  if (dbProduct.capacity) techSpecs.push(`Contenance: ${dbProduct.capacity}`);
  if (dbProduct.api_norm) techSpecs.push(`Norme API: ${dbProduct.api_norm}`);
  if (dbProduct.acea_norm) techSpecs.push(`Norme ACEA: ${dbProduct.acea_norm}`);
  const composition = techSpecs.length > 0 ? techSpecs.join(' | ') : (dbProduct.composition || '');

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.title,
    price: dbProduct.price,
    originalPrice: dbProduct.compare_at_price || undefined,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80'],
    category,
    collection: '',
    colors,
    sizes,
    cupSizes,
    description: typeof dbProduct.description === 'string' ? dbProduct.description : (dbProduct.short_description || ''),
    composition,
    care: dbProduct.care_instructions || '',
    style: dbProduct.product_type || dbProduct.style || 'Classique',
    isNew: dbProduct.is_new || false,
    isBestseller: dbProduct.is_featured || false,
    stock: { global: globalStock },
  };
}

export function useProducts(params?: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  collectionSlug?: string;
  featured?: boolean;
  isNew?: boolean;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const data = await api.getProducts(params);
      return data?.map(transformProduct) || [];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const data = await api.getProductBySlug(slug);
      return data ? transformProduct(data as any) : null;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: 0, // Always fetch fresh data
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.getCategoryBySlug(slug),
    enabled: !!slug,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: api.getCollections,
  });
}

export function useCollection(slug: string) {
  return useQuery({
    queryKey: ['collection', slug],
    queryFn: () => api.getCollectionBySlug(slug),
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const data = await api.getProducts({ featured: true, limit: 8 });
      return data?.map(transformProduct) || [];
    },
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ['products', 'new'],
    queryFn: async () => {
      const data = await api.getProducts({ isNew: true, limit: 12 });
      return data?.map(transformProduct) || [];
    },
  });
}

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: ({ email, name }: { email: string; name?: string }) =>
      api.subscribeNewsletter(email, name),
  });
}

export function useContactSubmit() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; subject: string; message: string }) =>
      api.submitContactMessage(data),
  });
}
