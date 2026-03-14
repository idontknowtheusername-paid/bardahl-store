import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { action, phone, password, full_name, email, license_plate, identifier } = await req.json();

    // ---- REGISTER ----
    if (action === "register") {
      if (!phone || !password || !full_name) {
        return new Response(JSON.stringify({ error: "Téléphone, mot de passe et nom complet requis." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check phone uniqueness
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (existingCustomer) {
        return new Response(JSON.stringify({ error: "Ce numéro de téléphone est déjà utilisé." }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create auth user with phone as email alias
      const fakeEmail = `${phone.replace(/[^0-9]/g, '')}@autopassion.local`;
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: fakeEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name, phone, role: "customer" },
      });

      if (authError) {
        console.error("Auth error:", authError);
        return new Response(JSON.stringify({ error: "Erreur lors de la création du compte." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create customer profile
      const { error: profileError } = await supabase.from("customers").insert({
        user_id: authUser.user.id,
        phone,
        email: email || null,
        full_name,
      });

      if (profileError) {
        console.error("Profile error:", profileError);
        // Cleanup auth user
        await supabase.auth.admin.deleteUser(authUser.user.id);
        return new Response(JSON.stringify({ error: "Erreur lors de la création du profil." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Add customer role
      await supabase.from("user_roles").insert({
        user_id: authUser.user.id,
        role: "customer",
        email: fakeEmail,
        full_name,
      });

      // If license plate provided, add first vehicle
      if (license_plate) {
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("user_id", authUser.user.id)
          .single();

        if (customer) {
          await supabase.from("customer_vehicles").insert({
            customer_id: customer.id,
            license_plate: license_plate.toUpperCase(),
          });
        }
      }

      // Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });

      return new Response(JSON.stringify({
        success: true,
        session: signInData?.session,
        user: signInData?.user,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- LOGIN ----
    if (action === "login") {
      if (!identifier || !password) {
        return new Response(JSON.stringify({ error: "Identifiant et mot de passe requis." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Determine if identifier is phone or license plate
      let fakeEmail: string | null = null;

      // Check if it looks like a phone number
      // Accepts: +22996786284, 96786284, 01234567, 96 78 62 84, 96-78-62-84
      // Must start with +, 0, or any digit, and contain at least 8 digits total
      const isPhone = /^[\+0]?[\d\s-]{7,}$/.test(identifier.trim()) &&
        (identifier.replace(/[^\d]/g, '').length >= 8);

      if (isPhone) {
        const cleanPhone = identifier.trim();
        fakeEmail = `${cleanPhone.replace(/[^0-9]/g, '')}@autopassion.local`;
      } else {
        // Try license plate lookup
        const { data: lookupResult } = await supabase.rpc("lookup_customer_email", {
          identifier: identifier.trim(),
        });
        fakeEmail = lookupResult;
      }

      if (!fakeEmail) {
        return new Response(JSON.stringify({ error: "Aucun compte trouvé avec cet identifiant." }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });

      if (signInError) {
        return new Response(JSON.stringify({ error: "Identifiant ou mot de passe incorrect." }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        session: signInData.session,
        user: signInData.user,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Action non reconnue." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("customer-auth error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
