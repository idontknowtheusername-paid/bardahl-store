-- Update promo_codes table to support more discount types
ALTER TABLE public.promo_codes 
DROP CONSTRAINT IF EXISTS promo_codes_discount_type_check;

ALTER TABLE public.promo_codes 
DROP CONSTRAINT IF EXISTS promo_codes_discount_value_check;

-- Add new discount types: percentage, fixed_amount, free_shipping, buy_x_get_y
ALTER TABLE public.promo_codes 
ADD CONSTRAINT promo_codes_discount_type_check 
CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'));

-- Allow discount_value to be 0 for free_shipping and buy_x_get_y
ALTER TABLE public.promo_codes 
ADD CONSTRAINT promo_codes_discount_value_check 
CHECK (discount_value >= 0);

-- Add columns for buy_x_get_y functionality
ALTER TABLE public.promo_codes 
ADD COLUMN IF NOT EXISTS buy_quantity INTEGER,
ADD COLUMN IF NOT EXISTS get_quantity INTEGER,
ADD COLUMN IF NOT EXISTS applies_to_product_ids UUID[];

-- Add column for maximum discount amount (useful for percentage discounts)
ALTER TABLE public.promo_codes 
ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10, 2);

-- Update existing 'fixed' type to 'fixed_amount'
UPDATE public.promo_codes 
SET discount_type = 'fixed_amount' 
WHERE discount_type = 'fixed';
