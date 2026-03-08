import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Alert milestones
type AlertType = "midpoint" | "one_week" | "one_day";

interface AlertsSent {
  midpoint?: string;
  one_week?: string;
  one_day?: string;
}

interface AlertPreferences {
  midpoint?: boolean;
  one_week?: boolean;
  one_day?: boolean;
}

function getAlertType(
  nextReminderDate: Date,
  intervalMonths: number,
  alertsSent: AlertsSent,
  prefs: AlertPreferences,
  now: Date
): AlertType | null {
  const msUntilDue = nextReminderDate.getTime() - now.getTime();
  const daysUntilDue = msUntilDue / (1000 * 60 * 60 * 24);

  // Calculate total interval in days for midpoint
  const totalIntervalDays = intervalMonths * 30;
  const midpointDays = totalIntervalDays / 2;

  // J-1: la veille (0 to 1 day before)
  if (daysUntilDue <= 1 && daysUntilDue > -1 && !alertsSent.one_day && prefs.one_day !== false) {
    return "one_day";
  }

  // J-7: 1 semaine avant (1 to 8 days before)
  if (daysUntilDue <= 7 && daysUntilDue > 1 && !alertsSent.one_week && prefs.one_week !== false) {
    return "one_week";
  }

  // Mi-chemin: half the interval remaining
  if (daysUntilDue <= midpointDays && daysUntilDue > 7 && !alertsSent.midpoint && prefs.midpoint !== false) {
    return "midpoint";
  }

  return null;
}

