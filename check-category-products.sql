-- Vérifier le nombre de produits par catégorie
SELECT 
  c.slug,
  c.title,
  c.is_active as category_active,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(DISTINCT CASE WHEN p.is_active = true THEN p.id END) as active_product_count
FROM categories c
LEFT JOIN product_categories pc ON c.id = pc.category_id
LEFT JOIN products p ON pc.product_id = p.id
GROUP BY c.id, c.slug, c.title, c.is_active, c.display_order
ORDER BY c.display_order;
