import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface EmailRequest {
  to: string;
  subject: string;
  template: "order_confirmation" | "order_shipped" | "order_failed" | "newsletter_welcome" | "contact_reply" | "new_order_admin";
  data: Record<string, unknown>;
}

const brandHeader = `
  <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
    <h1 style="color: #FFD000; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: 2px;">BARDAHL</h1>
    <p style="color: #999; font-size: 12px; margin: 5px 0 0;">Lubrifiants & Solutions Automobile</p>
  </div>
`;

const brandFooter = `
  <div style="background-color: #1a1a1a; padding: 20px; text-align: center; margin-top: 30px;">
    <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Bardahl - Tous droits réservés</p>
    <p style="color: #666; font-size: 11px; margin: 5px 0 0;">Cet email a été envoyé automatiquement.</p>
  </div>
`;

const templates = {
  order_confirmation: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      ${brandHeader}
      <div style="padding: 30px;">
        <h2 style="color: #1a1a1a;">Merci pour votre commande !</h2>
        <p>Bonjour ${data.customerName},</p>
        <p>Votre commande <strong style="color: #FFD000;">${data.orderNumber}</strong> a été confirmée avec succès.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD000;">
          <h3 style="margin-top: 0; color: #1a1a1a;">Récapitulatif :</h3>
          <p style="margin: 5px 0;"><strong>Total : ${data.total} FCFA</strong></p>
        </div>
        <p>Nous préparons votre commande et vous tiendrons informé de son expédition.</p>
        <p>Merci de votre confiance,<br><strong>L'équipe Bardahl</strong></p>
      </div>
      ${brandFooter}
    </div>
  `,
  order_shipped: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      ${brandHeader}
      <div style="padding: 30px;">
        <h2 style="color: #1a1a1a;">Votre commande a été expédiée ! 🚚</h2>
        <p>Bonjour ${data.customerName},</p>
        <p>Votre commande <strong style="color: #FFD000;">${data.orderNumber}</strong> est en cours de livraison.</p>
        ${data.trackingNumber ? `<div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD000;"><p style="margin: 0;">Numéro de suivi : <strong>${data.trackingNumber}</strong></p></div>` : ''}
        <p>Merci de votre confiance,<br><strong>L'équipe Bardahl</strong></p>
      </div>
      ${brandFooter}
    </div>
  `,
  order_failed: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      ${brandHeader}
      <div style="padding: 30px;">
        <h2 style="color: #dc2626;">Échec du paiement</h2>
        <p>Bonjour ${data.customerName},</p>
        <p>Le paiement pour votre commande <strong>${data.orderNumber}</strong> n'a pas pu être traité.</p>
        <p>Vous pouvez réessayer ou nous contacter pour toute assistance.</p>
        <p>L'équipe Bardahl</p>
      </div>
      ${brandFooter}
    </div>
  `,
  newsletter_welcome: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      ${brandHeader}
      <div style="padding: 30px;">
        <h2 style="color: #1a1a1a;">Bienvenue chez Bardahl ! 🏎️</h2>
        <p>Bonjour${data.name ? ` ${data.name}` : ''},</p>
        <p>Merci de vous être inscrit à notre newsletter.</p>
        <p>Vous recevrez nos dernières nouveautés produits, conseils techniques et offres exclusives.</p>
        <p>L'équipe Bardahl</p>
      </div>
      ${brandFooter}
    </div>
  `,
  contact_reply: (data: Record<string, unknown>) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      ${brandHeader}
      <div style="padding: 30px;">
        <h2 style="color: #1a1a1a;">Réponse à votre message</h2>
        <p>Bonjour ${data.name},</p>
        <p>Merci de nous avoir contacté. Voici notre réponse :</p>
        <blockquote style="border-left: 3px solid #FFD000; padding-left: 15px; margin: 20px 0; color: #555;">
          ${data.reply}
        </blockquote>
        <p>L'équipe Bardahl</p>
      </div>
      ${brandFooter}
    </div>
  `,
  new_order_admin: (data: Record<string, unknown>) => {
    const items = (data.items as Array<{title: string; quantity: number; unitPrice: number; total: number}>) || [];
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.unitPrice?.toFixed(0)} FCFA</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${item.total?.toFixed(0)} FCFA</td>
      </tr>
    `).join('');

    return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      ${brandHeader}
      <div style="padding: 30px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #FFD000; padding-bottom: 10px;">🛒 Nouvelle commande reçue !</h2>
        <div style="background: #f9f9f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>N° Commande :</strong> <span style="color: #FFD000; font-weight: bold;">${data.orderNumber}</span></p>
          <p style="margin: 5px 0;"><strong>Client :</strong> ${data.customerName}</p>
          <p style="margin: 5px 0;"><strong>Téléphone :</strong> ${data.customerPhone}</p>
          <p style="margin: 5px 0;"><strong>Email :</strong> ${data.customerEmail}</p>
          <p style="margin: 5px 0;"><strong>Ville :</strong> ${data.city}, ${data.country}</p>
          <p style="margin: 5px 0;"><strong>Mode livraison :</strong> ${data.shippingMethod}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #0a0a0a; color: #FFD000;">
              <th style="padding: 10px; text-align: left;">Produit</th>
              <th style="padding: 10px; text-align: center;">Qté</th>
              <th style="padding: 10px; text-align: right;">Prix unitaire</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #FFD000;">
          <p style="margin: 5px 0;">Sous-total : ${(data.subtotal as number)?.toFixed(0)} FCFA</p>
          <p style="margin: 5px 0;">Livraison : ${(data.shippingCost as number)?.toFixed(0)} FCFA</p>
          <p style="margin: 5px 0; font-size: 18px;"><strong>TOTAL : ${(data.total as number)?.toFixed(0)} FCFA</strong></p>
        </div>
      </div>
      ${brandFooter}
    </div>
  `},
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Allow internal service calls (from other edge functions using service role key)
    const isServiceCall = token === SUPABASE_SERVICE_KEY;

    if (!isServiceCall) {
      // Verify user is an authenticated admin
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }

      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!userRole || userRole.role !== "admin") {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden - Admin access required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

    const { to, subject, template, data }: EmailRequest = await req.json();

    if (!to || !subject || !template || !data) {
      throw new Error("Missing required fields: to, subject, template, data");
    }

    const templateFn = templates[template];
    if (!templateFn) throw new Error(`Unknown template: ${template}`);

    const htmlContent = templateFn(data);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bardahl <noreply@email.maxiimarket.com>",
        to: [to],
        subject,
        html: htmlContent,
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Email sending failed");

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
