import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const AI_TIMEOUT_MS = 25000;
const DB_TIMEOUT_MS = 12000;

type AssistantAction = 'generate-description' | 'chat';

class AppError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function createAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError('Configuration serveur Supabase manquante.', 500);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, timeoutMessage: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AppError(timeoutMessage, 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function requireStaffSession(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Session expirée ou manquante. Reconnectez-vous puis réessayez.', 401);
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const supabase = createAdminClient();
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    throw new AppError('Session invalide. Merci de vous reconnecter.', 401);
  }
  const { data: roleRows, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authData.user.id)
    .in('role', ['admin', 'editor', 'viewer'])
    .limit(1);
  if (roleError) throw new AppError('Impossible de vérifier vos permissions.', 500);
  if (!roleRows || roleRows.length === 0) {
    throw new AppError("Accès refusé. Cette action est réservée à l'équipe admin.", 403);
  }
  return { userId: authData.user.id, role: roleRows[0].role, supabase };
}

async function fetchAdminContext(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  try {
    const dbPromise = Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('order_number, status, total, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('title').eq('is_active', true),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('oil_change_reminders').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('title, stock').eq('is_active', true).lt('stock', 5).order('stock', { ascending: true }).limit(10),
    ]);

    const timedResults = await Promise.race([
      dbPromise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new AppError('Timeout dashboard.', 408)), DB_TIMEOUT_MS)),
    ]);

    const [productsRes, ordersRes, pendingOrdersRes, recentOrdersRes, customersRes, categoriesRes, pendingMessagesRes, newsletterRes, remindersRes, lowStockRes] = timedResults;

    const catData = (categoriesRes.data || []) as Array<{ title: string }>;
    const lowData = (lowStockRes.data || []) as Array<{ title: string; stock: number }>;
    const recentData = (recentOrdersRes.data || []) as Array<{ order_number: string; status: string; total: number; created_at: string }>;

    return `
--- DONNÉES DASHBOARD AUTOPASSION BJ ---
Produits actifs : ${productsRes.count ?? 0}
Commandes totales : ${ordersRes.count ?? 0}
Commandes en attente : ${pendingOrdersRes.count ?? 0}
Clients enregistrés : ${customersRes.count ?? 0}
Messages non lus : ${pendingMessagesRes.count ?? 0}
Abonnés newsletter actifs : ${newsletterRes.count ?? 0}
Rappels d'entretien actifs : ${remindersRes.count ?? 0}

Catégories actives : ${catData.map(c => c.title).join(', ') || 'Aucune'}

Produits en stock faible (< 5) :
${lowData.map(p => `- ${p.title}: ${p.stock} unités`).join('\n') || 'Aucun'}

5 dernières commandes :
${recentData.map(o => `- #${o.order_number} | ${o.status} | ${o.total} FCFA | ${new Date(o.created_at).toLocaleDateString('fr-FR')}`).join('\n') || 'Aucune'}
---`;
  } catch (error) {
    console.error('Error fetching admin context:', error);
    return '(Impossible de charger le contexte dashboard actuellement)';
  }
}

async function handleGenerateDescription(title: string, type: 'short' | 'long') {
  if (!MISTRAL_API_KEY) throw new AppError('Service IA description indisponible.', 500);
  if (!title || title.length < 10) throw new AppError('Le titre doit contenir au moins 10 caractères.', 400);

  const prompt = type === 'short'
    ? `Tu es un expert produits automobile d'AutoPassion BJ. Rédige une description courte (50-80 mots) pour : "${title}". Mets en avant le bénéfice client principal, les performances/compatibilités clés, un ton professionnel et clair. Écris en français. Sans titre.`
    : `Tu es un expert produits automobile d'AutoPassion BJ. Rédige une description détaillée (150-200 mots) pour : "${title}". Inclus caractéristiques techniques utiles, bénéfices concrets, usages/compatibilités recommandés, points différenciants. Écris en français. Paragraphes courts. Sans titre.`;

  const response = await fetchWithTimeout(
    'https://api.mistral.ai/v1/chat/completions',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'mistral-small-latest', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: type === 'short' ? 150 : 400 }),
    },
    AI_TIMEOUT_MS,
    'Le service IA prend trop de temps. Réessayez.'
  );

  if (!response.ok) throw new AppError('Erreur lors de la génération. Réessayez.', 502);
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AppError('Réponse IA vide. Réessayez.', 502);
  return content;
}

async function handleAdminChat(message: string, context: string | undefined, supabase: ReturnType<typeof createAdminClient>) {
  if (!LOVABLE_API_KEY) throw new AppError('Service assistant indisponible.', 500);
  if (!message || message.trim().length < 2) throw new AppError('Message trop court.', 400);

  const dbContext = await fetchAdminContext(supabase);

  const systemPrompt = `Tu es l'assistant administrateur d'AutoPassion BJ, plateforme automobile digitale au Bénin.

OBJECTIFS :
- Aider l'équipe admin à piloter ventes, stocks, commandes et relation client
- Donner des recommandations opérationnelles, concrètes et prioritaires
- Utiliser les données dashboard ci-dessous pour conseiller

RÈGLES :
- Réponds en français, concis et actionnable
- Structure en points clairs quand utile
- Ne jamais exposer de données sensibles
- Utilise le nom AutoPassion BJ

${dbContext}

Contexte page admin : ${context || 'Tableau de bord'}`;

  const response = await fetchWithTimeout(
    'https://ai.gateway.lovable.dev/v1/chat/completions',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemini-3-flash-preview', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message.trim() }], temperature: 0.5, max_tokens: 900 }),
    },
    AI_TIMEOUT_MS,
    "L'assistant met trop de temps à répondre. Réessayez."
  );

  if (!response.ok) {
    if (response.status === 429) throw new AppError('Trop de requêtes IA. Patientez.', 429);
    if (response.status === 402) throw new AppError('Crédits IA épuisés.', 402);
    throw new AppError('Service IA indisponible. Réessayez.', 502);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AppError('Réponse IA vide. Réessayez.', 502);
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, title, type, message, context } = await req.json() as {
      action?: AssistantAction; title?: string; type?: 'short' | 'long'; message?: string; context?: string;
    };

    if (!action) throw new AppError('Action manquante.', 400);

    const { supabase, userId, role } = await requireStaffSession(req);
    console.log('mistral-ai request', { action, userId, role });

    if (action === 'generate-description') {
      const content = await handleGenerateDescription(title ?? '', type ?? 'short');
      return jsonResponse({ content });
    }

    if (action === 'chat') {
      const content = await handleAdminChat(message ?? '', context, supabase);
      return jsonResponse({ content });
    }

    throw new AppError('Action invalide.', 400);
  } catch (error) {
    if (error instanceof AppError) {
      return jsonResponse({ error: error.message }, error.status);
    }
    console.error('Unhandled mistral-ai error:', error);
    return jsonResponse({ error: 'Erreur interne du service assistant.' }, 500);
  }
});
