-- Test du nouveau système de variantes simplifié

-- Vérifier la structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('available_colors', 'available_sizes', 'available_cup_sizes')
ORDER BY column_name;

-- Exemple d'insertion d'un produit avec le nouveau système
INSERT INTO products (
  title,
  slug,
  price,
  stock,
  available_colors,
  available_sizes,
  available_cup_sizes,
  is_active
) VALUES (
  'Test Soutien-gorge',
  'test-soutien-gorge',
  15000,
  50,
  '[{"name": "Noir", "hex": "#000000"}, {"name": "Blanc", "hex": "#FFFFFF"}]'::jsonb,
  ARRAY['S', 'M', 'L'],
  ARRAY['B', 'C', 'D'],
  true
) ON CONFLICT (slug) DO UPDATE SET
  available_colors = EXCLUDED.available_colors,
  available_sizes = EXCLUDED.available_sizes,
  available_cup_sizes = EXCLUDED.available_cup_sizes;

-- Exemple d'insertion d'une culotte (sans bonnets)
INSERT INTO products (
  title,
  slug,
  price,
  stock,
  available_colors,
  available_sizes,
  available_cup_sizes,
  is_active
) VALUES (
  'Test Culotte',
  'test-culotte',
  8000,
  100,
  '[{"name": "Rose", "hex": "#EC4899"}, {"name": "Noir", "hex": "#000000"}]'::jsonb,
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  NULL,
  true
) ON CONFLICT (slug) DO UPDATE SET
  available_colors = EXCLUDED.available_colors,
  available_sizes = EXCLUDED.available_sizes,
  available_cup_sizes = EXCLUDED.available_cup_sizes;

-- Vérifier les données
SELECT 
  title,
  available_colors,
  available_sizes,
  available_cup_sizes,
  stock
FROM products
WHERE slug IN ('test-soutien-gorge', 'test-culotte');
