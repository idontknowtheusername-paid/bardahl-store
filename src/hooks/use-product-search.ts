import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformProduct } from './use-supabase-api';

export function useProductSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['product-search', query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return [];

      const searchTerm = query.trim();

      console.log('🔍 Search term:', searchTerm);

      // Try fuzzy search function first (handles typos)
      const { data: fuzzyData, error: fuzzyError } = await supabase
        .rpc('search_products_fuzzy', { search_query: searchTerm });

      if (fuzzyError) {
        console.warn('Fuzzy search not available, falling back to basic search:', fuzzyError);
        
        // Fallback to basic search
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, alt_text),
            product_categories(categories(id, title, slug))
          `)
          .eq('is_active', true)
          .or(
            `title.ilike.%${searchTerm}%,` +
            `short_description.ilike.%${searchTerm}%,` +
            `sku.ilike.%${searchTerm}%,` +
            `viscosity.ilike.%${searchTerm}%`
          )
          .limit(50);

        if (error) {
          console.error('Search error:', error);
          return [];
        }

        if (!data || data.length === 0) {
          console.log('❌ No products found');
          return [];
        }

        console.log('✅ Found products (basic):', data.length);

        // Transform and return
        return data.map((product: any) => transformProduct(product));
      }

      // Fuzzy search succeeded
      if (!fuzzyData || fuzzyData.length === 0) {
        console.log('❌ No products found (fuzzy)');
        return [];
      }

      console.log('✅ Found products (fuzzy):', fuzzyData.length);

      // Get full product details for fuzzy results
      const productIds = fuzzyData.map((p: any) => p.id);
      
      const { data: fullProducts, error: detailsError } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, alt_text),
          product_categories(categories(id, title, slug))
        `)
        .in('id', productIds);

      if (detailsError || !fullProducts) {
        console.error('Error fetching product details:', detailsError);
        return [];
      }

      // Sort by fuzzy similarity score
      const sortedProducts = fullProducts.sort((a, b) => {
        const scoreA = fuzzyData.find((f: any) => f.id === a.id)?.similarity_score || 0;
        const scoreB = fuzzyData.find((f: any) => f.id === b.id)?.similarity_score || 0;
        return scoreB - scoreA;
      });

      console.log('✅ Returning sorted results:', sortedProducts.length);

      return sortedProducts.map((product: any) => transformProduct(product)).slice(0, 20);
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 60000, // Augmenté à 60s pour réduire les requêtes
    gcTime: 300000, // Garde en cache 5 minutes
  });
}
