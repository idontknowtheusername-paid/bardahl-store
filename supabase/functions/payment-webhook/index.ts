import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const body = await req.json();
    console.log("Payment webhook received:", JSON.stringify(body, null, 2));

    // Handle Genius Pay webhook
    const event = body.event || body.type || body.status;
    const data = body.data || body;

    if (event === "payment.succeeded" || event === "payment.paid" || event === "succeeded" || event === "paid") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        const { error } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            payment_transaction_id: data.id || body.id,
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
