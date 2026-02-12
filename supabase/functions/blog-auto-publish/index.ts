import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// This function is meant to be called by a cron job (weekly)
// Configure in Supabase Dashboard: Database > Cron Jobs

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if we should generate a new post this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: recentPosts, error: checkError } = await supabaseClient
      .from('blog_posts')
      .select('id')
      .gte('created_at', oneWeekAgo.toISOString())
      .limit(1)

    if (checkError) {
      throw checkError
    }

    // If a post was already created this week, skip
    if (recentPosts && recentPosts.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Post already created this week',
          skipped: true
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Generate a new blog post
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
      'Routine beauté du matin en 10 minutes',
      'Les couleurs de lingerie qui subliment votre teint',
      'Comment entretenir sa lingerie délicate',
      'Les différents types de bonnets et leur utilité',
      'Lingerie et confiance en soi : le lien invisible',
      'Les matières naturelles en lingerie : avantages et entretien'
    ]

    const selectedTopic = topics[Math.floor(Math.random() * topics.length)]

    // Get random category
    const { data: categories } = await supabaseClient
      .from('blog_categories')
      .select('slug')
    
    const selectedCategory = categories && categories.length > 0
      ? categories[Math.floor(Math.random() * categories.length)].slug
      : null

    // Call Mistral AI (same logic as blog-generate)
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
        slug: slug,
        excerpt: generatedContent.excerpt,
        content: generatedContent.content,
        tags: generatedContent.tags || [],
        meta_title: generatedContent.meta_title,
        meta_description: generatedContent.meta_description,
        read_time: readTime,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Link to category
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
        message: 'Weekly blog post generated and published'
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
