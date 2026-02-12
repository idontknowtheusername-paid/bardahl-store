import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ShippingRequest {
  city: string;
  country?: string;
  subtotal: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, country = "Bénin", subtotal }: ShippingRequest = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find matching shipping zone
    const { data: zones, error: zonesError } = await supabase
      .from("shipping_zones")
      .select(`
        id,
        name,
        countries,
        cities,
        shipping_rates (
          id,
          name,
          price,
          description,
          delivery_time,
          free_shipping_threshold,
          min_order_amount,
          is_active
        )
      `)
      .eq("is_active", true);

    if (zonesError) throw zonesError;

    // Find matching zone by city or country
    let matchingZone = zones?.find(zone => {
      const cityMatch = zone.cities?.some(
        (c: string) => c.toLowerCase() === city.toLowerCase()
      );
      const countryMatch = zone.countries?.some(
        (c: string) => c.toLowerCase() === country.toLowerCase()
      );
      return cityMatch || countryMatch;
    });

    // Fallback to default zone
    if (!matchingZone) {
      matchingZone = zones?.find(zone => zone.name.toLowerCase().includes("default"));
    }

    if (!matchingZone || !matchingZone.shipping_rates?.length) {
      return new Response(
        JSON.stringify({
          success: true,
          rates: [{
            id: "default",
            name: "Livraison standard",
            price: 2000,
            description: "Livraison sous 3-5 jours",
            delivery_time: "3-5 jours",
            isFree: false,
          }],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate rates with free shipping threshold
    const rates = matchingZone.shipping_rates
      .filter((rate: any) => rate.is_active)
      .filter((rate: any) => !rate.min_order_amount || subtotal >= rate.min_order_amount)
      .map((rate: any) => {
        const isFree = rate.free_shipping_threshold && subtotal >= rate.free_shipping_threshold;
        return {
          id: rate.id,
          name: rate.name,
          price: isFree ? 0 : rate.price,
          originalPrice: rate.price,
          description: rate.description,
          delivery_time: rate.delivery_time,
          isFree,
        };
      });

    return new Response(
      JSON.stringify({ success: true, rates }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Shipping calculate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
