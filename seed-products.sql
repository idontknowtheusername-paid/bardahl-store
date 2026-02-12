-- =====================================================
-- SEED PRODUITS MOCK (2 par catégorie)
-- =====================================================

-- Catégorie: Ensembles (id à récupérer)
INSERT INTO public.products (title, slug, short_description, price, compare_at_price, stock, composition, style, is_active, is_new, is_featured)
VALUES 
  ('Ensemble Dentelle Rose', 'ensemble-dentelle-rose', 'Ensemble soutien-gorge et culotte en dentelle délicate', 15000, 18000, 25, '90% Polyamide, 10% Élasthanne', 'elegant', true, true, true),
  ('Ensemble Satin Noir', 'ensemble-satin-noir', 'Ensemble luxueux en satin avec finitions dentelle', 18000, 22000, 15, '95% Polyester, 5% Élasthanne', 'sexy', true, false, true);

-- Catégorie: Soutiens-gorge
INSERT INTO public.products (title, slug, short_description, price, stock, composition, style, is_active, is_new)
VALUES 
  ('Soutien-gorge Push-up Nude', 'soutien-gorge-pushup-nude', 'Soutien-gorge push-up confortable avec armatures', 8500, 40, '85% Polyamide, 15% Élasthanne', 'classique', true, false),
  ('Bralette Dentelle Blanche', 'bralette-dentelle-blanche', 'Bralette sans armatures en dentelle florale', 7000, 30, '90% Polyamide, 10% Élasthanne', 'confort', true, true);

-- Catégorie: Culottes
INSERT INTO public.products (title, slug, short_description, price, stock, composition, style, is_active)
VALUES 
  ('Culotte Taille Haute Noire', 'culotte-taille-haute-noire', 'Culotte gainante taille haute en microfibre', 4500, 50, '80% Polyamide, 20% Élasthanne', 'classique', true),
  ('String Dentelle Rouge', 'string-dentelle-rouge', 'String sexy en dentelle avec nœud', 3500, 35, '90% Polyamide, 10% Élasthanne', 'sexy', true);

-- Catégorie: Nuisettes
INSERT INTO public.products (title, slug, short_description, price, compare_at_price, stock, composition, style, is_active, is_featured)
VALUES 
  ('Nuisette Satin Bordeaux', 'nuisette-satin-bordeaux', 'Nuisette courte en satin avec bretelles ajustables', 12000, 15000, 20, '100% Polyester', 'elegant', true, true),
  ('Chemise de Nuit Coton', 'chemise-nuit-coton', 'Chemise de nuit longue en coton doux', 9500, NULL, 25, '100% Coton', 'confort', true, false);

-- Catégorie: Pyjamas
INSERT INTO public.products (title, slug, short_description, price, stock, composition, style, is_active)
VALUES 
  ('Pyjama Short Imprimé', 'pyjama-short-imprime', 'Ensemble pyjama short et débardeur imprimé fleuri', 11000, 30, '95% Coton, 5% Élasthanne', 'confort', true),
  ('Pyjama Satin Rose Poudré', 'pyjama-satin-rose-poudre', 'Ensemble pyjama pantalon et chemise en satin', 16000, 18, '100% Polyester', 'elegant', true);

-- Catégorie: Accessoires
INSERT INTO public.products (title, slug, short_description, price, stock, composition, style, is_active)
VALUES 
  ('Porte-jarretelles Noir', 'porte-jarretelles-noir', 'Porte-jarretelles élastique avec clips métalliques', 5500, 15, '85% Polyamide, 15% Élasthanne', 'sexy', true),
  ('Bas Autofixants Nude', 'bas-autofixants-nude', 'Bas autofixants avec bande silicone', 4000, 40, '90% Polyamide, 10% Élasthanne', 'classique', true);

-- =====================================================
-- LIER LES PRODUITS AUX CATÉGORIES
-- =====================================================

-- Récupérer les IDs et créer les relations
-- Tu devras exécuter cette partie après avoir les UUIDs des produits créés

-- Exemple de requête pour lier (à adapter avec les vrais UUIDs):
/*
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
CROSS JOIN public.categories c
WHERE 
  (p.slug = 'ensemble-dentelle-rose' AND c.slug = 'ensembles') OR
  (p.slug = 'ensemble-satin-noir' AND c.slug = 'ensembles') OR
  (p.slug = 'soutien-gorge-pushup-nude' AND c.slug = 'soutiens-gorge') OR
  (p.slug = 'bralette-dentelle-blanche' AND c.slug = 'soutiens-gorge') OR
  (p.slug = 'culotte-taille-haute-noire' AND c.slug = 'culottes') OR
  (p.slug = 'string-dentelle-rouge' AND c.slug = 'culottes') OR
  (p.slug = 'nuisette-satin-bordeaux' AND c.slug = 'nuisettes') OR
  (p.slug = 'chemise-nuit-coton' AND c.slug = 'nuisettes') OR
  (p.slug = 'pyjama-short-imprime' AND c.slug = 'pyjamas') OR
  (p.slug = 'pyjama-satin-rose-poudre' AND c.slug = 'pyjamas') OR
  (p.slug = 'porte-jarretelles-noir' AND c.slug = 'accessoires') OR
  (p.slug = 'bas-autofixants-nude' AND c.slug = 'accessoires');
*/
