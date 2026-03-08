
-- Insert missing categories
INSERT INTO categories (slug, title, description, display_order, is_active) VALUES
  ('liquides', 'Liquide de refroidissement & lave-glace', 'Liquides de refroidissement, antigel et lave-glace haute performance', 5, true),
  ('purifiant-desodorisant', 'Purifiant & désodorisant', 'Purifiants d''air et désodorisants pour habitacle automobile', 6, true),
  ('special-atelier', 'Spécial atelier', 'Produits professionnels pour atelier et garage', 7, true),
  ('packs-entretien', 'Packs entretien', 'Packs complets pour l''entretien de votre véhicule', 8, true),
  ('accessoires-electronique', 'Accessoires & Électronique auto', 'Accessoires et équipements électroniques pour votre véhicule', 9, true),
  ('filtres', 'Filtres', 'Filtres à huile, à gasoil, à air et autres filtres', 10, true)
ON CONFLICT (slug) DO NOTHING;

-- Deactivate parasite categories
UPDATE categories SET is_active = false WHERE slug IN ('moto', 'maison-jardin');

-- Reorder existing categories
UPDATE categories SET display_order = 1 WHERE slug = 'huile-moteur';
UPDATE categories SET display_order = 2 WHERE slug = 'transmission';
UPDATE categories SET display_order = 3 WHERE slug = 'additifs';
UPDATE categories SET display_order = 4 WHERE slug = 'entretien';
