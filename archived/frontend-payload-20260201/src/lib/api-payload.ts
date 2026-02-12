// API Client pour Payload CMS Backend - Cannesh Lingerie

const API_URL = import.meta.env.VITE_PAYLOAD_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Payload response format
interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Product types matching Payload schema
export interface PayloadProduct {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: any; // RichText
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  style?: string;
  composition?: string;
  careInstructions?: string;
  enableVariants?: boolean;
  gallery?: Array<{
    image: PayloadMedia;
    alt?: string;
  }>;
  variants?: Array<{
    size?: string;
    color?: string;
    colorCode?: string;
    cupSize?: string;
    stock: number;
    additionalPrice: number;
  }>;
  categories?: PayloadCategory[];
  collections?: PayloadCollection[];
  relatedProducts?: PayloadProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface PayloadCategory {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: PayloadMedia;
  order: number;
  isActive: boolean;
  parent?: PayloadCategory;
}

export interface PayloadCollection {
  id: string;
  title: string;
  slug: string;
  description?: any;
  image?: PayloadMedia;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isFeatured: boolean;
  products?: PayloadProduct[];
}

export interface PayloadMedia {
  id: string;
  url: string;
  alt?: string;
  filename: string;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface ShippingInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  country?: string;
}

export interface CartItem {
  productId: string;
  variantIndex?: number;
  quantity: number;
  size?: string;
  color?: string;
  cupSize?: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderNumber: string;
  orderId: string;
  total: number;
}

export interface ShippingCalculation {
  shippingCost: number;
  freeShipping: boolean;
  deliveryTime: string;
  rateName?: string;
  zoneName?: string;
  error?: string;
}

// Helper to build full image URL
export const getImageUrl = (media: PayloadMedia | string | undefined): string => {
  if (!media) return '/placeholder.svg';
  
  if (typeof media === 'string') {
    if (media.startsWith('http')) return media;
    return `${API_URL}${media}`;
  }
  
  if (media.url) {
    if (media.url.startsWith('http')) return media.url;
    return `${API_URL}${media.url}`;
  }
  
  return '/placeholder.svg';
};

// Fetch wrapper with error handling and fallback support
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.errors?.[0]?.message || error.message || 'Erreur API');
    }

    return response.json();
  } catch (error) {
    // Log error for debugging but don't expose to user
    console.warn(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Build Payload query string
function buildPayloadQuery(params: {
  where?: Record<string, any>;
  sort?: string;
  limit?: number;
  page?: number;
  depth?: number;
}): string {
  const queryParts: string[] = [];
  
  if (params.where) {
    // Convert where object to Payload query string format
    Object.entries(params.where).forEach(([field, condition]) => {
      if (typeof condition === 'object') {
        Object.entries(condition).forEach(([operator, value]) => {
          queryParts.push(`where[${field}][${operator}]=${encodeURIComponent(String(value))}`);
        });
      } else {
        queryParts.push(`where[${field}][equals]=${encodeURIComponent(String(condition))}`);
      }
    });
  }
  
  if (params.sort) queryParts.push(`sort=${params.sort}`);
  if (params.limit) queryParts.push(`limit=${params.limit}`);
  if (params.page) queryParts.push(`page=${params.page}`);
  if (params.depth !== undefined) queryParts.push(`depth=${params.depth}`);
  
  return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
}

// Products API
export const productsApi = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    collection?: string;
    search?: string;
    sort?: string;
  }): Promise<PayloadResponse<PayloadProduct>> {
    const where: Record<string, any> = {
      isActive: { equals: true },
    };
    
    if (params?.category) {
      where['categories.slug'] = { equals: params.category };
    }
    
    if (params?.collection) {
      where['collections.slug'] = { equals: params.collection };
    }
    
    if (params?.search) {
      where.or = [
        { title: { contains: params.search } },
        { shortDescription: { contains: params.search } },
      ];
    }
    
    const query = buildPayloadQuery({
      where,
      limit: params?.pageSize || 12,
      page: params?.page || 1,
      sort: params?.sort || '-createdAt',
      depth: 2,
    });
    
    return fetchAPI<PayloadResponse<PayloadProduct>>(`/products${query}`);
  },

  async getBySlug(slug: string): Promise<PayloadProduct | null> {
    const query = buildPayloadQuery({
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    });
    
    const response = await fetchAPI<PayloadResponse<PayloadProduct>>(`/products${query}`);
    return response.docs[0] || null;
  },

  async getFeatured(): Promise<PayloadProduct[]> {
    return fetchAPI<PayloadProduct[]>('/products/featured');
  },

  async getNewArrivals(): Promise<PayloadProduct[]> {
    return fetchAPI<PayloadProduct[]>('/products/new-arrivals');
  },

  async getRelated(productId: string): Promise<PayloadProduct[]> {
    return fetchAPI<PayloadProduct[]>(`/products/related/${productId}`);
  },
};

