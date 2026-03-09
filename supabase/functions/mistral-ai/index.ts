import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');

async function fetchAdminContext(): Promise<string> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [
      { count: productsCount },
      { count: ordersCount },
      { data: recentOrders },
      { count: customersCount },
      { data: categories },
      { count: pendingMessages },
      { count: newsletterCount },
      { count: remindersCount },
      { data: lowStockProducts },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('order_number, status, total, customer_name, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('title, slug').eq('is_active', true),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('oil_change_reminders').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('title, stock').eq('is_active', true).lt('stock', 5).order('stock', { ascending: true }).limit(10),
    ]);

    const pendingOrdersRes = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return `
--- DONNÉES ACTUELLES DU TABLEAU DE BORD ---
Produits actifs : ${productsCount ?? 0}
Commandes totales : ${ordersCount ?? 0}
Commandes en attente : ${pendingOrdersRes.count ?? 0}
Clients enregistrés : ${customersCount ?? 0}
Messages non lus : ${pendingMessages ?? 0}
Abonnés newsletter : ${newsletterCount ?? 0}
Rappels vidange actifs : ${remindersCount ?? 0}

Catégories : ${categories?.map(c => c.title).join(', ') || 'Aucune'}

Produits en stock faible (< 5) :
${lowStockProducts?.map(p => `- ${p.title}: ${p.stock} unités`).join('\n') || 'Aucun'}

5 dernières commandes :
${recentOrders?.map(o => `- #${o.order_number} | ${o.status} | ${o.total} FCFA | ${o.customer_name || 'Anonyme'}`).join('\n') || 'Aucune'}
---`;
  } catch (e) {
    console.error('Error fetching admin context:', e);
    return '(Impossible de charger les données du tableau de bord)';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, title, type, message, context } = await req.json();

    // ── Product description generation (uses Mistral) ──
    if (action === 'generate-description') {
      if (!MISTRAL_API_KEY) throw new Error('MISTRAL_API_KEY not configured');
      if (!title || title.length < 10) {
        return new Response(
          JSON.stringify({ error: 'Le titre doit contenir au moins 10 caractères' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let prompt = '';
      let maxTokens = 300;

      if (type === 'short') {
        prompt = `Tu es un expert en lubrifiants et produits d'entretien automobile Bardahl au Bénin. Génère une description courte et percutante (50-80 mots) pour ce produit : "${title}".

Mets en avant :
- La performance et la protection du moteur
- La qualité Bardahl (technologie Polar Plus)
- L'application / l'usage recommandé

Utilise un ton technique mais accessible, professionnel. Écris en français. Ne mets pas de titre, juste la description.`;
        maxTokens = 150;
      } else {
        prompt = `Tu es un expert en lubrifiants et produits d'entretien automobile Bardahl au Bénin. Génère une description détaillée et persuasive (150-200 mots) pour ce produit : "${title}".

Inclus :
- Caractéristiques techniques (viscosité, normes API/ACEA si pertinent)
- Avantages et protection apportée
- Véhicules / moteurs compatibles
- Pourquoi choisir Bardahl

Utilise un ton professionnel et technique. Écris en français. Structure en paragraphes courts. Ne mets pas de titre.`;
        maxTokens = 400;
      }

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API Mistral');
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      return new Response(
        JSON.stringify({ content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Admin chat assistant (uses Lovable AI with DB context) ──
    if (action === 'chat') {
      if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

      const dbContext = await fetchAdminContext();

      const systemPrompt = `Tu es l'assistant administrateur de Bardahl Bénin (AutoPassion BJ), une boutique e-commerce spécialisée dans les lubrifiants, huiles moteur, additifs, graisses et produits d'entretien automobile de la marque Bardahl.

TON RÔLE :
- Aider l'administrateur à gérer efficacement sa boutique en ligne
- Donner des conseils sur la gestion des stocks, commandes, clients
- Fournir des analyses et recommandations basées sur les données réelles
- Aider à rédiger des descriptions produits, réponses clients, contenus marketing
- Signaler les alertes (stock faible, commandes en attente, messages non lus)

CONTEXTE MÉTIER :
- Produits : huiles moteur, additifs, graisses, liquides de frein, filtres, accessoires auto
- Marché : Bénin et Afrique de l'Ouest
- Devise : FCFA
- Clients : garages, mécaniciens, particuliers propriétaires de véhicules
- Technologies : Bardahl Polar Plus, normes API/ACEA

${dbContext}

Page admin actuelle : ${context || 'Tableau de bord'}

RÈGLES :
- Sois concis, professionnel et orienté action
- Réponds en français
- Ne révèle jamais de données sensibles (mots de passe, clés API, emails personnels)
- Propose des actions concrètes quand c'est pertinent
- Si tu ne connais pas une info, dis-le clairement`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Trop de requêtes, réessayez dans un moment.' }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Crédits IA épuisés.' }), {
            status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const t = await response.text();
        console.error('AI gateway error:', response.status, t);
        throw new Error('Erreur du service IA');
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      return new Response(
        JSON.stringify({ content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action invalide' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
