-- ============================================
-- Script de vérification de la base de données
-- PostgreSQL + Payload CMS
-- ============================================

-- 1. Vérifier toutes les tables existantes
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Compter les enregistrements dans chaque table principale
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL
SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'product_collections', COUNT(*) FROM product_collections
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'newsletter_subscribers', COUNT(*) FROM newsletter_subscribers
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM contact_messages
UNION ALL
SELECT 'shipping_zones', COUNT(*) FROM shipping_zones
UNION ALL
SELECT 'shipping_rates', COUNT(*) FROM shipping_rates
UNION ALL
SELECT 'site_settings', COUNT(*) FROM site_settings
ORDER BY table_name;

-- 3. Vérifier les utilisateurs et leurs rôles
SELECT 
    id,
    email,
    role,
    "createdAt",
    "updatedAt"
FROM users
ORDER BY "createdAt" DESC;

-- 4. Vérifier les produits récents
SELECT 
    id,
    title,
    price,
    stock,
    "_status",
    "createdAt"
FROM products
ORDER BY "createdAt" DESC
LIMIT 10;

-- 5. Vérifier les commandes récentes
SELECT 
    id,
    "orderId",
    total,
    status,
    "paymentStatus",
    "createdAt"
FROM orders
ORDER BY "createdAt" DESC
LIMIT 10;

-- 6. Vérifier les catégories
SELECT 
    id,
    title,
    slug,
    "createdAt"
FROM categories
ORDER BY title;

-- 7. Vérifier l'intégrité des relations
-- Produits avec leurs variantes
SELECT 
    p.id as product_id,
    p.title,
    COUNT(pv.id) as variant_count,
    COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_variants pv ON pv."productId" = p.id
LEFT JOIN product_images pi ON pi."productId" = p.id
GROUP BY p.id, p.title
ORDER BY p.title;

-- Commandes avec leurs items
SELECT 
    o.id as order_id,
    o."orderId",
    o.total,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON oi."orderId" = o.id
GROUP BY o.id, o."orderId", o.total
ORDER BY o."createdAt" DESC
LIMIT 10;

-- 8. Statistiques globales
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM products WHERE "_status" = 'published') as published_products,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT SUM(total) FROM orders WHERE status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM newsletter_subscribers WHERE subscribed = true) as active_subscribers;

-- 9. Vérifier les indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 10. Vérifier la taille des tables
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 11. Vérifier les contraintes de clés étrangères
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 12. Vérifier les migrations Payload
SELECT * FROM payload_migrations
ORDER BY "createdAt" DESC;
