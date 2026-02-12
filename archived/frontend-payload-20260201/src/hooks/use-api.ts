import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productsApi,
  categoriesApi,
  collectionsApi,
  shippingApi,
  checkoutApi,
  newsletterApi,
  contactApi,
  siteSettingsApi,
  type CartItem,
  type ShippingInfo,
  type PayloadProduct,
  getImageUrl,
} from '@/lib/api-payload';
import { products as mockProducts, categories as mockCategories } from '@/data/products';
import type { Product } from '@/types/product';

// Transform Payload product to local Product format
function transformPayloadProduct(p: PayloadProduct): Product {
  const colors = p.variants
    ?.filter((v, i, arr) => arr.findIndex(x => x.color === v.color) === i)
    .map(v => ({ name: v.color || 'Default', hex: v.colorCode || '#000000' })) || [];

  const sizes = p.variants
    ?.filter((v, i, arr) => arr.findIndex(x => x.size === v.size) === i)
    .map(v => ({ size: v.size || 'One Size', available: (v.stock || 0) > 0 })) || [];

  return {
    id: p.id,
    slug: p.slug,
    name: p.title,
    price: p.price,
    originalPrice: p.compareAtPrice,
    images: p.gallery?.map(g => getImageUrl(g.image)) || ['/placeholder.svg'],
    category: p.categories?.[0]?.slug || '',
    collection: p.collections?.[0]?.title || '',
    colors: colors.length > 0 ? colors : [{ name: 'Default', hex: '#000000' }],
    sizes: sizes.length > 0 ? sizes : [{ size: 'One Size', available: true }],
    cupSizes: p.variants?.filter(v => v.cupSize).map(v => v.cupSize!) || undefined,
    description: p.shortDescription || '',
    composition: p.composition || '',
    care: p.careInstructions || '',
    style: p.style || 'Classique',
    isNew: p.isNew,
    isBestseller: p.isFeatured,
    stock: {},
  };
}

// Products hooks with fallback to mock data
export function useProducts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  collection?: string;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const result = await productsApi.getAll(params);
        // Transform Payload products to local format
        return {
          ...result,
          docs: result.docs.map(transformPayloadProduct),
        };
      } catch (error) {
        console.warn('Using mock products data as fallback');
        // Fallback to mock data
        let filtered = mockProducts;

        if (params?.category) {
          filtered = filtered.filter(p => p.category === params.category);
        }

        if (params?.search) {
          const search = params.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.description?.toLowerCase().includes(search)
          );
        }

        return {
          docs: filtered,
          totalDocs: filtered.length,
          page: params?.page || 1,
          totalPages: Math.ceil(filtered.length / (params?.pageSize || 12)),
          hasNextPage: false,
          hasPrevPage: false,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        return await productsApi.getBySlug(slug);
      } catch (error) {
        console.warn('Using mock product data as fallback');
        return mockProducts.find(p => p.slug === slug) || null;
      }
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      try {
        const result = await productsApi.getFeatured();
        return result.map(transformPayloadProduct);
      } catch (error) {
        console.warn('Using mock featured products as fallback');
        return mockProducts.filter(p => p.isBestseller).slice(0, 8);
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: async () => {
      try {
        const result = await productsApi.getNewArrivals();
        return result.map(transformPayloadProduct);
      } catch (error) {
        console.warn('Using mock new arrivals as fallback');
        return mockProducts.filter(p => p.isNew).slice(0, 8);
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: ['products', 'related', productId],
    queryFn: async () => {
      try {
        const result = await productsApi.getRelated(productId);
        return result.map(transformPayloadProduct);
      } catch (error) {
        console.warn('Using mock related products as fallback');
        const product = mockProducts.find(p => p.id === productId);
        if (!product) return [];
        return mockProducts
          .filter(p => p.category === product.category && p.id !== productId)
          .slice(0, 4);
      }
    },
    enabled: !!productId,
  });
}

// Categories hooks with fallback to mock data
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const result = await categoriesApi.getAll();
        // If backend returns data, use it
        if (result && result.length > 0) {
          return result;
        }
        // If backend returns empty array, fallback to mock
        throw new Error('No categories from backend');
      } catch (error) {
        console.warn('Using mock categories data as fallback');
        // mockCategories in products.ts are the 6 categories
        return mockCategories.map((c, index) => ({
          id: c.id,
          title: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image ? { id: c.id, url: c.image, alt: c.name, filename: '', mimeType: '' } : undefined,
          order: index,
          isActive: true,
        }));
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      try {
        const result = await categoriesApi.getBySlug(slug);
        if (result) return result;
        throw new Error('Category not found');
      } catch (error) {
        console.warn('Using mock category data as fallback');
        const mockCat = mockCategories.find(c => c.slug === slug);
        if (!mockCat) return null;
        return {
          id: mockCat.id,
          title: mockCat.name,
          slug: mockCat.slug,
          description: mockCat.description,
          image: mockCat.image ? { id: mockCat.id, url: mockCat.image, alt: mockCat.name, filename: '', mimeType: '' } : undefined,
          order: 0,
          isActive: true,
        };
      }
    },
    enabled: !!slug,
  });
}

// Collections hooks (thematic collections, not categories)
export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      try {
        const result = await collectionsApi.getAll();
        if (result && result.length > 0) {
          return result;
        }
        throw new Error('No collections from backend');
      } catch (error) {
        console.warn('Using mock collections data as fallback');
        // For now, return empty array since we don't have thematic collections in mock data
        // The seed has: Collection Saint-Valentin, Essentiels du Quotidien, etc.
        return [];
      }
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useCollection(slug: string) {
  return useQuery({
    queryKey: ['collection', slug],
    queryFn: async () => {
      try {
        const result = await collectionsApi.getBySlug(slug);
        if (result) return result;
        throw new Error('Collection not found');
      } catch (error) {
        console.warn('Collection not found in backend or mock');
        return null;
      }
    },
    enabled: !!slug,
  });
}

export function useFeaturedCollections() {
  return useQuery({
    queryKey: ['collections', 'featured'],
    queryFn: async () => {
      try {
        const result = await collectionsApi.getFeatured();
        if (result && result.length > 0) {
          return result;
        }
        throw new Error('No featured collections');
      } catch (error) {
        console.warn('No featured collections available');
        return [];
      }
    },
    staleTime: 30 * 60 * 1000,
  });
}

// Shipping hooks
export function useCalculateShipping() {
  return useMutation({
    mutationFn: ({
      city,
      cartTotal,
      shippingMethodId,
      country,
    }: {
      city: string;
      cartTotal: number;
      shippingMethodId?: string;
      country?: string;
    }) => shippingApi.calculateShipping(city, cartTotal, shippingMethodId, country),
  });
}

// Checkout hook
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      items,
      shippingInfo,
      shippingMethodId,
      customerNote,
      billingInfo,
    }: {
      items: CartItem[];
      shippingInfo: ShippingInfo;
      shippingMethodId: string;
      customerNote?: string;
      billingInfo?: ShippingInfo;
    }) => checkoutApi.createOrder(items, shippingInfo, shippingMethodId, customerNote, billingInfo),
    onSuccess: () => {
      // Invalidate product queries to refresh stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Newsletter hook
export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: ({ email, firstName }: { email: string; firstName?: string }) =>
      newsletterApi.subscribe(email, firstName),
  });
}

// Contact hook
export function useContactSubmit() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; subject: string; message: string }) =>
      contactApi.submit(data),
  });
}

// Site settings hook
export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: () => siteSettingsApi.get(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Re-export types
export type { CartItem, ShippingInfo } from '@/lib/api-payload';
