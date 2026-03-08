import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://autopassion-bardahl.vercel.app'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { blog_post_id, title, slug, excerpt, featured_image } = await req.json()

    if (!blog_post_id || !title || !slug) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get all active subscribers from BOTH tables
    const [blogSubs, newsletterSubs] = await Promise.all([
      supabase.from('blog_subscribers').select('email, unsubscribe_token').eq('is_active', true),
      supabase.from('newsletter_subscribers').select('email').eq('status', 'active'),
    ])

    // Merge and deduplicate emails
    const emailMap = new Map<string, string | null>()
    
    for (const sub of (blogSubs.data || [])) {
      emailMap.set(sub.email, sub.unsubscribe_token)
    }
    for (const sub of (newsletterSubs.data || [])) {
      if (!emailMap.has(sub.email)) {
        emailMap.set(sub.email, null)
      }
    }

    if (emailMap.size === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscribers', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Sending blog notification to ${emailMap.size} subscribers`)

    const blogUrl = `${FRONTEND_URL}/blog/${slug}`
    const shopUrl = `${FRONTEND_URL}/categories`
    let sentCount = 0

    const subscribers = Array.from(emailMap.entries())
    const batchSize = 50

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      const emailPromises = batch.map(async ([email, unsubToken]) => {
        const unsubscribeUrl = unsubToken
          ? `${FRONTEND_URL}/unsubscribe?token=${unsubToken}`
          : `${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`

        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'AutoPassion Blog <blog@autopassion.bj>',
              to: email,
              subject: `🚗 Nouvel article : ${title}`,
              html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #f4f4f4;">
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 30px; text-align: center;">
    <h1 style="color: #e94560; margin: 0; font-size: 28px; font-weight: bold;">AutoPassion</h1>
    <p style="color: #ccc; margin: 10px 0 0 0; font-size: 14px;">Bardahl – Performance & Protection</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px;">
    ${featured_image ? `<img src="${featured_image}" alt="${title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">` : ''}
    
    <h2 style="color: #1a1a2e; margin-top: 0; font-size: 24px;">🚗 Nouvel article sur le blog</h2>
    
    <h3 style="color: #e94560; font-size: 20px; margin: 15px 0;">${title}</h3>
    
    ${excerpt ? `<p style="color: #555; font-size: 16px; line-height: 1.6;">${excerpt}</p>` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${blogUrl}" style="display: inline-block; background: #e94560; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        📖 Lire l'article
      </a>
    </div>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #e94560;">
      <h4 style="color: #1a1a2e; margin: 0 0 10px 0;">🛒 Besoin de produits Bardahl ?</h4>
      <p style="color: #555; margin: 0 0 15px 0; font-size: 14px;">Découvrez notre gamme complète d'huiles et additifs pour votre véhicule.</p>
      <a href="${shopUrl}" style="display: inline-block; background: #1a1a2e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
        Voir nos produits →
      </a>
    </div>
    
    <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      Vous recevez cet email car vous êtes abonné(e) aux notifications AutoPassion.
      <br><a href="${unsubscribeUrl}" style="color: #e94560; text-decoration: none;">Se désabonner</a>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} AutoPassion Bardahl. Tous droits réservés.</p>
  </div>
</body>
</html>`,
            }),
          })

          if (!response.ok) {
            console.error(`Failed to send to ${email}:`, await response.text())
            return false
          }
          return true
        } catch (error) {
          console.error(`Error sending to ${email}:`, error)
          return false
        }
      })

      const results = await Promise.all(emailPromises)
      sentCount += results.filter(r => r).length

      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`Successfully sent ${sentCount}/${emailMap.size} emails`)

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: emailMap.size }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('blog-notify-subscribers error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
