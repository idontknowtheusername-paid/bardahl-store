-- Add popularity fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Create index for faster popular products queries
CREATE INDEX IF NOT EXISTS idx_products_popularity ON public.products (sales_count DESC, view_count DESC, click_count DESC)
WHERE is_active = true;

-- Update existing products: set sales_count based on order_items
UPDATE public.products p
SET sales_count = COALESCE((
  SELECT SUM(oi.quantity) 
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  WHERE oi.product_id = p.id 
    AND o.payment_status = 'paid'
    AND o.status NOT IN ('cancelled', 'refunded')
), 0);

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION public.increment_product_view(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products 
  SET view_count = view_count + 1
  WHERE id = product_id;
END;
$$;

-- Create a function to increment click count
CREATE OR REPLACE FUNCTION public.increment_product_click(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products 
  SET click_count = click_count + 1
  WHERE id = product_id;
END;
$$;