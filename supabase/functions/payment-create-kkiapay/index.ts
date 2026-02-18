import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KKIAPAY_PUBLIC_KEY = Deno.env.get("KKIAPAY_PUBLIC_KEY");
const KKIAPAY_PRIVATE_KEY = Deno.env.get("KKIAPAY_PRIVATE_KEY");
const KKIAPAY_API_URL = "https://api.kkiapay.me/api/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { items, shipping, shippingMethod } = await req.json();

    // Calculate totals
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

    // Dynamic shipping calculation from DB
    let shippingCost = 0;
    if (shippingMethod !== "pickup") {
      const city = shipping.city || "";
      const country = shipping.country || "Bénin";

      const { data: zones } = await supabase
        .from("shipping_zones")
        .select("id, name, cities, countries")
        .eq("is_active", true);

      let matchedZoneId: string | null = null;
      if (zones) {
        for (const zone of zones) {
          const zoneCountries = (zone.countries as string[]) || [];
          const zoneCities = (zone.cities as string[]) || [];
          const countryMatch = zoneCountries.some(
            c => c.toLowerCase() === country.toLowerCase()
          );
          const cityMatch = zoneCities.length === 0 || zoneCities.some(
            c => c.toLowerCase() === city.toLowerCase()
          );
          if (countryMatch && cityMatch) {
            matchedZoneId = zone.id;
            break;
          }
        }
      }

      if (matchedZoneId) {
        const { data: rates } = await supabase
          .from("shipping_rates")
          .select("price, free_shipping_threshold, min_order_amount")
          .eq("shipping_zone_id", matchedZoneId)
          .eq("is_active", true)
          .order("price", { ascending: true });

        if (rates && rates.length > 0) {
          const rate = rates[0];
          const threshold = rate.free_shipping_threshold;
          if (threshold && subtotal >= threshold) {
            shippingCost = 0;
          } else {
            shippingCost = rate.price;
          }
        }
      } else {
        const { data: fallbackRates } = await supabase
          .from("shipping_rates")
          .select("price")
          .eq("is_active", true)
          .order("price", { ascending: true })
          .limit(1);
        shippingCost = fallbackRates?.[0]?.price ?? 2000;
      }
    }

    const total = subtotal + shippingCost;

    // Create order in DB
    const orderNumber = `CMD-${Date.now()}`;
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

    // Notify admin
    try {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("admin_email")
        .single();

      const adminEmail = (settings as any)?.admin_email;
      if (adminEmail) {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: adminEmail,
            subject: `Nouvelle commande ${orderNumber} - Bardahl`,
            template: "new_order_admin",
            data: {
              orderNumber,
              customerName: shipping.firstName,
              customerPhone: shipping.phone,
              customerEmail: shipping.email || "Non fourni",
              city: shipping.city,
              country: shipping.country || "Bénin",
              items: orderItems.map(i => ({
                title: i.product_title,
                quantity: i.quantity,
                unitPrice: i.unit_price,
                total: i.total_price,
              })),
              subtotal,
              shippingCost,
              total,
              shippingMethod,
            },
          }),
        });
      }
    } catch (_emailErr) {
      // Non-blocking
    }

    // Create KkiaPay payment
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

    // Store transaction ID for webhook verification
    await supabase
      .from("orders")
      .update({
        payment_gateway: "kkiapay",
      })
      .eq("id", order.id);

    // Return config for frontend widget
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
