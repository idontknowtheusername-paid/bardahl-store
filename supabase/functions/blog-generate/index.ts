import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const AUTOMOTIVE_TOPICS = [
  'Comment choisir la bonne huile moteur pour votre véhicule',
  'Les avantages des huiles synthétiques Bardahl pour votre moteur',
  'Guide complet des additifs moteur : à quoi servent-ils vraiment ?',
  'Entretien de la boîte de vitesses : conseils et produits recommandés',
  'Viscosité des huiles moteur : comprendre les normes SAE et ACEA',
  'Changement d\'huile : fréquence recommandée selon votre utilisation',
  'Additifs Bardahl : comment améliorer les performances de votre moteur',
  'Entretien préventif automobile : les produits indispensables',
  'Pourquoi choisir des lubrifiants de qualité pour votre véhicule',
  'Les normes API et ACEA expliquées pour les automobilistes',
  'Huile pour transmission : différences entre boîte et différentiel',
  'Comment protéger votre moteur pendant les fortes chaleurs',
  'Vidange moteur : guide étape par étape pour les débutants',
  'Les différents types d\'huiles moteur et leurs applications',
  'Entretien du système de refroidissement : conseils pratiques',
  'Comment réduire la consommation de carburant de votre véhicule',
  'Les bienfaits du nettoyant injecteur Bardahl',
  'Préparer sa voiture pour l\'hivernage : checklist complète',
  'Comprendre les voyants du tableau de bord liés à la lubrification',
  'Les erreurs courantes lors du choix d\'une huile moteur',
  'Entretien du turbocompresseur : huile et additifs recommandés',
  'Guide de maintenance pour véhicules à fort kilométrage',
  'Les innovations Bardahl en matière de lubrification automobile',
  'Comment diagnostiquer une surconsommation d\'huile moteur',
  'Huiles moteur pour motos : spécificités et recommandations',
  'L\'importance du filtre à huile dans l\'entretien moteur',
  'Entretien automobile au Bénin : défis et solutions adaptées',
  'Les produits Bardahl indispensables pour l\'été',
  'Comment prolonger la durée de vie de votre moteur diesel',
  'Comparatif huiles minérales vs synthétiques vs semi-synthétiques',
]

async function generateCoverImage(topic: string, supabaseClient: any): Promise<string> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!lovableApiKey) {
    console.warn('LOVABLE_API_KEY not set, using fallback image')
    return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=500&fit=crop'
  }

  try {
    const imagePrompt = `Professional automotive photography related to: "${topic}". Show engine parts, motor oil, car maintenance, mechanic workshop, or lubricant products. Clean, professional, well-lit. No text overlays.`

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: imagePrompt }],
        modalities: ['image', 'text'],
      }),
    })

    if (!response.ok) {
      console.error('AI image generation failed:', await response.text())
      return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=500&fit=crop'
    }

    const data = await response.json()
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url

    if (!imageData || !imageData.startsWith('data:image')) {
      console.error('No image in AI response')
      return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=500&fit=crop'
    }

    // Extract base64 and upload to Supabase storage
    const base64Data = imageData.split(',')[1]
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    const fileName = `blog/cover-${Date.now()}.png`

    const { error: uploadError } = await supabaseClient.storage
      .from('products')
      .upload(fileName, binaryData, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=500&fit=crop'
    }

    const { data: urlData } = supabaseClient.storage
      .from('products')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (e) {
    console.error('Cover image generation error:', e)
    return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=500&fit=crop'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Service role client for data operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

    // Auth: accept service role key (cron) OR validate user JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const token = authHeader.replace('Bearer ', '')
    const isServiceRole = token === supabaseServiceKey

    if (!isServiceRole) {
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: { user }, error: authError } = await authClient.auth.getUser()
      if (authError || !user) {
        console.error('Auth error:', authError?.message)
        throw new Error('Unauthorized')
      }

      const { data: userData } = await serviceClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (userData?.role !== 'admin') throw new Error('Admin access required')
    }

    const { topic, autoPublish = true } = await req.json()

    // Anti-duplicate: get existing post titles
    const { data: existingPosts } = await serviceClient
      .from('blog_posts')
      .select('title')

    const existingTitles = (existingPosts || []).map((p: any) => p.title.toLowerCase())

    // Pick a topic that hasn't been used
    let selectedTopic = topic
    if (!selectedTopic) {
      const unusedTopics = AUTOMOTIVE_TOPICS.filter(t =>
        !existingTitles.some((et: string) => et.includes(t.substring(0, 30).toLowerCase()))
      )
      selectedTopic = unusedTopics.length > 0
        ? unusedTopics[Math.floor(Math.random() * unusedTopics.length)]
        : AUTOMOTIVE_TOPICS[Math.floor(Math.random() * AUTOMOTIVE_TOPICS.length)]
    }

    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    if (!mistralApiKey) throw new Error('MISTRAL_API_KEY not configured')

    // Generate AI cover image relevant to the topic
    console.log('Generating cover image for topic:', selectedTopic)
    const coverImageUrl = await generateCoverImage(selectedTopic, serviceClient)
    console.log('Cover image URL:', coverImageUrl)

    const prompt = `Tu es un expert en lubrifiants automobiles et produits Bardahl. Écris un article de blog complet sur : "${selectedTopic}".

L'article doit :
- Avoir un titre accrocheur et optimisé SEO pour Bardahl et l'entretien automobile
- Contenir 800-1200 mots, structuré avec des sous-titres (## pour sections)
- Être informatif, pratique et technique
- Mentionner Bardahl naturellement quand pertinent
- Inclure des conseils concrets pour les automobilistes
- Ton professionnel et expert
- Conclure avec un appel à l'action vers les produits AutoPassion/Bardahl
- NE PAS inclure d'images dans le contenu, la couverture est gérée séparément

Format JSON strict :
{
  "title": "Titre de l'article",
  "excerpt": "Résumé court de 150-200 caractères",
  "content": "Contenu complet en markdown sans images",
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
        response_format: { type: 'json_object' },
      }),
    })

    if (!mistralResponse.ok) {
      throw new Error(`Mistral API error: ${await mistralResponse.text()}`)
    }

    const mistralData = await mistralResponse.json()
    const generatedContent = JSON.parse(mistralData.choices[0].message.content)

    const slug = generatedContent.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)

    const wordCount = generatedContent.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const { data: blogPost, error: insertError } = await serviceClient
      .from('blog_posts')
      .insert({
        title: generatedContent.title,
        slug,
        excerpt: generatedContent.excerpt,
        content: generatedContent.content,
        tags: generatedContent.tags || [],
        read_time: readTime,
        featured_image: coverImageUrl,
        author: 'AutoPassion',
        status: autoPublish ? 'published' : 'draft',
        published_at: autoPublish ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Notify subscribers if published
    if (autoPublish && blogPost) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/blog-notify-subscribers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            blog_post_id: blogPost.id,
            title: blogPost.title,
            slug: blogPost.slug,
            excerpt: blogPost.excerpt,
            featured_image: coverImageUrl,
          }),
        })
      } catch (e) {
        console.error('Failed to notify subscribers:', e)
      }
    }

    return new Response(
      JSON.stringify({ success: true, blogPost, message: 'Article généré avec succès' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('blog-generate error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
