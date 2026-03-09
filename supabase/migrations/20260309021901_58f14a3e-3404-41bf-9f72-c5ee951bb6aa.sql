-- Drop the foreign key constraint on order_items.product_id so products can be deleted
-- while preserving order history (product_title is already stored in order_items)
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Also drop FK on oil_change_reminders and lubrication_plans for same reason
ALTER TABLE oil_change_reminders DROP CONSTRAINT IF EXISTS oil_change_reminders_product_id_fkey;
ALTER TABLE lubrication_plans DROP CONSTRAINT IF EXISTS lubrication_plans_recommended_product_id_fkey;

-- Update the cascade function to not try to nullify non-nullable columns
CREATE OR REPLACE FUNCTION public.delete_product_cascade(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM product_images WHERE product_id = p_product_id;
  DELETE FROM product_categories WHERE product_id = p_product_id;
  DELETE FROM product_collection_items WHERE product_id = p_product_id;
  DELETE FROM vehicle_product_compatibility WHERE product_id = p_product_id;
  DELETE FROM product_reviews WHERE product_id = p_product_id;
  UPDATE oil_change_reminders SET product_id = NULL WHERE product_id = p_product_id;
  UPDATE lubrication_plans SET recommended_product_id = NULL WHERE recommended_product_id = p_product_id;
  DELETE FROM products WHERE id = p_product_id;
END;
$$;