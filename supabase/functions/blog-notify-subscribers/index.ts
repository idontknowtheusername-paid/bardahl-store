import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://cannesh-lingerie-suite.vercel.app';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { blog_post_id, title, slug, excerpt } = await req.json();

    if (!blog_post_id || !title || !slug) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all active subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from('blog_subscribers')
      .select('email, unsubscribe_token')
      .eq('is_active', true);

    if (subsError) {
      console.error('Error fetching subscribers:', subsError);
      throw subsError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscribers', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending blog notification to ${subscribers.length} subscribers`);

    const blogUrl = `${FRONTEND_URL}/blog/${slug}`;
    
    // Send emails in batches
    const batchSize = 50;
    let sentCount = 0;
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (subscriber) => {
        const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`;
        
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Cannesh Lingerie <blog@cannesh.com>',
              to: subscriber.email,
              subject: `📰 Nouvel article : ${title}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #D4A5A5 0%, #C48B8B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Cannesh Lingerie</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Votre boutique de lingerie élégante</p>
                  </div>
                  
                  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                    <h2 style="color: #D4A5A5; margin-top: 0;">📰 Nouvel article de blog</h2>
                    
                    <h3 style="color: #333; font-size: 22px; margin: 20px 0;">${title}</h3>
                    
                    ${excerpt ? `<p style="color: #666; font-size: 16px; line-height: 1.6;">${excerpt}</p>` : ''}
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${blogUrl}" 
                         style="display: inline-block; background: #D4A5A5; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                        Lire l'article
                      </a>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                      Vous recevez cet email car vous êtes abonné(e) aux notifications du blog Cannesh Lingerie.
                      <br><br>
                      <a href="${unsubscribeUrl}" style="color: #D4A5A5; text-decoration: none;">Se désabonner</a>
                    </p>
                  </div>
                  
                  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} Cannesh Lingerie. Tous droits réservés.</p>
                    <p>Cotonou, Bénin</p>
                  </div>
                </body>
                </html>
              `,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            console.error(`Failed to send to ${subscriber.email}:`, error);
            return false;
          }
          
          return true;
        } catch (error) {
          console.error(`Error sending to ${subscriber.email}:`, error);
          return false;
        }
      });

      const results = await Promise.all(emailPromises);
      sentCount += results.filter(r => r).length;
      
      // Small delay between batches to avoid rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Successfully sent ${sentCount}/${subscribers.length} emails`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount,
        total: subscribers.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-notify-subscribers:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
