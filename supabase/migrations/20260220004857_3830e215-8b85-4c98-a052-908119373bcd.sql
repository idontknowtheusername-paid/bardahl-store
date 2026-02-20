
-- Clean up existing bad data
DELETE FROM shipping_rates;
DELETE FROM shipping_zones;

-- Create proper zones
-- Zone: Cotonou / Porto-Novo / Calavi
INSERT INTO shipping_zones (id, name, countries, cities, is_active) VALUES
  ('a1000001-0000-0000-0000-000000000001', 'Cotonou & environs', ARRAY['Bénin','Benin'], ARRAY['Cotonou','Porto-Novo','Abomey-Calavi','Calavi'], true),
  ('a1000001-0000-0000-0000-000000000002', 'Parakou', ARRAY['Bénin','Benin'], ARRAY['Parakou'], true),
  ('a1000001-0000-0000-0000-000000000003', 'Autres villes Bénin', ARRAY['Bénin','Benin'], ARRAY[]::text[], true),
  ('a1000001-0000-0000-0000-000000000004', 'France', ARRAY['France'], ARRAY[]::text[], true),
  ('a1000001-0000-0000-0000-000000000005', 'Afrique internationale', ARRAY['Côte d''Ivoire','Sénégal','Togo','Mali','Burkina Faso','Niger','Guinée','Cameroun','Congo','Ghana','Gabon'], ARRAY[]::text[], true);

-- Rates for Cotonou & environs
INSERT INTO shipping_rates (name, price, delivery_time, description, shipping_zone_id, is_active) VALUES
  ('Livraison express', 1500, 'Instantané', 'Livraison immédiate', 'a1000001-0000-0000-0000-000000000001', true),
  ('Livraison standard', 800, 'Max 24h', 'Livraison sous 24 heures', 'a1000001-0000-0000-0000-000000000001', true),
  ('Récupérer à la boutique', 0, 'Immédiat', 'Retrait en boutique', 'a1000001-0000-0000-0000-000000000001', true);

-- Rates for Parakou
INSERT INTO shipping_rates (name, price, delivery_time, description, shipping_zone_id, is_active) VALUES
  ('Livraison express', 1000, 'Instantané', 'Livraison immédiate', 'a1000001-0000-0000-0000-000000000002', true),
  ('Livraison standard', 500, 'Max 24h', 'Livraison sous 24 heures', 'a1000001-0000-0000-0000-000000000002', true),
  ('Récupérer à la boutique', 0, 'Immédiat', 'Retrait en boutique', 'a1000001-0000-0000-0000-000000000002', true);

-- Rates for other Benin cities (same as Cotonou)
INSERT INTO shipping_rates (name, price, delivery_time, description, shipping_zone_id, is_active) VALUES
  ('Livraison express', 1500, 'Instantané', 'Livraison immédiate', 'a1000001-0000-0000-0000-000000000003', true),
  ('Livraison standard', 800, 'Max 24h', 'Livraison sous 24 heures', 'a1000001-0000-0000-0000-000000000003', true),
  ('Récupérer à la boutique', 0, 'Immédiat', 'Retrait en boutique', 'a1000001-0000-0000-0000-000000000003', true);

-- Rates for France (fixed)
INSERT INTO shipping_rates (name, price, delivery_time, description, shipping_zone_id, is_active) VALUES
  ('Livraison internationale', 10000, '2-3 jours', 'Livraison en France métropolitaine', 'a1000001-0000-0000-0000-000000000004', true);

-- Rates for Africa international (fixed)
INSERT INTO shipping_rates (name, price, delivery_time, description, shipping_zone_id, is_active) VALUES
  ('Livraison internationale', 5000, '2-3 jours', 'Livraison en Afrique', 'a1000001-0000-0000-0000-000000000005', true);
