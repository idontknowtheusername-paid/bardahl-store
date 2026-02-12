import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface SubscribeRequest {
  email: string;
  name?: string;
  source?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, source = "website" }: SubscribeRequest = await req.json();

    if (!email || !email.includes("@")) {
      throw new Error("Email invalide");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === "active") {
        return new Response(
          JSON.stringify({ success: true, message: "Déjà inscrit" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Reactivate if unsubscribed
      await supabase
        .from("newsletter_subscribers")
        .update({ status: "active", unsubscribed_at: null })
        .eq("id", existing.id);
    } else {
      // Create new subscription
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email.toLowerCase(),
          name,
          source,
          status: "active",
        });

      if (error) throw error;
    }

    // Send welcome email
    if (RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Cannesh Lingerie <noreply@cannesh.com>",
            to: [email],
            subject: "Bienvenue chez Cannesh Lingerie!",
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a; text-align: center;">Bienvenue!</h1>
                <p>Bonjour${name ? ` ${name}` : ''},</p>
                <p>Merci de vous être inscrit à notre newsletter.</p>
                <p>Vous recevrez nos dernières nouveautés et offres exclusives.</p>
                <p style="margin-top: 30px;">L'équipe Cannesh Lingerie</p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Welcome email failed:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Inscription réussie" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
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
