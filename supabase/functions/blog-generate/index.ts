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

const AUTOMOTIVE_IMAGES = [
  { url: 'https://picsum.photos/seed/engine1/800/500', alt: 'Moteur automobile' },
  { url: 'https://picsum.photos/seed/car1/800/500', alt: 'Voiture sport' },
  { url: 'https://picsum.photos/seed/mechanic1/800/500', alt: 'Mécanicien au travail' },
  { url: 'https://picsum.photos/seed/oil1/800/500', alt: 'Vidange huile moteur' },
  { url: 'https://picsum.photos/seed/garage1/800/500', alt: 'Entretien automobile' },
  { url: 'https://picsum.photos/seed/workshop1/800/500', alt: 'Garage automobile' },
  { url: 'https://picsum.photos/seed/luxury1/800/500', alt: 'Voiture de luxe' },
  { url: 'https://picsum.photos/seed/modern1/800/500', alt: 'Véhicule moderne' },
  { url: 'https://picsum.photos/seed/tools1/800/500', alt: 'Outils mécaniques' },
  { url: 'https://picsum.photos/seed/road1/800/500', alt: 'Route automobile' },
  { url: 'https://picsum.photos/seed/detail1/800/500', alt: 'Moteur détail' },
  { url: 'https://picsum.photos/seed/dashboard1/800/500', alt: 'Tableau de bord' },
]

function getRandomImages(count: number, exclude: number[] = []): typeof AUTOMOTIVE_IMAGES {
  const available = AUTOMOTIVE_IMAGES.filter((_, i) => !exclude.includes(i))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
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
    if (!authHeader) throw new Error('Missing authorization header')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    const { data: userData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userData?.role !== 'admin') throw new Error('Admin access required')

    const { topic, autoPublish = true } = await req.json()

    // Anti-duplicate: get existing post titles
    const { data: existingPosts } = await supabaseClient
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

    // Pick images for the blog
    const coverIdx = Math.floor(Math.random() * AUTOMOTIVE_IMAGES.length)
    const coverImage = AUTOMOTIVE_IMAGES[coverIdx]
    const inlineImages = getRandomImages(3, [coverIdx])

    const imageInstructions = inlineImages.map((img, i) => 
      `Image ${i + 1}: ![${img.alt}](${img.url})`
    ).join('\n')

    const prompt = `Tu es un expert en lubrifiants automobiles et produits Bardahl. Écris un article de blog complet sur : "${selectedTopic}".

L'article doit :
- Avoir un titre accrocheur et optimisé SEO pour Bardahl et l'entretien automobile
- Contenir 800-1200 mots, structuré avec des sous-titres (## pour sections)
- Être informatif, pratique et technique
- Mentionner Bardahl naturellement quand pertinent
- Inclure des conseils concrets pour les automobilistes
- Ton professionnel et expert
- Conclure avec un appel à l'action vers les produits AutoPassion/Bardahl

IMPORTANT : Intègre ces images dans le contenu markdown aux endroits pertinents :
${imageInstructions}

Place au moins 2 images dans le contenu à des endroits logiques (après une introduction, entre des sections, etc.)

Format JSON strict :
{
  "title": "Titre de l'article",
  "excerpt": "Résumé court de 150-200 caractères",
  "content": "Contenu complet en markdown avec les images intégrées",
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

    const { data: blogPost, error: insertError } = await supabaseClient
      .from('blog_posts')
      .insert({
        title: generatedContent.title,
        slug,
        excerpt: generatedContent.excerpt,
        content: generatedContent.content,
        tags: generatedContent.tags || [],
        read_time: readTime,
        featured_image: coverImage.url,
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
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/blog-notify-subscribers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            blog_post_id: blogPost.id,
            title: blogPost.title,
            slug: blogPost.slug,
            excerpt: blogPost.excerpt,
            featured_image: coverImage.url,
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
