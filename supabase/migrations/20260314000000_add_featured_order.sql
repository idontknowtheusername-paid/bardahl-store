-- Add featured_order field to products table for manual control of popular products display
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT NULL;

-- Create index for faster queries on featured products
CREATE INDEX IF NOT EXISTS idx_products_featured_order ON public.products (featured_order ASC NULLS LAST)
WHERE is_active = true AND featured_order IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.products.featured_order IS 'Order for featured/popular products display. Lower numbers appear first. NULL means not manually featured.';
