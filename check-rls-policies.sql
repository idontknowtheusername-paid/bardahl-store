-- Vérifier les policies RLS qui peuvent bloquer les insertions

-- 1. Vérifier si RLS est activé
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('products', 'product_images', 'product_categories', 'product_collection_items')
AND schemaname = 'public';

-- 2. Lister TOUTES les policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('products', 'product_images', 'product_categories', 'product_collection_items')
ORDER BY tablename, cmd, policyname;

-- 3. Vérifier les policies spécifiques pour INSERT
SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND cmd = 'INSERT'
ORDER BY tablename;
