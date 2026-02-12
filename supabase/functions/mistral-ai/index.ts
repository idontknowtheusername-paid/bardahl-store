import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, title, type, message, context } = await req.json();

    if (!MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY not configured');
    }

    let prompt = '';
    let maxTokens = 300;

    // Generate product description
    if (action === 'generate-description') {
      if (!title || title.length < 10) {
        return new Response(
          JSON.stringify({ error: 'Le titre doit contenir au moins 10 caractères' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (type === 'short') {
        prompt = `Tu es un expert en e-commerce de lingerie féminine au Bénin. Génère une description courte et accrocheuse (50-80 mots) pour ce produit : "${title}". 

Mets en avant :
- Le confort et la qualité
- Le style et l'élégance
- L'occasion d'usage

Utilise un ton séduisant mais raffiné, professionnel. Écris en français. Ne mets pas de titre, juste la description.`;
        maxTokens = 150;
      } else {
        prompt = `Tu es un expert en e-commerce de lingerie féminine au Bénin. Génère une description détaillée et persuasive (150-200 mots) pour ce produit : "${title}".

Inclus :
- Description du style et du design
- Avantages et confort
- Occasions d'usage (quotidien, soirée, etc.)
- Pourquoi l'acheter

Utilise un ton élégant et professionnel. Écris en français. Structure en paragraphes courts. Ne mets pas de titre.`;
        maxTokens = 400;
      }
    }
    // Chat assistant
    else if (action === 'chat') {
      const systemPrompt = `Tu es un assistant administrateur pour un site e-commerce de lingerie féminine au Bénin. 
Tu aides l'administrateur à gérer le site : créer des produits, gérer les commandes, répondre aux questions.
Sois concis, professionnel et utile. Réponds en français.

${context ? `Contexte actuel : ${context}` : ''}`;

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500,
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
    } else {
      return new Response(
        JSON.stringify({ error: 'Action invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Mistral API for description generation
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

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
