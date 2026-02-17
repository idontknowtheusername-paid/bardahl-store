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
        
        return new Response(JSON.stringify({ error: "Missing signature" }), { status: 401 });
      }
      // Note: GeniusPay signature verification would go here
      // For now, we'll accept if signature header is present
    }

    const body = await req.json();
    

    // Handle Genius Pay webhook
    const event = body.event || body.type || body.status;
    const data = body.data || body;

    if (event === "payment.succeeded" || event === "payment.success" || event === "payment.paid" || event === "succeeded" || event === "paid") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        // Get order details
        const { data: order, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (fetchError) throw fetchError;

        const { error } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            payment_transaction_id: data.id || data.reference || body.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
        if (error) throw error;

        // Send confirmation email
        if (order?.customer_email) {
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
                  customerName: order.customer_name,
                  orderNumber: order.order_number,
                  total: order.total,
                },
              }),
            });
            
          } catch (emailError) {
            // Email send failed silently
          }
        }
      }
    } else if (event === "payment.failed" || event === "failed") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        // Get order details
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        await supabase
          .from("orders")
          .update({ payment_status: "failed", updated_at: new Date().toISOString() })
          .eq("id", orderId);
        

        // Send failure email
        if (order?.customer_email) {
          try {
            await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: order.customer_email,
                subject: `Échec du paiement - Commande ${order.order_number}`,
                template: "order_failed",
                data: {
                  customerName: order.customer_name,
                  orderNumber: order.order_number,
                },
              }),
            });
            
          } catch (emailError) {
            // Email send failed silently
          }
        }
      }
    } else if (event === "payment.cancelled" || event === "cancelled") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        await supabase
          .from("orders")
          .update({ payment_status: "cancelled", status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", orderId);
        
      }
    } else if (event === "payment.refunded" || event === "refunded") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        await supabase
          .from("orders")
          .update({ payment_status: "refunded", status: "refunded", updated_at: new Date().toISOString() })
          .eq("id", orderId);
        
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
