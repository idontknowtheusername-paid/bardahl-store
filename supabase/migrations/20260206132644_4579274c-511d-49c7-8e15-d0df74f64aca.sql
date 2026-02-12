
-- Update category titles and descriptions (keeping existing slugs to preserve URLs)
-- 1. Ensembles → Ensembles & Combinaison
UPDATE public.categories SET 
  title = 'Ensembles & Combinaison', 
  description = 'Ensembles de lingerie coordonnés et combinaisons',
  display_order = 1,
  updated_at = now()
WHERE slug = 'ensembles';

-- 2. Soutiens-gorge (reste identique, just update order)
UPDATE public.categories SET 
  display_order = 2,
  updated_at = now()
WHERE slug = 'soutiens-gorge';

-- 3. Culottes & Strings (reste identique, just update order)
UPDATE public.categories SET 
  display_order = 3,
  updated_at = now()
WHERE slug = 'culottes';

-- 4. Nuisettes → Nuisettes & Pyjamas
UPDATE public.categories SET 
  title = 'Nuisettes & Pyjamas',
  description = 'Nuisettes, pyjamas et vêtements de nuit',
  display_order = 4,
  updated_at = now()
WHERE slug = 'nuisettes';

-- 5. Pyjamas → Crop-top & Bodysuits
UPDATE public.categories SET 
  title = 'Crop-top & Bodysuits',
  description = 'Crop-tops, bodysuits et hauts tendance',
  display_order = 5,
  updated_at = now()
WHERE slug = 'pyjamas';

-- 6. Accessoires → Accessoires & Cosmétique
UPDATE public.categories SET 
  title = 'Accessoires & Cosmétique',
  description = 'Accessoires de lingerie et cosmétiques beauté',
  display_order = 6,
  updated_at = now()
WHERE slug = 'accessoires';

-- 7. Shorts & Boxers → Shorts & Collants
UPDATE public.categories SET 
  title = 'Shorts & Collants',
  description = 'Shorts, collants et bas de contention',
  display_order = 7,
  updated_at = now()
WHERE slug = 'shorts-boxers';

-- 8. Add new category "Autres" with slug "autres"
INSERT INTO public.categories (
  title,
  slug,
  description,
  display_order,
  is_active
) VALUES (
  'Autres',
  'autres',
  'Autres articles et produits divers',
  8,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = now();
