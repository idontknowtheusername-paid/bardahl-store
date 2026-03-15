-- Vérifier si la table product_packs existe et contient des données

-- 1. Vérifier l'existence de la table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'product_packs'
) AS table_exists;

-- 2. Compter les packs
SELECT COUNT(*) AS total_packs FROM public.product_packs;

-- 3. Lister tous les packs
SELECT 
  id,
  name,
  slug,
  description,
  discount_type,
  discount_value,
  is_active,
  created_at
FROM public.product_packs
ORDER BY created_at DESC;

-- 4. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS "Condition USING",
  with_check AS "Condition WITH CHECK"
FROM pg_policies 
WHERE tablename = 'product_packs'
ORDER BY policyname;

-- 5. Vérifier si tu es admin (exécute en tant qu'utilisateur connecté)
SELECT public.is_admin() AS am_i_admin;
