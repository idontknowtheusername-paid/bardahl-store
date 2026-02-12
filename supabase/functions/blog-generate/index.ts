import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
  topic?: string
  category?: string
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

    const { topic, category, autoPublish = false }: GenerateRequest = await req.json()

    // Get random category if not specified
    let selectedCategory = category
    if (!selectedCategory) {
      const { data: categories } = await supabaseClient
        .from('blog_categories')
        .select('slug')
        .limit(5)
      
      if (categories && categories.length > 0) {
        selectedCategory = categories[Math.floor(Math.random() * categories.length)].slug
      }
    }

    // Generate topic if not provided
    const topics = [
      'Les secrets pour choisir la lingerie parfaite selon votre morphologie',
      'Comment prendre soin de sa peau naturellement',
      'Les tendances lingerie de la saison',
      'Astuces pour se sentir belle et confiante au quotidien',
      'Guide complet des matières de lingerie',
      'Les essentiels d\'une garde-robe lingerie',
      'Conseils beauté pour une peau éclatante',
      'Comment bien choisir sa taille de soutien-gorge',
      'Les bienfaits de la lingerie de qualité',
      'Routine beauté du matin en 10 minutes'
    ]

    const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)]

    // Call Mistral AI
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    if (!mistralApiKey) {
      throw new Error('MISTRAL_API_KEY not configured')
    }

    const prompt = `Tu es une experte en beauté, mode féminine et lingerie. Écris un article de blog complet et engageant sur le sujet suivant : "${selectedTopic}".

L'article doit :
- Avoir un titre accrocheur et optimisé SEO
- Contenir une introduction captivante (2-3 paragraphes)
- Être structuré avec des sous-titres (utilise ## pour les titres de section)
- Contenir 800-1200 mots
- Être informatif, pratique et inspirant
- Inclure des conseils concrets et applicables
- Avoir un ton chaleureux et professionnel
- Se terminer par une conclusion engageante

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
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
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

    // Calculate read time (assuming 200 words per minute)
    const wordCount = generatedContent.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    // Create blog post
    const blogPostData = {
      title: generatedContent.title,
      slug: slug,
      excerpt: generatedContent.excerpt,
      content: generatedContent.content,
      tags: generatedContent.tags || [],
      meta_title: generatedContent.meta_title,
      meta_description: generatedContent.meta_description,
      read_time: readTime,
      status: 'published',
      published_at: new Date().toISOString(),
    }

    const { data: blogPost, error: insertError } = await supabaseClient
      .from('blog_posts')
      .insert(blogPostData)
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Link to category if specified
    if (selectedCategory) {
      const { data: categoryData } = await supabaseClient
        .from('blog_categories')
        .select('id')
        .eq('slug', selectedCategory)
        .single()

      if (categoryData) {
        await supabaseClient
          .from('blog_post_categories')
          .insert({
            blog_post_id: blogPost.id,
            category_id: categoryData.id
          })
      }
    }

    // Log generation
    await supabaseClient
      .from('blog_generation_log')
      .insert({
        blog_post_id: blogPost.id,
        prompt: selectedTopic,
        status: 'success'
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        blogPost,
        message: 'Article généré avec succès'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
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
