import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
  topic?: string
  autoPublish?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: userData, error: userError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    const { topic, autoPublish = true }: GenerateRequest = await req.json()

    // Bardahl automotive topics
    const topics = [
      'Comment choisir la bonne huile moteur pour votre véhicule',
      'Les avantages des huiles synthétiques Bardahl pour votre moteur',
      'Guide complet des additifs moteur : à quoi servent-ils vraiment ?',
      'Entretien de la boîte de vitesses : conseils et produits recommandés',
      'Viscosité des huiles moteur : comprendre les normes SAE et ACEA',
      'Comment l\'huile moteur protège votre moteur au quotidien',
      'Changement d\'huile : fréquence recommandée selon votre utilisation',
      'Les normes API et ACEA expliquées pour les automobilistes',
      'Additifs Bardahl : comment améliorer les performances de votre moteur',
      'Entretien préventif automobile : les produits indispensables',
      'Huile pour transmission : différences entre huile de boîte et différentiel',
      'Pourquoi choisir des lubrifiants de qualité pour votre véhicule',
    ]

    const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)]

    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    if (!mistralApiKey) {
      throw new Error('MISTRAL_API_KEY not configured')
    }

    const prompt = `Tu es un expert en lubrifiants automobiles et en produits Bardahl. Écris un article de blog complet et professionnel sur le sujet suivant : "${selectedTopic}".

L'article doit :
- Avoir un titre accrocheur et optimisé SEO, pertinent pour Bardahl et l'entretien automobile
- Contenir une introduction captivante (2-3 paragraphes)
- Être structuré avec des sous-titres (utilise ## pour les titres de section)
- Contenir 800-1200 mots
- Être informatif, pratique et technique
- Mentionner les produits et solutions Bardahl de façon naturelle quand c'est pertinent
- Inclure des conseils concrets pour les automobilistes
- Avoir un ton professionnel et expert
- Se terminer par une conclusion engageante avec un appel à l'action

Format de réponse (JSON strict) :
{
  "title": "Titre de l'article",
  "excerpt": "Résumé court de 150-200 caractères",
  "content": "Contenu complet en markdown",
  "tags": ["tag1", "tag2", "tag3"],
  "meta_title": "Titre SEO (60 caractères max)",
  "meta_description": "Description SEO (155 caractères max)"
}`

    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralApiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    })

    if (!mistralResponse.ok) {
      const errorText = await mistralResponse.text()
      throw new Error(`Mistral API error: ${errorText}`)
    }

    const mistralData = await mistralResponse.json()
    const generatedContent = JSON.parse(mistralData.choices[0].message.content)

    // Generate slug from title
    const slug = generatedContent.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)

    // Calculate read time
    const wordCount = generatedContent.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const blogPostData = {
      title: generatedContent.title,
      slug,
      excerpt: generatedContent.excerpt,
      content: generatedContent.content,
      tags: generatedContent.tags || [],
      read_time: readTime,
      status: autoPublish ? 'published' : 'draft',
      published_at: autoPublish ? new Date().toISOString() : null,
    }

    const { data: blogPost, error: insertError } = await supabaseClient
      .from('blog_posts')
      .insert(blogPostData)
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        blogPost,
        message: 'Article Bardahl généré avec succès'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
