
-- =====================================================
-- CATEGORIES
-- =====================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  available_sizes TEXT[] DEFAULT '{}',
  available_cup_sizes TEXT[] DEFAULT '{}',
  available_colors JSONB DEFAULT '[]',
  composition TEXT,
  care_instructions TEXT,
  style TEXT,
  sku TEXT,
  weight NUMERIC,
  viscosity TEXT,
  api_norm TEXT,
  acea_norm TEXT,
  capacity TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);

-- =====================================================
-- PRODUCT IMAGES
-- =====================================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images are publicly readable" ON public.product_images FOR SELECT USING (true);

-- =====================================================
-- PRODUCT CATEGORIES (junction)
-- =====================================================
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(product_id, category_id)
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product categories are publicly readable" ON public.product_categories FOR SELECT USING (true);

-- =====================================================
-- PRODUCT COLLECTIONS
-- =====================================================
CREATE TABLE public.product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collections are publicly readable" ON public.product_collections FOR SELECT USING (true);

-- =====================================================
-- PRODUCT COLLECTION ITEMS (junction)
-- =====================================================
CREATE TABLE public.product_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.product_collections(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER DEFAULT 0,
  UNIQUE(collection_id, product_id)
);
ALTER TABLE public.product_collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collection items are publicly readable" ON public.product_collection_items FOR SELECT USING (true);

-- =====================================================
-- NEWSLETTER SUBSCRIBERS
-- =====================================================
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT DEFAULT 'active',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- =====================================================
-- CONTACT MESSAGES
-- =====================================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- =====================================================
-- PROMO CODES
-- =====================================================
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC,
  max_discount_amount NUMERIC,
  buy_quantity INTEGER,
  get_quantity INTEGER,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promo codes are publicly readable" ON public.promo_codes FOR SELECT USING (is_active = true);

-- =====================================================
-- BLOG POSTS
-- =====================================================
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author TEXT,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published blog posts are publicly readable" ON public.blog_posts FOR SELECT USING (status = 'published');

-- =====================================================
-- BLOG SUBSCRIBERS
-- =====================================================
CREATE TABLE public.blog_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to blog" ON public.blog_subscribers FOR INSERT WITH CHECK (true);

-- =====================================================
-- ORDERS (for checkout)
-- =====================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  promo_code_id UUID REFERENCES public.promo_codes(id),
  shipping_address JSONB,
  billing_address JSONB,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  user_id = auth.uid() OR customer_email IS NOT NULL
);

-- =====================================================
-- ORDER ITEMS
-- =====================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  size TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items follow order access" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.customer_email IS NOT NULL))
);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- =====================================================
-- VEHICLE DATA (for oil selector)
-- =====================================================
CREATE TABLE public.vehicle_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  display_order INTEGER DEFAULT 0
);
ALTER TABLE public.vehicle_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicle brands are publicly readable" ON public.vehicle_brands FOR SELECT USING (true);

CREATE TABLE public.vehicle_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.vehicle_brands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  year_from INTEGER,
  year_to INTEGER
);
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicle models are publicly readable" ON public.vehicle_models FOR SELECT USING (true);

CREATE TABLE public.vehicle_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.vehicle_models(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  fuel_type TEXT,
  displacement TEXT,
  power TEXT
);
ALTER TABLE public.vehicle_engines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicle engines are publicly readable" ON public.vehicle_engines FOR SELECT USING (true);

CREATE TABLE public.vehicle_product_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id UUID REFERENCES public.vehicle_engines(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(engine_id, product_id)
);
ALTER TABLE public.vehicle_product_compatibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Compatibility is publicly readable" ON public.vehicle_product_compatibility FOR SELECT USING (true);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_collections_updated_at BEFORE UPDATE ON public.product_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_is_new ON public.products(is_new);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
