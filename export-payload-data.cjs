// Script pour exporter les données de Payload vers Supabase
const { Client } = require('pg');

const payloadClient = new Client({
  connectionString: 'postgresql://neondb_owner:npg_19iFBIJEglcw@ep-billowing-sea-age6amti-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function exportData() {
  try {
    await payloadClient.connect();
    console.log('Connected to Payload DB\n');

    // Export Categories
    console.log('-- =====================================================');
    console.log('-- CATEGORIES');
    console.log('-- =====================================================\n');
    
    const categories = await payloadClient.query(`
      SELECT id, title, slug, description, created_at, updated_at
      FROM categories
      ORDER BY created_at
    `);
    
    categories.rows.forEach(cat => {
      console.log(`INSERT INTO public.categories (title, slug, description, is_active, created_at, updated_at)`);
      console.log(`VALUES (`);
      console.log(`  '${cat.title.replace(/'/g, "''")}',`);
      console.log(`  '${cat.slug}',`);
      console.log(`  ${cat.description ? `'${cat.description.replace(/'/g, "''")}'` : 'NULL'},`);
      console.log(`  true,`);
      console.log(`  '${cat.created_at.toISOString()}',`);
      console.log(`  '${cat.updated_at.toISOString()}'`);
      console.log(`);\n`);
    });

    // Export Collections
    console.log('\n-- =====================================================');
    console.log('-- PRODUCT COLLECTIONS');
    console.log('-- =====================================================\n');
    
    const collections = await payloadClient.query(`
      SELECT id, title, slug, description, created_at, updated_at
      FROM "product-collections"
      ORDER BY created_at
    `);
    
    collections.rows.forEach(col => {
      console.log(`INSERT INTO public.product_collections (title, slug, description, is_active, is_featured, created_at, updated_at)`);
      console.log(`VALUES (`);
      console.log(`  '${col.title.replace(/'/g, "''")}',`);
      console.log(`  '${col.slug}',`);
      console.log(`  ${col.description ? `'${col.description.replace(/'/g, "''")}'` : 'NULL'},`);
      console.log(`  true,`);
      console.log(`  false,`);
      console.log(`  '${col.created_at.toISOString()}',`);
      console.log(`  '${col.updated_at.toISOString()}'`);
      console.log(`);\n`);
    });

    // Export Products count
    const productsCount = await payloadClient.query(`
      SELECT COUNT(*) as count FROM products
    `);
    console.log(`\n-- Total products to migrate: ${productsCount.rows[0].count}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await payloadClient.end();
  }
}

exportData();
