-- Requête pour voir toutes les politiques RLS actuelles sur la table orders

SELECT 
    schemaname AS "Schema",
    tablename AS "Table",
    policyname AS "Nom de la politique",
    permissive AS "Permissive",
    roles AS "Rôles",
    cmd AS "Commande",
    qual AS "Condition USING (brut)",
    with_check AS "Condition WITH CHECK (brut)"
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;
