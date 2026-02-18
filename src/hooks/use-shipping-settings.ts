import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ShippingSettings {
  freeShippingThreshold: number | null;
  defaultRate: number | null;
}

export function useShippingSettings(): ShippingSettings & { isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['shipping-settings'],
    queryFn: async () => {
      const { data: rates } = await supabase
        .from('shipping_rates')
        .select('price, free_shipping_threshold')
        .eq('is_active', true)
        .order('free_shipping_threshold', { ascending: false })
        .limit(10);

      if (!rates || rates.length === 0) return { freeShippingThreshold: null, defaultRate: null };

      // Find the lowest free_shipping_threshold that is set
      const thresholds = rates
        .map(r => r.free_shipping_threshold)
        .filter((t): t is number => t !== null && t > 0);

      const freeShippingThreshold = thresholds.length > 0 ? Math.min(...thresholds) : null;
      const defaultRate = rates[0]?.price ?? null;

      return { freeShippingThreshold, defaultRate };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    freeShippingThreshold: data?.freeShippingThreshold ?? null,
    defaultRate: data?.defaultRate ?? null,
    isLoading,
  };
}
