import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "contact@bardahl.ci";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !subject || !message) throw new Error("Tous les champs sont requis");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from("contact_messages").insert({ name, email, subject, message, status: "new" }).select().single();
    if (error) throw error;

    if (RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Bardahl <onboarding@resend.dev>",
            to: [ADMIN_EMAIL],
            subject: `[Contact Bardahl] ${subject}`,
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0a0a0a; padding: 15px; text-align: center;"><h2 style="color: #FFD000; margin: 0;">BARDAHL</h2></div>
              <div style="padding: 20px;"><h3>Nouveau message de contact</h3><p><strong>De:</strong> ${name} (${email})</p><p><strong>Sujet:</strong> ${subject}</p><hr/><p>${message.replace(/\n/g, '<br>')}</p></div>
            </div>`,
          }),
        });
      } catch (e) { console.error("Admin notification failed:", e); }
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
