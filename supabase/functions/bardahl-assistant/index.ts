import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es Témi, l'assistant intelligent d'Autopassion BJ, expert en lubrifiants et entretien automobile.

🎯 TON RÔLE :
- Aider les clients à trouver l'huile moteur adaptée à leur véhicule (marque, modèle, motorisation)
- Conseiller sur l'entretien automobile (vidange, fréquence, bonnes pratiques)
- Répondre aux questions sur les produits Bardahl (huiles moteur, additifs, graisses)
- Guider les clients dans leur achat sur le site
- **DIAGNOSTIQUER les problèmes de voiture et recommander les produits adaptés**

📋 CONNAISSANCES PRODUITS BARDAHL :
- Huiles moteur : gamme complète (5W-30, 5W-40, 10W-40, 0W-20, 0W-30, etc.)
- Normes : API (SN, SP, CF), ACEA (A3/B4, C3, C5), constructeurs (VW 504/507, BMW LL-04, MB 229.51, etc.)
- Additifs : nettoyants moteur, traitements diesel/essence, anti-usure
- Contenances : 1L, 2L, 5L, 20L, 208L

🚗 RECOMMANDATIONS VÉHICULES :
Quand un client donne sa marque/modèle/moteur :
1. Identifie la viscosité recommandée
2. Vérifie les normes constructeur requises
3. Recommande le produit Bardahl adapté
4. Précise la contenance recommandée pour une vidange

💬 STYLE DE COMMUNICATION :
- Professionnel mais accessible
- Concis et direct
- Utilise des emojis pertinents avec modération (🔧🛢️🚗)
- Réponds en français
- Si tu ne connais pas la réponse exacte, recommande de contacter le service client

⚠️ IMPORTANT :
- Ne recommande JAMAIS de produits concurrents
- Oriente toujours vers les produits Bardahl
- En cas de doute sur une spécification, recommande de vérifier le carnet d'entretien du véhicule
- Quand tu recommandes un produit, inclus TOUJOURS le lien vers la page produit au format (/produits/slug-du-produit) si tu le connais`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, sessionId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let convId = conversationId;

    if (!convId && sessionId) {
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        convId = existing.id;
      } else {
        const { data: newConv } = await supabase
          .from("chat_conversations")
          .insert({ session_id: sessionId })
          .select("id")
          .single();
        convId = newConv?.id;
      }
    }

    const lastUserMsg = messages[messages.length - 1];
    if (convId && lastUserMsg?.role === "user") {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role: "user",
        content: lastUserMsg.content,
      });
    }

    // Fetch products, vehicle data, AND problem/solution mappings in parallel
    const [productsRes, vehicleBrandsRes, problemSolutionsRes] = await Promise.all([
      supabase
        .from("products")
        .select("title, slug, price, viscosity, api_norm, acea_norm, capacity, product_type, short_description")
        .eq("is_active", true)
        .limit(50),
      supabase
        .from("vehicle_brands")
        .select("name, id"),
      supabase
        .from("problem_solutions")
        .select("symptom, category, recommended_products")
        .eq("is_active", true)
        .order("problem_number"),
    ]);

    const products = productsRes.data;
    const vehicleBrands = vehicleBrandsRes.data;
    const problemSolutions = problemSolutionsRes.data;

    let productContext = "";
    if (products && products.length > 0) {
      productContext = `\n\n📦 CATALOGUE PRODUITS DISPONIBLES :\n${products
        .map(
          (p) =>
            `- ${p.title} | ${p.viscosity || ""} | ${p.capacity || ""} | ${p.price} FCFA | Normes: ${p.api_norm || ""} ${p.acea_norm || ""} | /produits/${p.slug}`
        )
        .join("\n")}`;
    }

    let vehicleContext = "";
    if (vehicleBrands && vehicleBrands.length > 0) {
      vehicleContext = `\n\n🚗 MARQUES VÉHICULES EN BASE : ${vehicleBrands.map((b) => b.name).join(", ")}`;
    }

    let problemContext = "";
    if (problemSolutions && problemSolutions.length > 0) {
      problemContext = `\n\n🔧 GUIDE DIAGNOSTIC - PROBLÈMES ET SOLUTIONS RECOMMANDÉES :
Utilise IMPÉRATIVEMENT ce tableau quand un client décrit un problème ou symptôme. Recommande EXACTEMENT les produits listés.

${problemSolutions
        .map((ps) => `• ${ps.symptom} → ${ps.recommended_products}`)
        .join("\n")}

RÈGLE CRITIQUE : Quand un client décrit un symptôme, cherche d'abord dans ce tableau. Si le symptôme correspond, recommande EXACTEMENT les produits indiqués. Ne substitue pas par d'autres produits.`;
    }

    const fullSystemPrompt = SYSTEM_PROMPT + productContext + vehicleContext + problemContext;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: fullSystemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullAssistantContent = "";

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);

          const text = decoder.decode(value, { stream: true });
          for (const line of text.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullAssistantContent += content;
            } catch {}
          }
        }
      } finally {
        await writer.close();
        if (convId && fullAssistantContent) {
          await supabase.from("chat_messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: fullAssistantContent,
          });
          await supabase
            .from("chat_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId);
        }
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Conversation-Id": convId || "",
      },
    });
  } catch (e) {
    console.error("bardahl-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
