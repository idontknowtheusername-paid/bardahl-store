import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, name, source = "website" } = await req.json();
    if (!email || !email.includes("@")) throw new Error("Email invalide");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: existing } = await supabase.from("newsletter_subscribers").select("id, status").eq("email", email.toLowerCase()).single();

    if (existing) {
      if (existing.status === "active") {
        return new Response(JSON.stringify({ success: true, message: "Déjà inscrit" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      await supabase.from("newsletter_subscribers").update({ status: "active" }).eq("id", existing.id);
    } else {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.toLowerCase(), name, source, status: "active" });
      if (error) throw error;
    }

    if (RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Bardahl <onboarding@resend.dev>",
            to: [email],
            subject: "Bienvenue chez Bardahl ! 🏎️",
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0a0a0a; padding: 20px; text-align: center;"><h1 style="color: #FFD000; margin: 0;">BARDAHL</h1></div>
              <div style="padding: 30px;"><h2>Bienvenue !</h2><p>Bonjour${name ? ` ${name}` : ''},</p><p>Merci de vous être inscrit à notre newsletter.</p><p>Vous recevrez nos dernières nouveautés produits, conseils techniques et offres exclusives.</p><p>L'équipe Bardahl</p></div>
            </div>`,
          }),
        });
      } catch (e) { console.error("Welcome email failed:", e); }
    }

    return new Response(JSON.stringify({ success: true, message: "Inscription réussie" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
