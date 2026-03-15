-- Link existing orders to customer profiles based on phone number
-- This migration updates old orders that were created before customer_profile_id was added

-- Update orders with matching phone numbers
UPDATE public.orders o
SET customer_profile_id = c.id
FROM public.customers c
WHERE o.customer_profile_id IS NULL
  AND o.customer_phone IS NOT NULL
  AND (
    -- Exact match
    REPLACE(REPLACE(REPLACE(REPLACE(o.customer_phone, ' ', ''), '+', ''), '-', ''), '(', '') = 
    REPLACE(REPLACE(REPLACE(REPLACE(c.phone, ' ', ''), '+', ''), '-', ''), '(', '')
    OR
    -- Phone ends with customer phone (handles country code variations)
    REPLACE(REPLACE(REPLACE(REPLACE(o.customer_phone, ' ', ''), '+', ''), '-', ''), '(', '') LIKE 
    '%' || REPLACE(REPLACE(REPLACE(REPLACE(c.phone, ' ', ''), '+', ''), '-', ''), '(', '')
    OR
    -- Customer phone ends with order phone
    REPLACE(REPLACE(REPLACE(REPLACE(c.phone, ' ', ''), '+', ''), '-', ''), '(', '') LIKE 
    '%' || REPLACE(REPLACE(REPLACE(REPLACE(o.customer_phone, ' ', ''), '+', ''), '-', ''), '(', '')
  );

-- Log the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM public.orders
  WHERE customer_profile_id IS NOT NULL;
  
  RAISE NOTICE 'Linked % orders to customer profiles', updated_count;
END $$;
