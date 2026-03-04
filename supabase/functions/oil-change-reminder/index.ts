import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // Fetch reminders due today or past due
    const { data: dueReminders, error } = await supabase
      .from("oil_change_reminders")
      .select("*")
      .eq("is_active", true)
      .lte("next_reminder_date", new Date().toISOString());

    if (error) throw error;
    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucun rappel à envoyer", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;

    for (const reminder of dueReminders) {
      // Send email via Resend
      if (resendKey && reminder.customer_email) {
        try {
          const vehicleInfo = [reminder.vehicle_brand, reminder.vehicle_model, reminder.vehicle_engine]
            .filter(Boolean)
            .join(" ");

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Bardahl <noreply@bardahl.bj>",
              to: [reminder.customer_email],
              subject: `🛢️ Rappel vidange${vehicleInfo ? ` - ${vehicleInfo}` : ""}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: #FFD000; padding: 20px; text-align: center;">
                    <h1 style="color: #1a1a1a; margin: 0;">🛢️ Bardahl</h1>
                  </div>
                  <div style="padding: 30px; background: #ffffff;">
                    <h2 style="color: #1a1a1a;">Bonjour ${reminder.customer_name || ""},</h2>
                    <p>Il est temps de penser à votre vidange ! 🔧</p>
                    ${vehicleInfo ? `<p><strong>Véhicule :</strong> ${vehicleInfo}</p>` : ""}
                    ${reminder.product_title ? `<p><strong>Produit recommandé :</strong> ${reminder.product_title}</p>` : ""}
                    <p>Pour garantir la longévité de votre moteur, nous vous recommandons de procéder à votre vidange dès que possible.</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://bardahl.bj" style="background: #FFD000; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Commander maintenant
                      </a>
                    </div>
                    <p style="color: #666; font-size: 12px;">
                      Pour vous désinscrire des rappels, contactez-nous à support@bardahl.bj
                    </p>
                  </div>
                </div>
              `,
            }),
          });

          sentCount++;
        } catch (emailErr) {
          console.error(`Failed to send reminder to ${reminder.customer_email}:`, emailErr);
        }
      }

      // Update reminder: increment count, set next date
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + (reminder.reminder_interval_months || 6));

      await supabase
        .from("oil_change_reminders")
        .update({
          reminder_count: (reminder.reminder_count || 0) + 1,
          next_reminder_date: nextDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", reminder.id);
    }

    return new Response(
      JSON.stringify({
        message: `${sentCount} rappels envoyés sur ${dueReminders.length} dus`,
        sent: sentCount,
        total: dueReminders.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("oil-change-reminder error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
