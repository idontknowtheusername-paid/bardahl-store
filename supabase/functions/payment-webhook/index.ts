import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("GENIUS_PAY_WEBHOOK_SECRET");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Verify webhook signature if secret is configured
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get("x-geniuspay-signature") || req.headers.get("x-webhook-signature");
      if (!signature) {
        console.error("Missing webhook signature");
        return new Response(JSON.stringify({ error: "Missing signature" }), { status: 401 });
      }
      // Note: GeniusPay signature verification would go here
      // For now, we'll accept if signature header is present
    }

    const body = await req.json();
    console.log("Payment webhook received:", JSON.stringify(body, null, 2));

    // Handle Genius Pay webhook
    const event = body.event || body.type || body.status;
    const data = body.data || body;

    if (event === "payment.succeeded" || event === "payment.success" || event === "payment.paid" || event === "succeeded" || event === "paid") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        const { error } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            payment_transaction_id: data.id || data.reference || body.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
        if (error) { console.error("Error updating order:", error); throw error; }
        console.log(`Order ${orderId} updated to paid`);
      }
    } else if (event === "payment.failed" || event === "failed") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        await supabase
          .from("orders")
          .update({ payment_status: "failed", updated_at: new Date().toISOString() })
          .eq("id", orderId);
        console.log(`Order ${orderId} marked as failed`);
      }
    } else if (event === "payment.cancelled" || event === "cancelled") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        await supabase
          .from("orders")
          .update({ payment_status: "cancelled", status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", orderId);
        console.log(`Order ${orderId} marked as cancelled`);
      }
    } else if (event === "payment.refunded" || event === "refunded") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        await supabase
          .from("orders")
          .update({ payment_status: "refunded", status: "refunded", updated_at: new Date().toISOString() })
          .eq("id", orderId);
        console.log(`Order ${orderId} marked as refunded`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
