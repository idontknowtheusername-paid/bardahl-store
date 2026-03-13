
-- Insert subcategories for Filtres (parent: caee5122-51e9-4cf1-b71b-5683d5977cf4)
INSERT INTO categories (slug, title, parent_id, is_active, display_order) VALUES
  ('filtres-a-huile', 'Filtres à huile', 'caee5122-51e9-4cf1-b71b-5683d5977cf4', true, 1),
  ('filtres-a-air', 'Filtres à air', 'caee5122-51e9-4cf1-b71b-5683d5977cf4', true, 2),
  ('filtres-gasoil', 'Filtres gasoil', 'caee5122-51e9-4cf1-b71b-5683d5977cf4', true, 3),
  ('filtres-hydrauliques', 'Filtres hydrauliques', 'caee5122-51e9-4cf1-b71b-5683d5977cf4', true, 4)
ON CONFLICT DO NOTHING;

-- Insert subcategories for Additifs (parent: d07db962-f6bd-4fdc-a3b8-9442eaba7dbb)
INSERT INTO categories (slug, title, parent_id, is_active, display_order) VALUES
  ('additif-essence', 'Additif carburant Essence', 'd07db962-f6bd-4fdc-a3b8-9442eaba7dbb', true, 1),
  ('additif-diesel', 'Additif moteur Diesel', 'd07db962-f6bd-4fdc-a3b8-9442eaba7dbb', true, 2),
  ('additif-moteur', 'Additif moteur', 'd07db962-f6bd-4fdc-a3b8-9442eaba7dbb', true, 3)
ON CONFLICT DO NOTHING;

-- Insert Liquide de frein category if not exists
INSERT INTO categories (slug, title, is_active, display_order) VALUES
  ('liquide-de-frein', 'Liquide de frein', true, 5)
ON CONFLICT DO NOTHING;

-- Insert EPI category if not exists
INSERT INTO categories (slug, title, is_active, display_order) VALUES
  ('epi', 'EPI (Équipement de Protection)', true, 12)
ON CONFLICT DO NOTHING;
