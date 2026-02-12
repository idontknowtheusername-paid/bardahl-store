import { supabase } from './supabase';

export async function generateProductDescription(
  title: string,
  type: 'short' | 'long'
): Promise<string> {
  if (!title || title.length < 10) {
    throw new Error('Le titre doit contenir au moins 10 caractères');
  }

  try {
    const { data, error } = await supabase.functions.invoke('mistral-ai', {
      body: {
        action: 'generate-description',
        title,
        type,
      },
    });

    if (error) throw error;
    if (!data?.content) throw new Error('Pas de réponse de l\'IA');

    return data.content;
  } catch (error) {
    console.error('Mistral API error:', error);
    throw error;
  }
}

export async function chatWithAssistant(
  message: string,
  context?: string
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('mistral-ai', {
      body: {
        action: 'chat',
        message,
        context,
      },
    });

    if (error) throw error;
    if (!data?.content) throw new Error('Pas de réponse de l\'IA');

    return data.content;
  } catch (error) {
    console.error('Mistral API error:', error);
    throw error;
  }
}

export async function generateBlogPost(topic?: string, category?: string, autoPublish = false) {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Non authentifié')
    }

    const response = await supabase.functions.invoke('blog-generate', {
      body: { topic, category, autoPublish }
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
