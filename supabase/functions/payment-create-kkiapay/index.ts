import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KKIAPAY_PUBLIC_KEY = Deno.env.get("KKIAPAY_PUBLIC_KEY");
const KKIAPAY_PRIVATE_KEY = Deno.env.get("KKIAPAY_PRIVATE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { items, shipping, shippingMethod, shippingCost: frontendShippingCost } = await req.json();

    // Calculate subtotal from DB prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("price, title")
        .eq("id", item.productId)
        .single();

      if (!product) throw new Error(`Product ${item.productId} not found`);

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.productId,
        product_title: product.title,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
        size: item.size || null,
        color: item.color || null,
      });
    }

    // Use frontend shipping cost if provided, otherwise calculate from DB
    let shippingCost = typeof frontendShippingCost === 'number' ? frontendShippingCost : 0;

    // If no explicit cost provided, calculate from DB
    if (typeof frontendShippingCost !== 'number') {
      shippingCost = await calculateShippingFromDB(supabase, shipping, shippingMethod, subtotal);
    }

    const total = subtotal + shippingCost;

    // Create order in DB
    const orderNumber = `BARDHAL-${Date.now()}`;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: shipping.firstName,
        customer_email: shipping.email || null,
        customer_phone: shipping.phone,
        shipping_address: {
          address: shipping.address,
          city: shipping.city,
          country: shipping.country || "Bénin",
        },
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
        subtotal,
        total,
        status: "pending",
        payment_status: "pending",
        payment_gateway: "kkiapay",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));
    await supabase.from("order_items").insert(itemsWithOrderId);

    // Return KkiaPay config
    if (!KKIAPAY_PUBLIC_KEY || !KKIAPAY_PRIVATE_KEY) {
      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          order_number: orderNumber,
          amount: total,
          message: "Commande créée (KkiaPay non configuré)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending to frontend - Total: ${total} Subtotal: ${subtotal} Shipping: ${shippingCost}`);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: orderNumber,
        amount: total,
        payment_method: "kkiapay",
        kkiapay_config: {
          public_key: KKIAPAY_PUBLIC_KEY,
          amount: total,
          sandbox: KKIAPAY_PUBLIC_KEY.startsWith("0cf") || KKIAPAY_PUBLIC_KEY.startsWith("tpk_"),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

async function calculateShippingFromDB(supabase: any, shipping: any, shippingMethod: string, subtotal: number): Promise<number> {
  const isPickup = shippingMethod && (
    shippingMethod.toLowerCase().includes('récupérer') ||
    shippingMethod.toLowerCase().includes('boutique') ||
    shippingMethod.toLowerCase().includes('retrait') ||
    shippingMethod.toLowerCase().includes('pickup')
  );
  if (isPickup) return 0;

  const city = shipping.city || "";
  const country = shipping.country || "Bénin";

  const { data: zones } = await supabase
    .from("shipping_zones")
    .select("id, name, cities, countries")
    .eq("is_active", true);

  let matchedZoneId: string | null = null;
  if (zones) {
    // Match by city first
    for (const zone of zones) {
      const zoneCities = (zone.cities as string[]) || [];
      if (zoneCities.length > 0 && zoneCities.some((c: string) => c.toLowerCase() === city.toLowerCase())) {
        matchedZoneId = zone.id;
        break;
      }
    }
    // Then by country (zones with empty cities = catch-all for country)
    if (!matchedZoneId) {
      for (const zone of zones) {
        const zoneCountries = (zone.countries as string[]) || [];
        const zoneCities = (zone.cities as string[]) || [];
        if (zoneCities.length === 0 && zoneCountries.some((c: string) => c.toLowerCase() === country.toLowerCase())) {
          matchedZoneId = zone.id;
          break;
        }
      }
    }
  }

  if (!matchedZoneId) return 1000; // Default fallback

  const { data: rates } = await supabase
    .from("shipping_rates")
    .select("name, price, free_shipping_threshold")
    .eq("shipping_zone_id", matchedZoneId)
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (!rates || rates.length === 0) return 1000;

  // Match by method name
  const matchedRate = rates.find((r: any) =>
    shippingMethod && r.name.toLowerCase().includes(shippingMethod.toLowerCase().split(' ')[0])
  ) || rates[0];

  if (matchedRate.free_shipping_threshold && subtotal >= matchedRate.free_shipping_threshold) {
    return 0;
  }
  return matchedRate.price;
}
