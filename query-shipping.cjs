const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_19iFBIJEglcw@ep-billowing-sea-age6amti-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function queryShipping() {
  try {
    await client.connect();
    
    // Lister les tables liées à la livraison
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%shipping%' OR table_name LIKE '%zone%' OR table_name LIKE '%delivery%')
      ORDER BY table_name
    `);
    
    console.log('=== TABLES LIVRAISON ===');
    console.log(tables.rows.map(r => r.table_name));
    
    // Zones de livraison
    try {
      const zones = await client.query(`SELECT * FROM shipping_zones ORDER BY id`);
      console.log('\n=== ZONES DE LIVRAISON ===');
      console.log(JSON.stringify(zones.rows, null, 2));
    } catch (e) {
      console.log('Table shipping_zones non trouvée');
    }
    
    // Tarifs de livraison
    try {
      const rates = await client.query(`SELECT * FROM shipping_rates ORDER BY id`);
      console.log('\n=== TARIFS DE LIVRAISON ===');
      console.log(JSON.stringify(rates.rows, null, 2));
    } catch (e) {
      console.log('Table shipping_rates non trouvée');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

queryShipping();
