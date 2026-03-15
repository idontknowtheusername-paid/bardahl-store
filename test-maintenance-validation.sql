-- Test du système de validation de vidange
-- Ce script permet de tester manuellement le système

-- 1. Vérifier l'état actuel des alertes
SELECT 
  id,
  customer_name,
  vehicle_brand,
  vehicle_model,
  next_reminder_date,
  reminder_interval_months,
  alerts_sent,
  is_active,
  updated_at
FROM oil_change_reminders
WHERE customer_email = 'bienvenu082003@gmail.com'
  AND is_active = true;

-- 2. Vérifier les enregistrements de maintenance
SELECT 
  id,
  maintenance_type,
  last_date,
  next_date,
  vehicle_id,
  created_at,
  updated_at
FROM maintenance_records
WHERE vehicle_id IN (
  SELECT id FROM customer_vehicles 
  WHERE customer_id = (
    SELECT id FROM customers WHERE email = 'bienvenu082003@gmail.com'
  )
)
AND maintenance_type = 'Vidange moteur'
ORDER BY created_at DESC;

-- 3. REQUETTE POUR  Déclencher manuellement l'envoi d'alerte (pour test)
SELECT net.http_post(
  url:='https://ybjvncrqhcrsoijtxawp.supabase.co/functions/v1/oil-change-reminder',
  headers:='{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlianZuY3JxaGNyc29panR4YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjM4NTMsImV4cCI6MjA4NjU5OTg1M30.5RLQSwULOFMFjhv1GwLfBMtllsZ1ubMbDZri_Hir8F8", "Content-Type": "application/json"}'::jsonb,
  body:='{}'::jsonb
);

-- 4. Simuler une date passée pour tester la bannière (ATTENTION: modifie les données)
-- Décommenter pour tester
/*
UPDATE maintenance_records
SET next_date = '2026-03-14'  -- Date dans le passé
WHERE vehicle_id IN (
  SELECT id FROM customer_vehicles 
  WHERE customer_id = (
    SELECT id FROM customers WHERE email = 'bienvenu082003@gmail.com'
  )
)
AND maintenance_type = 'Vidange moteur';
*/

-- 5. Réinitialiser à la date normale après test
/*
UPDATE maintenance_records
SET next_date = '2026-03-16'
WHERE vehicle_id IN (
  SELECT id FROM customer_vehicles 
  WHERE customer_id = (
    SELECT id FROM customers WHERE email = 'bienvenu082003@gmail.com'
  )
)
AND maintenance_type = 'Vidange moteur';
*/
