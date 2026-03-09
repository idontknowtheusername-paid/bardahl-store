import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const siteUrl = 'https://autopassionbj.com';

const supabase = createClient(supabaseUrl, supabaseKey);

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

async function generateSitemap() {
  const urls: SitemapUrl[] = [];

  // Pages statiques
  const staticPages = [
    { path: '/', changefreq: 'daily' as const, priority: 1.0 },
    { path: '/about', changefreq: 'monthly' as const, priority: 0.8 },
    { path: '/contact', changefreq: 'monthly' as const, priority: 0.8 },
    { path: '/categories', changefreq: 'weekly' as const, priority: 0.9 },
    { path: '/blog', changefreq: 'weekly' as const, priority: 0.8 }, // Mis à jour chaque semaine avec nouveaux articles
    { path: '/faq', changefreq: 'monthly' as const, priority: 0.7 },
    { path: '/diagnostic', changefreq: 'monthly' as const, priority: 0.8 },
    { path: '/entretien', changefreq: 'monthly' as const, priority: 0.8 },
    { path: '/selections', changefreq: 'weekly' as const, priority: 0.7 },
    { path: '/new-arrivals', changefreq: 'daily' as const, priority: 0.8 },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${siteUrl}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  // Catégories
  const categories = [
    'huile-moteur',
    'transmission',
    'additifs',
    'liquides',
    'purifiant-desodorisant',
    'entretien',
    'special-atelier',
    'packs-entretien',
    'accessoires-electronique',
    'filtres',
  ];

  categories.forEach(cat => {
    urls.push({
      loc: `${siteUrl}/categories/${cat}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8,
    });
  });

  // Produits depuis Supabase
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true);

    if (products) {
      products.forEach(product => {
        urls.push({
          loc: `${siteUrl}/produits/${product.slug}`,
          lastmod: product.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
  }

  // Articles de blog
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published');

    if (posts) {
      posts.forEach(post => {
        urls.push({
          loc: `${siteUrl}/blog/${post.slug}`,
          lastmod: post.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6,
        });
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
  }

  // Générer le XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  // Écrire le fichier
  const publicDir = path.join(process.cwd(), 'public');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  
  console.log(`✅ Sitemap généré avec ${urls.length} URLs`);
}

generateSitemap().catch(console.error);
