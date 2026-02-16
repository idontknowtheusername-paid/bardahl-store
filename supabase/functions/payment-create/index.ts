import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GENIUS_PAY_API_KEY = Deno.env.get("GENIUS_PAY_API_KEY");
const GENIUS_PAY_API_URL = "https://api.pay.genius.ci/v1";

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

    // Create order
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
          country: shipping.country || "Côte d'Ivoire",
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
    if (!GENIUS_PAY_API_KEY) {
      // Fallback: return order without payment URL for testing
      console.warn("GENIUS_PAY_API_KEY not configured - returning order without payment");
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

    const frontendUrl = "https://bardahl.maxiimarket.com";
    const paymentResponse = await fetch(`${GENIUS_PAY_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GENIUS_PAY_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: total,
        currency: "XOF",
        description: `Commande ${orderNumber} - Bardahl`,
        return_url: `${frontendUrl}/checkout/callback?order_id=${order.id}`,
        cancel_url: `${frontendUrl}/checkout`,
        callback_url: `${SUPABASE_URL}/functions/v1/payment-webhook`,
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
        },
        customer: {
          email: shipping.email,
          phone: shipping.phone,
          name: shipping.firstName,
        },
      }),
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error("Genius Pay error:", paymentData);
      throw new Error(paymentData.message || "Payment creation failed");
    }

    // Update order with payment ID
    await supabase
      .from("orders")
      .update({
        payment_id: paymentData.id || paymentData.payment_id,
        payment_gateway_id: paymentData.id || paymentData.payment_id,
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: orderNumber,
        payment_url: paymentData.checkout_url || paymentData.payment_url || paymentData.url,
        amount: total,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment create error:", error);
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
