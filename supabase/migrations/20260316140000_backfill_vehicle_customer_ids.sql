-- Remplir rétroactivement les vehicle_id et customer_id manquants
-- pour les reminders créés avant la migration

-- Stratégie: matcher par customer_phone + brand/model pour éviter les ambiguïtés
-- 1. D'abord, matcher par phone + brand/model (plus précis)
UPDATE oil_change_reminders r
SET 
  vehicle_id = cv.id,
  customer_id = cv.customer_id,
  updated_at = NOW()
FROM customer_vehicles cv
JOIN customers c ON cv.customer_id = c.id
WHERE r.vehicle_id IS NULL
  AND r.vehicle_brand IS NOT NULL
  AND r.vehicle_model IS NOT NULL
  AND r.customer_phone IS NOT NULL
  AND LOWER(cv.brand) = LOWER(r.vehicle_brand)
  AND LOWER(cv.model) = LOWER(r.vehicle_model)
  AND REPLACE(REPLACE(REPLACE(REPLACE(c.phone, ' ', ''), '+', ''), '-', ''), '(', '') = 
      REPLACE(REPLACE(REPLACE(REPLACE(r.customer_phone, ' ', ''), '+', ''), '-', ''), '(', '');

-- 2. Pour les reminders restants sans vehicle_id, matcher par customer_email + brand/model
UPDATE oil_change_reminders r
SET 
  vehicle_id = cv.id,
  customer_id = cv.customer_id,
  updated_at = NOW()
FROM customer_vehicles cv
JOIN customers c ON cv.customer_id = c.id
WHERE r.vehicle_id IS NULL
  AND r.vehicle_brand IS NOT NULL
  AND r.vehicle_model IS NOT NULL
  AND r.customer_email IS NOT NULL
  AND LOWER(cv.brand) = LOWER(r.vehicle_brand)
  AND LOWER(cv.model) = LOWER(r.vehicle_model)
  AND LOWER(c.email) = LOWER(r.customer_email);
