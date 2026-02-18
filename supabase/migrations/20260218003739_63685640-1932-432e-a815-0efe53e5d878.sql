
-- Create product_reviews table
CREATE TABLE public.product_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "Approved reviews are publicly readable"
ON public.product_reviews FOR SELECT
USING (is_approved = true);

-- Anyone can submit a review
CREATE POLICY "Anyone can submit a review"
ON public.product_reviews FOR INSERT
WITH CHECK (true);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
ON public.product_reviews FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Add admin_email to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS admin_email text;
