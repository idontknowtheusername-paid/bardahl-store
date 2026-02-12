-- ============================================
-- SEED MOCK PRODUCTS (8 par catégorie)
-- ============================================

-- Récupérer les IDs des catégories
DO $$
DECLARE
  cat_ensembles UUID;
  cat_soutiens UUID;
  cat_culottes UUID;
  cat_nuisettes UUID;
  cat_pyjamas UUID;
  cat_accessoires UUID;
  cat_shorts UUID;
  cat_autres UUID;
  prod_id UUID;
BEGIN
  -- Récupérer les IDs des catégories
  SELECT id INTO cat_ensembles FROM categories WHERE slug = 'ensembles';
  SELECT id INTO cat_soutiens FROM categories WHERE slug = 'soutiens-gorge';
  SELECT id INTO cat_culottes FROM categories WHERE slug = 'culottes';
  SELECT id INTO cat_nuisettes FROM categories WHERE slug = 'nuisettes';
  SELECT id INTO cat_pyjamas FROM categories WHERE slug = 'pyjamas';
  SELECT id INTO cat_accessoires FROM categories WHERE slug = 'accessoires';
  SELECT id INTO cat_shorts FROM categories WHERE slug = 'shorts-boxers';
  SELECT id INTO cat_autres FROM categories WHERE slug = 'autres';

  -- ============================================
  -- ENSEMBLES (8 produits)
  -- ============================================
  FOR i IN 1..8 LOOP
    INSERT INTO products (title, slug, price, compare_at_price, stock, is_active, is_featured, short_description, available_sizes, available_colors)
    VALUES (
      'Ensemble Mock ' || i,
      'mock-ensemble-' || i,
      (2999 + (i * 500))::INTEGER,
      (3999 + (i * 500))::INTEGER,
      50,
      true,
      false,
      'Ensemble de lingerie élégant - Produit de test',
      ARRAY['S', 'M', 'L', 'XL'],
      '[{"name": "Noir", "hex": "#000000"}, {"name": "Rouge", "hex": "#DC2626"}]'::jsonb
    )
    RETURNING id INTO prod_id;
    
    INSERT INTO product_categories (product_id, category_id) VALUES (prod_id, cat_ensembles);
    INSERT INTO product_images (product_id, image_url, alt_text, display_order)
    VALUES (prod_id, 'https://images.unsplash.com/photo-1583846112476-f5e6e8d9d6b8?w=800', 'Mock Ensemble ' || i, 1);
  END LOOP;

  -- ============================================
  -- SOUTIENS-GORGE (8 produits)
  -- ============================================
  FOR i IN 1..8 LOOP
    INSERT INTO products (title, slug, price, compare_at_price, stock, is_active, is_featured, short_description, available_sizes, available_cup_sizes, available_colors)
    VALUES (
      'Soutien-gorge Mock ' || i,
      'mock-soutien-' || i,
      (2499 + (i * 300))::INTEGER,
      (3499 + (i * 300))::INTEGER,
      50,
      true,
      false,
      'Soutien-gorge confortable - Produit de test',
      ARRAY['S', 'M', 'L'],
      ARRAY['A', 'B', 'C', 'D'],
      '[{"name": "Beige", "hex": "#F5E6D3"}, {"name": "Noir", "hex": "#000000"}]'::jsonb
    )
    RETURNING id INTO prod_id;
    
    INSERT INTO product_categories (product_id, category_id) VALUES (prod_id, cat_soutiens);
    INSERT INTO product_images (product_id, image_url, alt_text, display_order)
    VALUES (prod_id, 'https://images.unsplash.com/photo-1583846112476-f5e6e8d9d6b8?w=800', 'Mock Soutien ' || i, 1);
  END LOOP;

  -- ============================================
  -- CULOTTES (8 produits)
  -- ============================================
  FOR i IN 1..8 LOOP
    INSERT INTO products (title, slug, price, compare_at_price, stock, is_active, is_featured, short_description, available_sizes, available_colors)
    VALUES (
      'Culotte Mock ' || i,
      'mock-culotte-' || i,
      (1499 + (i * 200))::INTEGER,
      (1999 + (i * 200))::INTEGER,
      50,
      true,
      false,
      'Culotte élégante - Produit de test',
      ARRAY['XS', 'S', 'M', 'L', 'XL'],
      '[{"name": "Rose", "hex": "#FFC0CB"}, {"name": "Blanc", "hex": "#FFFFFF"}]'::jsonb
    )
    RETURNING id INTO prod_id;
    
    INSERT INTO product_categories (product_id, category_id) VALUES (prod_id, cat_culottes);
    INSERT INTO product_images (product_id, image_url, alt_text, display_order)
    VALUES (prod_id, 'https://images.unsplash.com/photo-1583846112476-f5e6e8d9d6b8?w=800', 'Mock Culotte ' || i, 1);
  END LOOP;

  -- ============================================
  -- NUISETTES (8 produits)
  -- ============================================
  FOR i IN 1..8 LOOP
    INSERT INTO products (title, slug, price, compare_at_price, stock, is_active, is_featured, short_description, available_sizes, available_colors)
    VALUES (
      'Nuisette Mock ' || i,
      'mock-nuisette-' || i,
      (3999 + (i * 400))::INTEGER,
      (4999 + (i * 400))::INTEGER,
      50,
      true,
      false,
      'Nuisette sensuelle - Produit de test',
      ARRAY['S', 'M', 'L'],
      '[{"name": "Noir", "hex": "#000000"}, {"name": "Bordeaux", "hex": "#800020"}]'::jsonb
    )
    RETURNING id INTO prod_id;
    
    INSERT INTO product_categories (product_id, category_id) VALUES (prod_id, cat_nuisettes);
    INSERT INTO product_images (product_id, image_url, alt_text, display_order)
    VALUES (prod_id, 'https://images.unsplash.com/photo-1583846112476-f5e6e8d9d6b8?w=800', 'Mock Nuisette ' || i, 1);
  END LOOP;

  -- ============================================
  -- PYJAMAS (8 produits)
  -- ============================================
  FOR i IN 1..8 LOOP
    INSERT INTO products (title, slug, price, compare_at_price, stock, is_active, is_featured, short_description, available_sizes, available_colors)
    VALUES (
      'Pyjama Mock ' || i,
      'mock-pyjama-' || i,
      (4499 + (i * 300))::INTEGER,
      (5499 + (i * 300))::INTEGER,
      50,
      true,
      false,
      'Pyjama confortable - Produit de test',
      ARRAY['S', 'M', 'L', 'XL'],
      '[{"name": "Gris", "hex": "#808080"}, {"name": "Bleu", "hex": "#0000FF"}]'::jsonb
    )
    RETURNING id INTO prod_id;
    
    INSERT INTO product_categories (product_id, category_id) VALUES (prod_id, cat_pyjamas);
    INSERT INTO product_images (product_id, image_url, alt_text, display_order)
    VALUES (prod_id, 'https://images.unsplash.com/photo-1583846112476-f5e6e8d9d6b8?w=800', 'Mock Pyjama ' || i, 1);
  END LOOP;

  -- ============================================
  -- ACCESSOIRES (8 produits)
  -- ============================================
  FOR i IN 1..8 LOOP
    INSERT INTO products (title, slug, price, compare_at_price, stock, is_active, is_featured, short_description, available_sizes, available_colors)
    VALUES (
      'Accessoire Mock ' || i,
      'mock-accessoire-' || i,
      (999 + (i * 200))::INTEGER,
      (1499 + (i * 200))::INTEGER,
      50,
      true,
      false,
      'Accessoire de lingerie - Produit de test',
      ARRAY['Unique'],
      '[{"name": "Multicolore", "hex": "#FF69B4"}]'::jsonb
    )
    RETURNING id INTO prod_id;
    
    INSERT INTO product_categories (product_id, category_id) VALUES (prod_id, cat_accessoires);
    INSERT INTO product_images (product_id, image_url, alt_text, display_order)
    VALUES (prod_id, 'https://images.unsplash.com/photo-1583846112476-f5e6e8d9d6b8?w=800', 'Mock Accessoire ' || i, 1);
  END LOOP;

  -- ============================================
  -- SHORTS-BOXERS (8 produits)
  -- ============================================
  FOR i IN 1..8 LOOP
    INSERT INTO products (title, slug, price, compare_at_price, stock, is_active, is_featured, short_description, available_sizes, available_colors)
    VALUES (
      'Short Mock ' || i,
      'mock-short-' || i,
      (1999 + (i * 200))::INTEGER,
      (2499 + (i * 200))::INTEGER,
      50,
      true,
      false,
      'Short confortable - Produit de test',
      ARRAY['XS', 'S', 'M', 'L'],
      '[{"name": "Noir", "hex": "#000000"}, {"name": "Gris", "hex": "#808080"}]'::jsonb
    )
    RETURNING id INTO prod_id;
    
    INSERT INTO product_categories (product_id, category_id) VALUES (prod_id, cat_shorts);
    INSERT INTO product_images (product_id, image_url, alt_text, display_order)
    VALUES (prod_id, 'https://images.unsplash.com/photo-1583846112476-f5e6e8d9d6b8?w=800', 'Mock Short ' || i, 1);
  END LOOP;

  -- ============================================
  -- AUTRES (8 produits)
  -- ============================================
  FOR i IN 1..8 LOOP
    INSERT INTO products (title, slug, price, compare_at_price, stock, is_active, is_featured, short_description, available_sizes, available_colors)
    VALUES (
      'Autre Mock ' || i,
      'mock-autre-' || i,
      (2999 + (i * 300))::INTEGER,
      (3999 + (i * 300))::INTEGER,
      50,
      true,
      false,
      'Produit divers - Produit de test',
      ARRAY['S', 'M', 'L'],
      '[{"name": "Blanc", "hex": "#FFFFFF"}, {"name": "Noir", "hex": "#000000"}]'::jsonb
    )
    RETURNING id INTO prod_id;
    
    INSERT INTO product_categories (product_id, category_id) VALUES (prod_id, cat_autres);
    INSERT INTO product_images (product_id, image_url, alt_text, display_order)
    VALUES (prod_id, 'https://images.unsplash.com/photo-1583846112476-f5e6e8d9d6b8?w=800', 'Mock Autre ' || i, 1);
  END LOOP;

  RAISE NOTICE '64 produits mock créés avec succès (8 par catégorie)';
END $$;
