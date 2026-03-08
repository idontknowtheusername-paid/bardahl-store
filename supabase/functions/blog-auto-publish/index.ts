import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Check if post already created this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: recentPosts } = await supabaseClient
      .from('blog_posts')
      .select('id')
      .gte('created_at', oneWeekAgo.toISOString())
      .limit(1)

    if (recentPosts && recentPosts.length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Post already created this week', skipped: true }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Anti-duplicate: get existing titles
    const { data: existingPosts } = await supabaseClient
      .from('blog_posts')
      .select('title')

    const existingTitles = (existingPosts || []).map((p: any) => p.title.toLowerCase())
    const unusedTopics = AUTOMOTIVE_TOPICS.filter(t =>
      !existingTitles.some((et: string) => et.includes(t.substring(0, 30).toLowerCase()))
    )
    const selectedTopic = unusedTopics.length > 0
      ? unusedTopics[Math.floor(Math.random() * unusedTopics.length)]
      : AUTOMOTIVE_TOPICS[Math.floor(Math.random() * AUTOMOTIVE_TOPICS.length)]

    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    if (!mistralApiKey) throw new Error('MISTRAL_API_KEY not configured')

    // Generate AI cover image
    console.log('Generating cover image for topic:', selectedTopic)
    const coverImageUrl = await generateCoverImage(selectedTopic, supabaseClient)
    console.log('Cover image URL:', coverImageUrl)

    const prompt = `Tu es un expert en lubrifiants automobiles et produits Bardahl. Écris un article de blog complet sur : "${selectedTopic}".

L'article doit :
- Avoir un titre accrocheur et optimisé SEO
- Contenir 800-1200 mots, structuré avec des sous-titres (## pour sections)
- Être informatif, pratique et technique
- Mentionner Bardahl naturellement
- Ton professionnel et expert
- Conclure avec un appel à l'action vers AutoPassion/Bardahl
- NE PAS inclure d'images dans le contenu

Format JSON strict :
{
  "title": "Titre",
  "excerpt": "Résumé 150-200 caractères",
  "content": "Contenu markdown sans images",
  "tags": ["tag1", "tag2", "tag3"]
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

    if (!mistralResponse.ok) throw new Error(`Mistral API error: ${await mistralResponse.text()}`)

    const mistralData = await mistralResponse.json()
    const generated = JSON.parse(mistralData.choices[0].message.content)

    const slug = generated.title
      .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)

    const wordCount = generated.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const { data: blogPost, error: insertError } = await supabaseClient
      .from('blog_posts')
      .insert({
        title: generated.title,
        slug,
        excerpt: generated.excerpt,
        content: generated.content,
        tags: generated.tags || [],
        read_time: readTime,
        featured_image: coverImageUrl,
        author: 'AutoPassion',
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Notify subscribers
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

    return new Response(
      JSON.stringify({ success: true, blogPost, message: 'Weekly blog post generated' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('blog-auto-publish error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
