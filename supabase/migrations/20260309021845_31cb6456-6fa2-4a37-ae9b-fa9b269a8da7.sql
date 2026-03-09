-- Create a function to safely delete a product and its dependencies
CREATE OR REPLACE FUNCTION public.delete_product_cascade(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete related records (not order_items to preserve order history)
  DELETE FROM product_images WHERE product_id = p_product_id;
  DELETE FROM product_categories WHERE product_id = p_product_id;
  DELETE FROM product_collection_items WHERE product_id = p_product_id;
  DELETE FROM vehicle_product_compatibility WHERE product_id = p_product_id;
  DELETE FROM product_reviews WHERE product_id = p_product_id;
  
  -- Nullify references in order_items and oil_change_reminders
  UPDATE order_items SET product_id = NULL WHERE product_id = p_product_id;
  UPDATE oil_change_reminders SET product_id = NULL WHERE product_id = p_product_id;
  UPDATE lubrication_plans SET recommended_product_id = NULL WHERE recommended_product_id = p_product_id;
  
  -- Finally delete the product
  DELETE FROM products WHERE id = p_product_id;
END;
$$;