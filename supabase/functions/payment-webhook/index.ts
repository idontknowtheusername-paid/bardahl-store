import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const LYGOS_API_KEY = Deno.env.get("LYGOS_API_KEY");
const LYGOS_API_URL = "https://api.lygos.app";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS for client requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const body = await req.json();

    // Check if this is a webhook from Lygos (has 'event' field)
    if (body.event) {
      return await handleLygosWebhook(body, supabase);
    }

    // Otherwise, it's a payment creation request from frontend
    return await handlePaymentCreation(body, supabase);
  } catch (error) {
    console.error("Payment error:", error);
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

// Handle payment creation from frontend
async function handlePaymentCreation(body: any, supabase: any) {
  const { items, shipping, shippingMethod } = body;

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
      quantity: item.quantity,
      price: product.price,
      size: item.size,
      color: item.color,
      cup_size: item.cupSize,
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
      shipping_first_name: shipping.firstName,
      shipping_email: shipping.email,
      shipping_phone: shipping.phone,
      shipping_city: shipping.city,
      shipping_address: shipping.address,
      shipping_country: shipping.country || "Bénin",
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

  // Create Lygos payment
  if (!LYGOS_API_KEY) {
    throw new Error("LYGOS_API_KEY not configured");
  }

  const frontendUrl = "https://canneshlingerie.maxiimarket.com";
  const lygosResponse = await fetch(`${LYGOS_API_URL}/v1/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LYGOS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: total,
      currency: "XOF",
      description: `Commande ${orderNumber}`,
      return_url: `${frontendUrl}/checkout/callback?order_id=${order.id}`,
      cancel_url: `${frontendUrl}/checkout`,
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

  const lygosData = await lygosResponse.json();

  if (!lygosResponse.ok) {
    console.error("Lygos error:", lygosData);
    throw new Error(lygosData.message || "Payment creation failed");
  }

  // Update order with payment ID
  await supabase
    .from("orders")
    .update({ payment_id: lygosData.id })
    .eq("id", order.id);

  return new Response(
    JSON.stringify({
      success: true,
      order_id: order.id,
      order_number: orderNumber,
      payment_url: lygosData.checkout_url,
      amount: total,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Handle webhook from Lygos
async function handleLygosWebhook(body: any, supabase: any) {
  console.log("Lygos webhook received:", JSON.stringify(body, null, 2));

  const { event, data } = body;

  if (event === "payment.succeeded" || event === "payment.paid") {
    const orderId = data.metadata?.order_id;

    if (orderId) {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          payment_transaction_id: data.id,
          payment_gateway_id: data.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
        throw error;
      }

      console.log(`Order ${orderId} updated to paid`);
    }
  } else if (event === "payment.failed") {
    const orderId = data.metadata?.order_id;

    if (orderId) {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
      }

      console.log(`Order ${orderId} marked as failed`);
    }
  }

  return new Response(
    JSON.stringify({ received: true }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
}