function buildEmailHtml(
  alertType: AlertType,
  reminder: any,
  siteUrl: string,
  whatsappNumber: string
): { subject: string; html: string } {
  const vehicleInfo = [reminder.vehicle_brand, reminder.vehicle_model, reminder.vehicle_engine]
    .filter(Boolean)
    .join(" ");

  const customerName = reminder.customer_name || "cher client";

  const whatsappMsg = encodeURIComponent(
    `Bonjour, je souhaite commander pour ma vidange${vehicleInfo ? ` (${vehicleInfo})` : ""}. ${reminder.product_title ? `Produit : ${reminder.product_title}` : ""}`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${whatsappMsg}`;

  const ctaButtons = `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${siteUrl}" style="display: inline-block; background: #F59E0B; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
        🛒 Commander sur le site
      </a>
    </div>
    <div style="text-align: center; margin: 10px 0;">
      <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
        💬 Commander via WhatsApp
      </a>
    </div>
    <div style="text-align: center; margin: 10px 0; color: #666; font-size: 14px;">
      📍 Ou passez directement en boutique
    </div>
  `;

  const vehicleBlock = vehicleInfo
    ? `<div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">🚗 Véhicule</p>
        <p style="margin: 5px 0 0; font-weight: bold; font-size: 16px;">${vehicleInfo}</p>
      </div>`
    : "";

  const productBlock = reminder.product_title
    ? `<div style="background: #fff8e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">🛢️ Produit recommandé</p>
        <p style="margin: 5px 0 0; font-weight: bold; font-size: 16px;">${reminder.product_title}</p>
      </div>`
    : "";

  const freeDeliveryBanner = `
    <div style="background: #e8f5e9; border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #2e7d32; font-weight: bold;">🚚 Livraison GRATUITE pour les commandes vidange !</p>
    </div>
  `;

  let subject: string;
  let mainMessage: string;

  switch (alertType) {
    case "midpoint":
      subject = `🔔 Votre vidange approche${vehicleInfo ? ` — ${vehicleInfo}` : ""}`;
      mainMessage = `
        <h2 style="color: #1a1a1a;">Bonjour ${customerName} 👋</h2>
        <p style="font-size: 16px; line-height: 1.6;">Votre prochaine vidange approche dans quelques semaines. C'est le bon moment pour <strong>planifier votre entretien</strong> et garantir la longévité de votre moteur.</p>
        <p style="font-size: 16px; line-height: 1.6;">Pensez à commander vos produits à l'avance pour être prêt le jour J ! 🔧</p>
      `;
      break;

    case "one_week":
      subject = `⚠️ Vidange prévue la semaine prochaine${vehicleInfo ? ` — ${vehicleInfo}` : ""}`;
      mainMessage = `
        <h2 style="color: #1a1a1a;">Bonjour ${customerName} ⚡</h2>
        <p style="font-size: 16px; line-height: 1.6;">Votre vidange est prévue <strong>la semaine prochaine</strong> !</p>
        <p style="font-size: 16px; line-height: 1.6;">Commandez maintenant et <strong>recevez vos produits directement chez vous</strong>, ou passez en boutique quand ça vous arrange.</p>
      `;
      break;

    case "one_day":
      subject = `🚨 C'est demain ! Vidange${vehicleInfo ? ` — ${vehicleInfo}` : ""}`;
      mainMessage = `
        <h2 style="color: #1a1a1a;">Bonjour ${customerName} 🚗</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #d32f2f;"><strong>Votre vidange est prévue pour demain !</strong></p>
        <p style="font-size: 16px; line-height: 1.6;">Il est encore temps de commander. Commandez en <strong>1 clic</strong> sur notre site ou écrivez-nous sur <strong>WhatsApp</strong> et on vous livre gratuitement aujourd'hui même ! 🏎️</p>
      `;
      break;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 25px; text-align: center;">
        <h1 style="color: #1a1a1a; margin: 0; font-size: 24px;">🏎️ Autopassion BJ</h1>
        <p style="color: #1a1a1a; margin: 5px 0 0; font-size: 14px; opacity: 0.8;">Votre partenaire entretien auto</p>
      </div>
      <div style="padding: 30px;">
        ${mainMessage}
        ${vehicleBlock}
        ${productBlock}
        ${freeDeliveryBanner}
        ${ctaButtons}
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          Pour modifier vos préférences de rappel, connectez-vous à votre <a href="${siteUrl}/mon-espace" style="color: #F59E0B;">espace client</a>.<br/>
          Pour vous désinscrire, contactez-nous à support@autopassion.bj
        </p>
      </div>
    </div>
  `;

  return { subject, html };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const now = new Date();

    // Fetch site settings for WhatsApp number
    const { data: settings } = await supabase
      .from("site_settings")
      .select("whatsapp_number")
      .limit(1)
      .single();

    const whatsappNumber = settings?.whatsapp_number || "22990000000";
    const siteUrl = "https://autopassion.bj";

    // Fetch all active reminders (not just due ones — we need to check progressive alerts)
    const { data: reminders, error } = await supabase
      .from("oil_change_reminders")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucun rappel actif", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    const results: { email: string; type: string }[] = [];

    for (const reminder of reminders) {
      const nextDate = new Date(reminder.next_reminder_date);
      const alertsSent: AlertsSent = (reminder.alerts_sent as AlertsSent) || {};
      const prefs: AlertPreferences = (reminder.alert_preferences as AlertPreferences) || {
        midpoint: true,
        one_week: true,
        one_day: true,
      };

      // Check if the reminder is past due — reset cycle
      if (nextDate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
        // Past due by more than 1 day — advance to next cycle
        const newNext = new Date(now);
        newNext.setMonth(newNext.getMonth() + (reminder.reminder_interval_months || 6));

        await supabase
          .from("oil_change_reminders")
          .update({
            next_reminder_date: newNext.toISOString(),
            reminder_count: (reminder.reminder_count || 0) + 1,
            alerts_sent: {},
            updated_at: now.toISOString(),
          })
          .eq("id", reminder.id);
        continue;
      }

      // Determine which alert to send
      const alertType = getAlertType(
        nextDate,
        reminder.reminder_interval_months || 6,
        alertsSent,
        prefs,
        now
      );

      if (!alertType) continue;

      // Send email
      if (resendKey && reminder.customer_email) {
        try {
          const { subject, html } = buildEmailHtml(alertType, reminder, siteUrl, whatsappNumber);

          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Autopassion BJ <noreply@email.maxiimarket.com>",
              to: [reminder.customer_email],
              subject,
              html,
            }),
          });

          if (emailRes.ok) {
            // Mark this alert as sent
            const updatedAlerts = { ...alertsSent, [alertType]: now.toISOString() };
            await supabase
              .from("oil_change_reminders")
              .update({
                alerts_sent: updatedAlerts,
                reminder_count: (reminder.reminder_count || 0) + 1,
                updated_at: now.toISOString(),
              })
              .eq("id", reminder.id);

            sentCount++;
            results.push({ email: reminder.customer_email, type: alertType });
          } else {
            const errBody = await emailRes.text();
            console.error(`Resend error for ${reminder.customer_email}:`, errBody);
          }
        } catch (emailErr) {
          console.error(`Failed to send ${alertType} to ${reminder.customer_email}:`, emailErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `${sentCount} alertes envoyées`,
        sent: sentCount,
        total: reminders.length,
        details: results,
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
