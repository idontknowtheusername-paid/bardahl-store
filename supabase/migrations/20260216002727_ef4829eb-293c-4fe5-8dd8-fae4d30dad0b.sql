
-- =============================================
-- 1. STORAGE POLICIES for products bucket
-- =============================================
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- =============================================
-- 2. ADD MISSING COLUMNS TO orders table
-- =============================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_gateway_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_transaction_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_note text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method text;

-- =============================================
-- 3. ADD MISSING COLUMNS TO contact_messages
-- =============================================
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS admin_reply text;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS replied_at timestamptz;

-- =============================================
-- 4. CREATE shipping_zones TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  countries text[],
  cities text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping zones are publicly readable"
ON public.shipping_zones FOR SELECT USING (true);

CREATE POLICY "Admins can manage shipping zones"
ON public.shipping_zones FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================
-- 5. CREATE shipping_rates TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_zone_id uuid REFERENCES public.shipping_zones(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  delivery_time text,
  min_order_amount numeric,
  free_shipping_threshold numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping rates are publicly readable"
ON public.shipping_rates FOR SELECT USING (true);

CREATE POLICY "Admins can manage shipping rates"
ON public.shipping_rates FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================
-- 6. CREATE site_settings TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'Bardahl',
  site_description text,
  announcement_bar text,
  maintenance_mode boolean DEFAULT false,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  currency text DEFAULT 'FCFA',
  minimum_order_amount numeric,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  twitter_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are publicly readable"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================
-- 7. ADD UPDATE TRIGGERS
-- =============================================
CREATE TRIGGER update_shipping_zones_updated_at
BEFORE UPDATE ON public.shipping_zones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_rates_updated_at
BEFORE UPDATE ON public.shipping_rates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 8. ADMIN WRITE POLICIES for existing tables
-- =============================================
-- Products: admins can insert/update/delete
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Product images: admins can manage
CREATE POLICY "Admins can manage product images"
ON public.product_images FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Categories: admins can manage
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Orders: admins can manage
CREATE POLICY "Admins can manage orders"
ON public.orders FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Order items: admins can manage
CREATE POLICY "Admins can manage order items"
ON public.order_items FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Newsletter: admins can manage
CREATE POLICY "Admins can manage newsletter"
ON public.newsletter_subscribers FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Contact messages: admins can manage
CREATE POLICY "Admins can manage contact messages"
ON public.contact_messages FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Blog posts: admins can manage
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Promo codes: admins can manage
CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Product categories: admins can manage
CREATE POLICY "Admins can manage product categories"
ON public.product_categories FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Collections: admins can manage
CREATE POLICY "Admins can manage collections"
ON public.product_collections FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Collection items: admins can manage
CREATE POLICY "Admins can manage collection items"
ON public.product_collection_items FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
