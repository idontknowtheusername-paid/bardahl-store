-- Script pour créer un utilisateur admin dans Supabase
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- UTILISATEUR CRÉÉ:
-- Email: admin@lingeriestore.com
-- Password: Cannesh2024!Admin
-- UUID: b4d814ba-47d4-4857-9078-fc9331bdbbf3

-- ÉTAPE 1: Ajouter le rôle admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('b4d814ba-47d4-4857-9078-fc9331bdbbf3', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- ÉTAPE 2: Vérifier que ça a fonctionné
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    ur.role,
    ur.created_at as role_assigned_at,
    public.is_admin() as is_admin_check
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@lingeriestore.com';

-- RÉSULTAT ATTENDU:
-- Tu devrais voir une ligne avec role = 'admin'
