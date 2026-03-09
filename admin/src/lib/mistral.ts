import { supabase } from './supabase';

const ASSISTANT_TIMEOUT_MS = 35000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    }),
  ]);
}

function mapAssistantError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');

  if (raw.includes('403')) return 'Accès refusé : ce compte n’a pas les droits admin nécessaires.';
  if (raw.includes('401')) return 'Session expirée. Merci de vous reconnecter.';
  if (raw.includes('429')) return 'Trop de requêtes IA. Réessayez dans quelques secondes.';
  if (raw.includes('402')) return 'Crédits IA épuisés. Rechargez votre espace Lovable AI.';
  if (raw.includes('408') || raw.toLowerCase().includes('timeout')) {
    return 'Le service IA met trop de temps à répondre. Réessayez.';
  }

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error && typeof parsed.error === 'string') {
        return parsed.error;
      }
    } catch {
      // ignore invalid json fragment
    }
  }

  return 'Erreur assistant : impossible de traiter votre demande pour le moment.';
}

async function invokeAssistant(body: Record<string, unknown>) {
  try {
    const response = await withTimeout(
      supabase.functions.invoke('mistral-ai', { body }),
      ASSISTANT_TIMEOUT_MS,
      'Timeout: assistant indisponible temporairement.'
    );

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    console.error('Assistant invoke error:', error);
    throw new Error(mapAssistantError(error));
  }
}

export async function generateProductDescription(
  title: string,
  type: 'short' | 'long'
): Promise<string> {
  if (!title || title.length < 10) {
    throw new Error('Le titre doit contenir au moins 10 caractères');
  }

  const data = await invokeAssistant({
    action: 'generate-description',
    title,
    type,
  });

  if (!data?.content || typeof data.content !== 'string') {
    throw new Error('Pas de réponse de l\'IA');
  }

  return data.content;
}

export async function chatWithAssistant(
  message: string,
  context?: string
): Promise<string> {
  if (!message || message.trim().length < 2) {
    throw new Error('Votre message est trop court');
  }

  const data = await invokeAssistant({
    action: 'chat',
    message: message.trim(),
    context,
  });

  if (!data?.content || typeof data.content !== 'string') {
    throw new Error('Pas de réponse de l\'assistant');
  }

  return data.content;
}

export async function generateBlogPost(topic?: string, autoPublish = true) {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Non authentifié')
    }

    const response = await supabase.functions.invoke('blog-generate', {
      body: { topic, autoPublish }
    })

    if (response.error) {
      throw response.error
    }

    return response.data
  } catch (error: any) {
    console.error('Error generating blog post:', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de la génération'
    }
  }
}

