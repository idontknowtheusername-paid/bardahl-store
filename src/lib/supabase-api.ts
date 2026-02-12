// API Client pour Supabase - Cannesh Lingerie
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type ProductCollection = Database['public']['Tables']['product_collections']['Row'];

// =====================================================
// PRODUCTS
// =====================================================

export async function getProducts(params?: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  collectionSlug?: string;
  featured?: boolean;
  isNew?: boolean;
}) {
  // If filtering by category, use a JOIN to filter at query level
  if (params?.categorySlug) {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (image_url, alt_text, display_order),
        product_categories!inner (
          categories!inner (id, title, slug)
        )
      `)
      .eq('is_active', true)
      .eq('product_categories.categories.slug', params.categorySlug)
      .order('created_at', { ascending: false });

    if (params?.featured) query = query.eq('is_featured', true);
    if (params?.isNew) query = query.eq('is_new', true);
    if (params?.limit) query = query.limit(params.limit);
    if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Otherwise, fetch all products and attach categories
  let query = supabase
    .from('products')
    .select(`
      *,
      product_images (image_url, alt_text, display_order)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (params?.featured) query = query.eq('is_featured', true);
  if (params?.isNew) query = query.eq('is_new', true);
  if (params?.limit) query = query.limit(params.limit);
  if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

  const { data, error } = await query;
  if (error) throw error;

  // Fetch categories for each product
  if (data && data.length > 0) {
    const productIds = data.map(p => p.id);
    const { data: categoriesData } = await supabase
      .from('product_categories')
      .select('product_id, categories (id, title, slug)')
      .in('product_id', productIds);

    // Attach categories to products
    data.forEach((product: any) => {
      product.product_categories = categoriesData?.filter(
        (pc: any) => pc.product_id === product.id
      ) || [];
    });
  }

  return data;
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (image_url, alt_text, display_order)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;

  // Fetch categories separately
  if (data) {
    const { data: categories } = await supabase
      .from('product_categories')
      .select('categories (id, title, slug)')
      .eq('product_id', data.id);

    (data as any).product_categories = categories;
  }

  return data;
}

// =====================================================
// CATEGORIES
// =====================================================

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// COLLECTIONS
// =====================================================

export async function getCollections() {
  const { data, error } = await supabase
    .from('product_collections')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCollectionBySlug(slug: string) {
  const { data, error } = await supabase
    .from('product_collections')
    .select(`
      *,
      product_collection_items (
        products (
          id, title, slug, price, stock,
          product_images (image_url, alt_text)
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// NEWSLETTER
// =====================================================

export async function subscribeNewsletter(email: string, name?: string) {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, name, status: 'active', source: 'website' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// CONTACT
// =====================================================

export async function submitContactMessage(message: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}
