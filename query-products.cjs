const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_19iFBIJEglcw@ep-billowing-sea-age6amti-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function queryProducts() {
  try {
    await client.connect();
    
    // Récupérer 2 produits par catégorie
    const products = await client.query(`
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.description,
        p.price,
        p.stock,
        p.is_active,
        p.is_new,
        p.is_featured,
        p.created_at,
        p.updated_at,
        c.id as category_id,
        c.title as category_title
      FROM products p
      LEFT JOIN products_rels pr ON p.id = pr.parent_id AND pr.path = 'categories'
      LEFT JOIN categories c ON pr.categories_id = c.id
      WHERE p.is_active = true
      ORDER BY c.id, p.created_at
      LIMIT 12
    `);
    
    console.log('Produits trouvés:', products.rows.length);
    console.log(JSON.stringify(products.rows, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

queryProducts();
