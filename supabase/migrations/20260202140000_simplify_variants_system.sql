-- Migration: Simplifier le système de variantes
-- Au lieu de combinaisons, on stocke juste les listes disponibles

-- Ajouter les colonnes pour les listes simples
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS available_colors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS available_sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS available_cup_sizes TEXT[] DEFAULT NULL;

-- Commenter les colonnes pour documentation
COMMENT ON COLUMN public.products.available_colors IS 'Liste des couleurs disponibles au format [{name: "Noir", hex: "#000000"}]';
COMMENT ON COLUMN public.products.available_sizes IS 'Liste des tailles disponibles ["S", "M", "L"]';
COMMENT ON COLUMN public.products.available_cup_sizes IS 'Liste des bonnets disponibles ["A", "B", "C"] - NULL si non applicable';

-- Migrer les données existantes depuis product_variants vers products
-- (si des variantes existent déjà)
UPDATE public.products p
SET 
  available_colors = (
    SELECT COALESCE(jsonb_agg(DISTINCT jsonb_build_object('name', pv.color, 'hex', pv.color_code)), '[]'::jsonb)
    FROM public.product_variants pv
    WHERE pv.product_id = p.id AND pv.color IS NOT NULL
  ),
  available_sizes = (
    SELECT COALESCE(array_agg(DISTINCT pv.size ORDER BY pv.size), ARRAY[]::TEXT[])
    FROM public.product_variants pv
    WHERE pv.product_id = p.id AND pv.size IS NOT NULL
  ),
  available_cup_sizes = (
    SELECT CASE 
      WHEN COUNT(DISTINCT pv.cup_size) > 0 
      THEN array_agg(DISTINCT pv.cup_size ORDER BY pv.cup_size)
      ELSE NULL 
    END
    FROM public.product_variants pv
    WHERE pv.product_id = p.id AND pv.cup_size IS NOT NULL
  )
WHERE p.enable_variants = true;

-- Ajouter des valeurs par défaut pour les produits sans variantes
UPDATE public.products
SET 
  available_colors = '[{"name": "Noir", "hex": "#000000"}]'::jsonb,
  available_sizes = ARRAY['S', 'M', 'L']
WHERE available_colors = '[]'::jsonb OR available_colors IS NULL;

-- On garde la table product_variants mais on la vide (comme demandé)
-- Elle pourra servir plus tard si besoin
TRUNCATE TABLE public.product_variants;

-- Supprimer le flag enable_variants (plus nécessaire)
-- Maintenant on détecte automatiquement si available_colors/sizes sont remplis
-- ALTER TABLE public.products DROP COLUMN IF EXISTS enable_variants;
-- On le garde finalement au cas où, mais il ne sera plus utilisé
