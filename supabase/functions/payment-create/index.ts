import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GENIUS_PAY_API_KEY = Deno.env.get("GENIUS_PAY_API_KEY");
const GENIUS_PAY_API_SECRET = Deno.env.get("GENIUS_PAY_API_SECRET");
const GENIUS_PAY_API_URL = "https://pay.genius.ci/api/v1/merchant";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { items, shipping, shippingMethod, shippingCost: frontendShippingCost } = await req.json();

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

    // Use frontend shipping cost if provided, otherwise calculate from DB
    let shippingCost = typeof frontendShippingCost === 'number' ? frontendShippingCost : 0;

    if (typeof frontendShippingCost !== 'number') {
      const isPickup = shippingMethod && (
        shippingMethod.toLowerCase().includes('récupérer') ||
        shippingMethod.toLowerCase().includes('boutique') ||
        shippingMethod.toLowerCase().includes('retrait') ||
        shippingMethod.toLowerCase().includes('pickup')
      );

      if (!isPickup) {
        const city = shipping.city || "";
        const country = shipping.country || "Bénin";

        const { data: zones } = await supabase
          .from("shipping_zones")
          .select("id, name, cities, countries")
          .eq("is_active", true);

        let matchedZoneId: string | null = null;
        if (zones) {
          for (const zone of zones) {
            const zoneCities = (zone.cities as string[]) || [];
            if (zoneCities.length > 0 && zoneCities.some(
              (c: string) => c.toLowerCase() === city.toLowerCase()
            )) {
              matchedZoneId = zone.id;
              break;
            }
          }
          if (!matchedZoneId) {
            for (const zone of zones) {
              const zoneCountries = (zone.countries as string[]) || [];
              const zoneCities = (zone.cities as string[]) || [];
              if (zoneCities.length === 0 && zoneCountries.some(
                (c: string) => c.toLowerCase() === country.toLowerCase()
              )) {
                matchedZoneId = zone.id;
                break;
              }
            }
          }
        }

        if (matchedZoneId) {
          const { data: rates } = await supabase
            .from("shipping_rates")
            .select("name, price, free_shipping_threshold")
            .eq("shipping_zone_id", matchedZoneId)
            .eq("is_active", true)
            .order("price", { ascending: true });

          if (rates && rates.length > 0) {
            const matchedRate = rates.find((r: any) =>
              shippingMethod && r.name.toLowerCase().includes(shippingMethod.toLowerCase().split(' ')[0])
            ) || rates[0];

            if (matchedRate.free_shipping_threshold && subtotal >= matchedRate.free_shipping_threshold) {
              shippingCost = 0;
            } else {
              shippingCost = matchedRate.price;
            }
          }
        } else {
          shippingCost = 1000;
        }
      }
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
        payment_gateway: "genius_pay",
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

    // Notify admin of new order
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
      // Admin email failure is non-blocking
    }

    // Create Genius Pay payment
    if (!GENIUS_PAY_API_KEY || !GENIUS_PAY_API_SECRET) {
      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          order_number: orderNumber,
          amount: total,
          message: "Commande créée (paiement non configuré)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const countryCodeMap: Record<string, string> = {
      "Bénin": "BJ", "Benin": "BJ",
      "Côte d'Ivoire": "CI", "Cote d'Ivoire": "CI",
      "Sénégal": "SN", "Senegal": "SN",
      "Mali": "ML", "Burkina Faso": "BF",
      "Togo": "TG", "Niger": "NE",
      "Guinée": "GN", "Guinee": "GN",
      "Cameroun": "CM", "Congo": "CG",
    };
    const countryCode = countryCodeMap[shipping.country] || "BJ";

    const frontendUrl = "https://bardahl.maxiimarket.com";
    const customerData: Record<string, string> = {
      phone: shipping.phone,
      name: shipping.firstName,
    };
    if (shipping.email) customerData.email = shipping.email;

    const paymentPayload: Record<string, unknown> = {
      amount: total,
      currency: "XOF",
      country_code: countryCode,
      method_payment: countryCode === "BJ" ? "mtn_money" : undefined,
      description: `Commande ${orderNumber} - Bardahl`,
      success_url: `${frontendUrl}/checkout/callback?order_id=${order.id}`,
      error_url: `${frontendUrl}/checkout`,
      customer: customerData,
      metadata: { order_id: order.id, order_number: orderNumber },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    console.log("Calling GeniusPay API with payload:", JSON.stringify(paymentPayload));

    let paymentResponse;
    try {
      paymentResponse = await fetch(`${GENIUS_PAY_API_URL}/payments`, {
        method: "POST",
        headers: {
          "X-API-Key": GENIUS_PAY_API_KEY,
          "X-API-Secret": GENIUS_PAY_API_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
        signal: controller.signal,
      });
    } catch (_fetchError) {
      clearTimeout(timeoutId);
      console.error("GeniusPay fetch error:", _fetchError);
      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          order_number: orderNumber,
          amount: total,
          payment_error: true,
          error_details: "Impossible de contacter Genius Pay. Veuillez réessayer.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    clearTimeout(timeoutId);
    const paymentData = await paymentResponse.json();

    console.log("GeniusPay response status:", paymentResponse.status);
    console.log("GeniusPay response data:", JSON.stringify(paymentData));

    if (!paymentResponse.ok) {
      const errorMsg = paymentData.error?.message || paymentData.message || "Erreur Genius Pay";
      const errorCode = paymentData.error?.code || "UNKNOWN";
      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          order_number: orderNumber,
          amount: total,
          payment_error: true,
          error_code: errorCode,
          error_details: errorMsg,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("orders")
      .update({
        payment_id: paymentData.data?.id?.toString() || paymentData.data?.reference,
        payment_gateway_id: paymentData.data?.reference,
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: orderNumber,
        payment_url: paymentData.data?.checkout_url || paymentData.data?.payment_url,
        amount: total,
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
