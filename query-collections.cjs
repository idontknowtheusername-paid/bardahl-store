const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_19iFBIJEglcw@ep-billowing-sea-age6amti-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function queryCollections() {
  try {
    await client.connect();
    
    // Lister toutes les tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%collection%'
      ORDER BY table_name
    `);
    
    console.log('Tables contenant "collection":');
    console.log(tables.rows);
    
    // Essayer différents noms possibles
    const possibleNames = ['product_collections', 'productCollections', 'collections'];
    
    for (const name of possibleNames) {
      try {
        const result = await client.query(`SELECT * FROM "${name}" LIMIT 5`);
        console.log(`\n✓ Table trouvée: ${name}`);
        console.log('Colonnes:', Object.keys(result.rows[0] || {}));
        console.log('Données:', result.rows);
        break;
      } catch (e) {
        // Table n'existe pas, continuer
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

queryCollections();
