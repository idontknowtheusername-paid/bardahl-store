-- ============================================
-- SUPPRIMER TOUS LES PRODUITS MOCK
-- ============================================

-- Supprimer les images des produits mock
DELETE FROM product_images 
WHERE product_id IN (
  SELECT id FROM products WHERE slug LIKE 'mock-%'
);

-- Supprimer les relations catégories des produits mock
DELETE FROM product_categories 
WHERE product_id IN (
  SELECT id FROM products WHERE slug LIKE 'mock-%'
);

-- Supprimer les produits mock
DELETE FROM products WHERE slug LIKE 'mock-%';

-- Afficher le résultat
DO $$
BEGIN
  RAISE NOTICE 'Tous les produits mock ont été supprimés';
END $$;
