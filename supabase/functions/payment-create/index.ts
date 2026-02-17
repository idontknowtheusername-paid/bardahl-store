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

    // Calculate shipping
    const shippingCost = shippingMethod === "pickup" ? 0 : 2000;
    const total = subtotal + shippingCost;

    console.log("💰 CALCUL DES MONTANTS:", {
      subtotal,
      shippingCost,
      total,
      items: orderItems.map(i => ({
        title: i.product_title,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.total_price
      }))
    });

    // Create order in DB (store raw amounts)
    const orderNumber = `CMD-${Date.now()}`;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: shipping.firstName,
        customer_email: shipping.email,
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

    // Create Genius Pay payment
    if (!GENIUS_PAY_API_KEY || !GENIUS_PAY_API_SECRET) {
      // GENIUS_PAY credentials not configured - return order without payment
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

    // Country code mapping for Genius Pay
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

    // Amount sent to Genius Pay (in XOF as per their API docs)
    const paymentAmount = total;

    console.log("🚀 ENVOI À GENIUS PAY:", {
      paymentAmount,
      currency: "XOF",
      total_from_db: total,
      subtotal,
      shipping: shippingCost,
      country_code: countryCode,
    });


    const customerData: Record<string, string> = {
      phone: shipping.phone,
      name: shipping.firstName,
    };
    if (shipping.email) customerData.email = shipping.email;

    const paymentPayload: Record<string, unknown> = {
      amount: paymentAmount,
      currency: "XOF",
      country_code: countryCode,
      description: `Commande ${orderNumber} - Bardahl`,
      success_url: `${frontendUrl}/checkout/callback?order_id=${order.id}`,
      error_url: `${frontendUrl}/checkout`,
      customer: customerData,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
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

    console.log("📥 RÉPONSE GENIUS PAY:", {
      status: paymentResponse.status,
      ok: paymentResponse.ok,
      full_response: paymentData,
      amount_sent: paymentAmount,
      amount_in_response: paymentData.data?.amount || paymentData.amount,
      checkout_url: paymentData.data?.checkout_url || paymentData.data?.payment_url,
    });


    if (!paymentResponse.ok) {
      const errorMsg = paymentData.error?.message || paymentData.message || "Erreur Genius Pay";
      const errorCode = paymentData.error?.code || "UNKNOWN";
      

      // Provide detailed error for debugging
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

    // Update order with payment reference
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
