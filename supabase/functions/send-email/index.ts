import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
  to: string;
  subject: string;
  template: "order_confirmation" | "order_shipped" | "order_failed" | "newsletter_welcome" | "contact_reply";
  data: Record<string, unknown>;
}

const brandHeader = `
  <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
    <h1 style="color: #FFD000; font-size: 28px; margin: 0; font-weight: bold;">BARDAHL</h1>
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
        <p>Votre commande <strong style="color: #FFD000;">${data.orderNumber}</strong> a été confirmée.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Récapitulatif :</h3>
          <p><strong>Total : ${data.total} FCFA</strong></p>
        </div>
        <p>Nous vous tiendrons informé de l'expédition de votre commande.</p>
        <p>L'équipe Bardahl</p>
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
        <p>Votre commande <strong style="color: #FFD000;">${data.orderNumber}</strong> est en route.</p>
        ${data.trackingNumber ? `<p>Numéro de suivi : <strong>${data.trackingNumber}</strong></p>` : ''}
        <p>L'équipe Bardahl</p>
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
        <p>Le paiement pour votre commande <strong>${data.orderNumber}</strong> a échoué.</p>
        <p>Veuillez réessayer ou nous contacter pour assistance.</p>
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
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth verification failed:", authError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!userRole || userRole.role !== "admin") {
      console.error("User is not admin:", user.id);
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden - Admin access required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log("✅ Admin authenticated:", user.email);

    const { to, subject, template, data }: EmailRequest = await req.json();
    const htmlContent = templates[template](data);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Bardahl <noreply@email.maxiimarket.com>",
        to: [to],
        subject,
        html: htmlContent,
      }),
    });

    const result = await response.json();
    if (!response.ok) { console.error("Resend error:", result); throw new Error(result.message || "Email sending failed"); }

    return new Response(JSON.stringify({ success: true, messageId: result.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    console.error("Send email error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