// Categories API
export const categoriesApi = {
  async getAll(): Promise<PayloadCategory[]> {
    const query = buildPayloadQuery({
      where: { isActive: { equals: true } },
      sort: 'order',
      depth: 1,
      limit: 100,
    });
    
    const response = await fetchAPI<PayloadResponse<PayloadCategory>>(`/categories${query}`);
    return response.docs;
  },

  async getBySlug(slug: string): Promise<PayloadCategory | null> {
    const query = buildPayloadQuery({
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
    });
    
    const response = await fetchAPI<PayloadResponse<PayloadCategory>>(`/categories${query}`);
    return response.docs[0] || null;
  },
};

// Collections API
export const collectionsApi = {
  async getAll(): Promise<PayloadCollection[]> {
    const query = buildPayloadQuery({
      where: { isActive: { equals: true } },
      depth: 1,
      limit: 100,
    });
    
    const response = await fetchAPI<PayloadResponse<PayloadCollection>>(`/productCollections${query}`);
    return response.docs;
  },

  async getBySlug(slug: string): Promise<PayloadCollection | null> {
    const query = buildPayloadQuery({
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    });
    
    const response = await fetchAPI<PayloadResponse<PayloadCollection>>(`/productCollections${query}`);
    return response.docs[0] || null;
  },

  async getFeatured(): Promise<PayloadCollection[]> {
    const query = buildPayloadQuery({
      where: {
        isActive: { equals: true },
        isFeatured: { equals: true },
      },
      depth: 1,
      limit: 10,
    });
    
    const response = await fetchAPI<PayloadResponse<PayloadCollection>>(`/productCollections${query}`);
    return response.docs;
  },
};

// Shipping API
export const shippingApi = {
  async calculateShipping(
    city: string,
    cartTotal: number,
    shippingMethodId?: string,
    country: string = 'Bénin'
  ): Promise<ShippingCalculation> {
    return fetchAPI<ShippingCalculation>('/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({
        city,
        country,
        cartTotal,
        shippingMethodId,
      }),
    });
  },
};

// Checkout API
export const checkoutApi = {
  async createOrder(
    items: CartItem[],
    shippingInfo: ShippingInfo,
    shippingMethodId: string,
    customerNote?: string,
    billingInfo?: ShippingInfo
  ): Promise<CheckoutResponse> {
    return fetchAPI<CheckoutResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items,
        shippingInfo,
        billingInfo,
        shippingMethodId,
        customerNote,
      }),
    });
  },
};

// Newsletter API
export const newsletterApi = {
  async subscribe(email: string, firstName?: string): Promise<{ success: boolean; message: string }> {
    return fetchAPI<{ success: boolean; message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, firstName }),
    });
  },
};

// Contact API
export const contactApi = {
  async submit(data: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> {
    return fetchAPI<{ success: boolean; message: string }>('/contact/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Site Settings API
export const siteSettingsApi = {
  async get(): Promise<{
    siteName: string;
    siteDescription?: string;
    contactEmail?: string;
    contactPhone?: string;
    whatsappNumber?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    currency: string;
    minimumOrderAmount: number;
    maintenanceMode: boolean;
    announcementBar?: string;
  }> {
    return fetchAPI('/globals/siteSettings');
  },
};

// Export API URL for reference
export { API_URL };
