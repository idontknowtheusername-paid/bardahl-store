import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KKIAPAY_WEBHOOK_SECRET = Deno.env.get("KKIAPAY_WEBHOOK_SECRET");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const payload = await req.json();
    console.log("KkiaPay webhook received:", JSON.stringify(payload));

    // Verify webhook signature - KkiaPay sends it in x-kkiapay-signature header
    const signature = req.headers.get("x-kkiapay-signature") || req.headers.get("x-kkiapay-secret");
    console.log("Headers - x-kkiapay-signature:", req.headers.get("x-kkiapay-signature"));
    console.log("Headers - x-kkiapay-secret:", req.headers.get("x-kkiapay-secret"));
    console.log("Expected secret:", KKIAPAY_WEBHOOK_SECRET);

    if (KKIAPAY_WEBHOOK_SECRET && signature !== KKIAPAY_WEBHOOK_SECRET) {
      console.error("Invalid webhook signature - received:", signature);
      return new Response("Unauthorized", { status: 401 });
    }

    const {
      transactionId,
      isPaymentSucces,
      event,
      performedAt,
    } = payload;

    // Find order by transaction ID
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_id", transactionId)
      .maybeSingle();

    if (!order) {
      // Try to find by order metadata in stateData
      const { data: orderByMetadata } = await supabase
        .from("orders")
        .select("*")
        .eq("payment_gateway", "kkiapay")
        .eq("payment_status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!orderByMetadata) {
        console.error("Order not found for transaction:", transactionId);
        return new Response("Order not found", { status: 404 });
      }

      // Update order with transaction ID
      await supabase
        .from("orders")
        .update({ payment_id: transactionId })
        .eq("id", orderByMetadata.id);

      // Use this order
      const updatedOrder = { ...orderByMetadata, payment_id: transactionId };
      return processWebhook(supabase, updatedOrder, payload, event, isPaymentSucces, performedAt);
    }

    return processWebhook(supabase, order, payload, event, isPaymentSucces, performedAt);
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function processWebhook(
  supabase: any,
  order: any,
  payload: any,
  event: string,
  isPaymentSucces: boolean,
  performedAt: string
) {
  // Update order based on event
  let updateData: any = {
    payment_gateway_response: payload,
  };

  if (event === "transaction.success" && isPaymentSucces) {
    updateData.payment_status = "paid";
    updateData.status = "confirmed";
    updateData.paid_at = performedAt || new Date().toISOString();
  } else if (event === "transaction.failed") {
    updateData.payment_status = "failed";
    updateData.status = "cancelled";
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", order.id);

  if (updateError) {
    console.error("Failed to update order:", updateError);
    throw updateError;
  }

  // Send emails if payment successful
  if (event === "transaction.success" && isPaymentSucces) {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch order items
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    // Send client confirmation email
    if (order.customer_email) {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: order.customer_email,
            subject: `Confirmation de commande ${order.order_number} - Bardahl`,
            template: "order_confirmation",
            data: {
              orderNumber: order.order_number,
              customerName: order.customer_name,
              total: order.total,
              shippingAddress: order.shipping_address,
            },
          }),
        });
      } catch (_emailErr) {
        console.error("Failed to send client confirmation email:", _emailErr);
      }
    }

    // Send admin notification email
    try {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("admin_email")
        .single();

      const adminEmail = (settings as any)?.admin_email;
      if (adminEmail && orderItems) {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: adminEmail,
            subject: `Nouvelle commande ${order.order_number} - Bardahl`,
            template: "new_order_admin",
            data: {
              orderNumber: order.order_number,
              customerName: order.customer_name,
              customerPhone: order.customer_phone,
              customerEmail: order.customer_email || "Non fourni",
              city: order.shipping_address?.city,
              country: order.shipping_address?.country || "Bénin",
              items: orderItems.map((i: any) => ({
                title: i.product_title,
                quantity: i.quantity,
                unitPrice: i.unit_price,
                total: i.total_price,
              })),
              subtotal: order.subtotal,
              shippingCost: order.shipping_cost,
              total: order.total,
              shippingMethod: order.shipping_method,
            },
          }),
        });
      }
    } catch (_emailErr) {
      console.error("Failed to send admin notification email:", _emailErr);
    }
  }

  console.log(`Order ${order.order_number} updated successfully`);

  return new Response(
    JSON.stringify({ success: true, message: "Webhook processed" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
