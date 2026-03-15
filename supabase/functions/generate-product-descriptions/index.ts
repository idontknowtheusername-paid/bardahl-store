import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  title: string;
  product_type: string;
  viscosity?: string;
  api_norm?: string;
  acea_norm?: string;
  capacity?: string;
}

async function generateDescription(product: Product): Promise<{ short: string; long: string }> {
  const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
  if (!mistralApiKey) throw new Error('MISTRAL_API_KEY not configured');

  const prompt = `Tu es un expert en produits automobiles Bardahl. Génère deux descriptions pour ce produit :

Produit: ${product.title}
Type: ${product.product_type || 'Non spécifié'}
${product.viscosity ? `Viscosité: ${product.viscosity}` : ''}
${product.api_norm ? `Norme API: ${product.api_norm}` : ''}
${product.acea_norm ? `Norme ACEA: ${product.acea_norm}` : ''}
${product.capacity ? `Capacité: ${product.capacity}` : ''}

Génère:
1. Une description courte (1-2 phrases, max 150 caractères) - marketing et accrocheuse
2. Une description longue (3-4 phrases, max 400 caractères) - technique et détaillée

Format de réponse (JSON strict):
{
  "short": "description courte ici",
  "long": "description longue ici"
}`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mistralApiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';
  
  try {
    const parsed = JSON.parse(content);
    return {
      short: parsed.short || '',
      long: parsed.long || '',
    };
  } catch {
    // Fallback si le JSON n'est pas valide
    return {
      short: `${product.title} - Produit de qualité Bardahl`,
      long: `${product.title} est un produit automobile de haute qualité de la marque Bardahl, conçu pour offrir des performances optimales.`,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Récupérer les produits sans description
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, title, product_type, viscosity, api_norm, acea_norm, capacity')
      .or('short_description.is.null,description.is.null')
      .eq('is_active', true)
      .limit(10); // Traiter 10 produits à la fois pour éviter les timeouts

    if (fetchError) throw fetchError;

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Aucun produit à traiter', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${products.length} products...`);

    // Check if we should switch to daily frequency
    const { data: scheduleData } = await supabase
      .from('description_generation_schedule')
      .select('current_frequency, switch_date')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (scheduleData && new Date() >= new Date(scheduleData.switch_date) && scheduleData.current_frequency === 'twice-daily') {
      await supabase.rpc('update_schedule_frequency', { new_frequency: 'daily' });
      console.log('Switched to daily generation schedule');
    }

    let processed = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const descriptions = await generateDescription(product);
        
        await supabase
          .from('products')
          .update({
            short_description: descriptions.short,
            description: descriptions.long,
          })
          .eq('id', product.id);

        processed++;
        console.log(`✓ Generated descriptions for: ${product.title}`);
        
        // Petit délai pour éviter de surcharger l'API Mistral
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errors++;
        console.error(`✗ Error for ${product.title}:`, error);
      }
    }

    // Log this generation run
    await supabase.rpc('log_generation_run', { processed_count: processed });

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        errors,
        total: products.length,
        message: `Descriptions générées pour ${processed} produits`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
