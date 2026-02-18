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
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get("x-geniuspay-signature") || req.headers.get("x-webhook-signature");
      if (!signature) {
        return new Response(JSON.stringify({ error: "Missing signature" }), { status: 401 });
      }
    }

    const body = await req.json();
    const event = body.event || body.type || body.status;
    const data = body.data || body;

    const sendEmail = async (to: string, subject: string, template: string, emailData: Record<string, unknown>) => {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to, subject, template, data: emailData }),
        });
      } catch (_e) {
        // Email failure is non-blocking
      }
    };

    const getAdminEmail = async (): Promise<string | null> => {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("admin_email")
        .single();
      return (settings as any)?.admin_email || null;
    };

    if (
      event === "payment.succeeded" || event === "payment.success" ||
      event === "payment.paid" || event === "succeeded" || event === "paid"
    ) {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        const { data: order, error: fetchError } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderId)
          .single();

        if (fetchError) throw fetchError;

        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            payment_transaction_id: data.id || data.reference || body.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        // Email client
        if (order?.customer_email) {
          await sendEmail(
            order.customer_email,
            `Confirmation de commande ${order.order_number} - Bardahl`,
            "order_confirmation",
            {
              customerName: order.customer_name,
              orderNumber: order.order_number,
              total: order.total,
            }
          );
        }

        // Email admin
        const adminEmail = await getAdminEmail();
        if (adminEmail) {
          const orderItems = (order?.order_items as any[]) || [];
          const shippingAddr = order?.shipping_address as any;
          await sendEmail(
            adminEmail,
            `✅ Paiement confirmé - ${order?.order_number} - Bardahl`,
            "new_order_admin",
            {
              orderNumber: order?.order_number,
              customerName: order?.customer_name,
              customerPhone: order?.customer_phone,
              customerEmail: order?.customer_email || "Non fourni",
              city: shippingAddr?.city || "",
              country: shippingAddr?.country || "Bénin",
              items: orderItems.map((i: any) => ({
                title: i.product_title,
                quantity: i.quantity,
                unitPrice: i.unit_price,
                total: i.total_price,
              })),
              subtotal: order?.subtotal,
              shippingCost: order?.shipping_cost,
              total: order?.total,
              shippingMethod: order?.shipping_method,
            }
          );
        }
      }
    } else if (event === "payment.failed" || event === "failed") {
      const orderId = data.metadata?.order_id || body.metadata?.order_id;
      if (orderId) {
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        await supabase
          .from("orders")
          .update({ payment_status: "failed", updated_at: new Date().toISOString() })
          .eq("id", orderId);

        if (order?.customer_email) {
          await sendEmail(
            order.customer_email,
            `Échec du paiement - Commande ${order.order_number}`,
            "order_failed",
            {
              customerName: order.customer_name,
              orderNumber: order.order_number,
            }
          );
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
