import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
  to: string;
  subject: string;
  template: "order_confirmation" | "order_shipped" | "order_failed" | "newsletter_welcome" | "contact_reply";
  data: Record<string, unknown>;
}

const templates = {
  order_confirmation: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a; text-align: center;">Merci pour votre commande!</h1>
      <p>Bonjour ${data.customerName},</p>
      <p>Votre commande <strong>${data.orderNumber}</strong> a été confirmée.</p>
      <h3>Récapitulatif:</h3>
      <p>Total: <strong>${data.total} FCFA</strong></p>
      <p>Nous vous tiendrons informé de l'expédition.</p>
      <p style="margin-top: 30px;">L'équipe Cannesh Lingerie</p>
    </div>
  `,
  order_shipped: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a; text-align: center;">Votre commande a été expédiée!</h1>
      <p>Bonjour ${data.customerName},</p>
      <p>Votre commande <strong>${data.orderNumber}</strong> est en route.</p>
      ${data.trackingNumber ? `<p>Numéro de suivi: <strong>${data.trackingNumber}</strong></p>` : ''}
      <p style="margin-top: 30px;">L'équipe Cannesh Lingerie</p>
    </div>
  `,
  order_failed: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626; text-align: center;">Échec du paiement</h1>
      <p>Bonjour ${data.customerName},</p>
      <p>Malheureusement, le paiement pour votre commande <strong>${data.orderNumber}</strong> a échoué.</p>
      <p>Veuillez réessayer ou nous contacter pour assistance.</p>
      <p style="margin-top: 30px;">L'équipe Cannesh Lingerie</p>
    </div>
  `,
  newsletter_welcome: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a; text-align: center;">Bienvenue chez Cannesh Lingerie!</h1>
      <p>Bonjour${data.name ? ` ${data.name}` : ''},</p>
      <p>Merci de vous être inscrit à notre newsletter.</p>
      <p>Vous recevrez nos dernières nouveautés et offres exclusives.</p>
      <p style="margin-top: 30px;">L'équipe Cannesh Lingerie</p>
    </div>
  `,
  contact_reply: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a; text-align: center;">Réponse à votre message</h1>
      <p>Bonjour ${data.name},</p>
      <p>Merci de nous avoir contacté. Voici notre réponse:</p>
      <blockquote style="border-left: 3px solid #e5e5e5; padding-left: 15px; margin: 20px 0;">
        ${data.reply}
      </blockquote>
      <p style="margin-top: 30px;">L'équipe Cannesh Lingerie</p>
    </div>
  `,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { to, subject, template, data }: EmailRequest = await req.json();

    const htmlContent = templates[template](data);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cannesh Lingerie <noreply@cannesh.com>",
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      throw new Error(result.message || "Email sending failed");
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Send email error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
