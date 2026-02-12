import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Find abandoned carts (created more than 1 hour ago, email not sent, not recovered)
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { data: abandonedCarts, error: fetchError } = await supabaseClient
      .from('abandoned_carts')
      .select('*')
      .eq('recovery_email_sent', false)
      .eq('recovered', false)
      .not('email', 'is', null)
      .lt('created_at', oneHourAgo.toISOString())

    if (fetchError) throw fetchError

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No abandoned carts to process',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let processed = 0
    let errors = 0

    for (const cart of abandonedCarts) {
      try {
        // Generate recovery link with cart data
        const recoveryToken = crypto.randomUUID()
        const recoveryUrl = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/panier?recovery=${recoveryToken}`

        // Prepare email content
        const itemsList = cart.items.map((item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              ${item.title || item.name}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
              ${item.quantity}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
              ${(item.price * item.quantity).toFixed(2)} €
            </td>
          </tr>
        `).join('')

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Vous avez oublié quelque chose !</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Bonjour,
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Nous avons remarqué que vous avez laissé des articles dans votre panier. 
                Ne les laissez pas s'échapper ! Vos articles vous attendent.
              </p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #ec4899;">Votre panier</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f5f5f5;">
                      <th style="padding: 10px; text-align: left;">Produit</th>
                      <th style="padding: 10px; text-align: center;">Qté</th>
                      <th style="padding: 10px; text-align: right;">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Total:</td>
                      <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #ec4899;">
                        ${cart.total.toFixed(2)} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${recoveryUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); 
                          color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; 
                          font-weight: bold; font-size: 16px;">
                  Finaliser ma commande
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Ce lien est valable pendant 7 jours. Si vous avez des questions, n'hésitez pas à nous contacter.
              </p>

              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                À bientôt,<br>
                L'équipe Cannesh
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>Vous recevez cet email car vous avez ajouté des articles à votre panier sur notre site.</p>
            </div>
          </body>
          </html>
        `

        // Send email
        const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
          body: {
            to: cart.email,
            subject: '🛍️ Vous avez oublié quelque chose dans votre panier',
            html: emailHtml
          }
        })

        if (emailError) {
          console.error('Email error for cart', cart.id, emailError)
          errors++
          continue
        }

        // Mark as sent
        await supabaseClient
          .from('abandoned_carts')
          .update({
            recovery_email_sent: true,
            recovery_email_sent_at: new Date().toISOString()
          })
          .eq('id', cart.id)

        processed++
      } catch (error) {
        console.error('Error processing cart', cart.id, error)
        errors++
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processed} abandoned carts`,
        processed,
        errors,
        total: abandonedCarts.length
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
        status: 500 
      }
    )
  }
})
