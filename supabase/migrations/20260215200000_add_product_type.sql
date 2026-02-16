-- Add product_type column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type TEXT;

-- Update existing products based on their categories
UPDATE public.products p
SET product_type = (
  SELECT c.slug 
  FROM public.categories c
  JOIN public.product_categories pc ON pc.category_id = c.id
  WHERE pc.product_id = p.id
  LIMIT 1
)
WHERE product_type IS NULL;

-- Set default for new products
ALTER TABLE public.products 
ALTER COLUMN product_type SET DEFAULT 'huile-moteur';
