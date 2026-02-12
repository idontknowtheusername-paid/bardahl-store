-- =====================================================
-- CANNESH LINGERIE - COMPLETE SUPABASE MIGRATION
-- E-commerce schema with RLS policies
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.contact_status AS ENUM ('new', 'in_progress', 'replied', 'closed');
CREATE TYPE public.newsletter_status AS ENUM ('active', 'unsubscribed', 'bounced');
CREATE TYPE public.newsletter_source AS ENUM ('website', 'checkout', 'manual', 'import');
CREATE TYPE public.product_style AS ENUM ('classique', 'sexy', 'sport', 'confort', 'elegant');

-- =====================================================
-- USER ROLES TABLE (CRITICAL FOR SECURITY)
-- =====================================================

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_active ON public.categories(is_active);
CREATE INDEX idx_categories_order ON public.categories(display_order);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCT COLLECTIONS TABLE
-- =====================================================

CREATE TABLE public.product_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_collections_slug ON public.product_collections(slug);
CREATE INDEX idx_collections_active ON public.product_collections(is_active);
CREATE INDEX idx_collections_featured ON public.product_collections(is_featured);

ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description JSONB, -- Rich text content
    price INTEGER NOT NULL, -- Price in FCFA (integer)
    compare_at_price INTEGER, -- Original/crossed price
    sku TEXT UNIQUE,
    stock INTEGER DEFAULT 0,
    composition TEXT,
    care_instructions TEXT,
    style product_style DEFAULT 'classique',
    is_active BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    enable_variants BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    meta_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_new ON public.products(is_new) WHERE is_new = true;
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_created ON public.products(created_at DESC);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCT IMAGES TABLE
-- =====================================================

CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_images_order ON public.product_images(product_id, display_order);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCT VARIANTS TABLE
-- =====================================================

CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    size TEXT,
    color TEXT,
    color_code TEXT, -- Hex color
    cup_size TEXT,
    stock INTEGER DEFAULT 0,
    additional_price INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_size ON public.product_variants(size);
CREATE INDEX idx_product_variants_color ON public.product_variants(color);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCT CATEGORIES JUNCTION TABLE
-- =====================================================

CREATE TABLE public.product_categories (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_category ON public.product_categories(category_id);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCT COLLECTIONS JUNCTION TABLE
-- =====================================================

CREATE TABLE public.product_collection_items (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    collection_id UUID REFERENCES public.product_collections(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX idx_product_collection_items_collection ON public.product_collection_items(collection_id);

ALTER TABLE public.product_collection_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RELATED PRODUCTS TABLE
-- =====================================================

CREATE TABLE public.related_products (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    related_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (product_id, related_product_id),
    CHECK (product_id != related_product_id)
);

ALTER TABLE public.related_products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SHIPPING ZONES TABLE
-- =====================================================

CREATE TABLE public.shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    countries TEXT[] DEFAULT ARRAY['Bénin'],
    cities TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SHIPPING RATES TABLE
-- =====================================================

CREATE TABLE public.shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipping_zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in FCFA
    free_shipping_threshold INTEGER, -- Free shipping above this amount
    min_order_amount INTEGER,
    delivery_time TEXT, -- e.g., "2-3 jours ouvrés"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipping_rates_zone ON public.shipping_rates(shipping_zone_id);
CREATE INDEX idx_shipping_rates_active ON public.shipping_rates(is_active);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ORDERS TABLE
-- =====================================================

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for guest checkout
    
    -- Shipping Info
    shipping_first_name TEXT NOT NULL,
    shipping_last_name TEXT,
    shipping_email TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT NOT NULL,
    shipping_postal_code TEXT,
    shipping_country TEXT DEFAULT 'Bénin',
    
    -- Billing Info (optional)
    use_different_billing BOOLEAN DEFAULT false,
    billing_first_name TEXT,
    billing_last_name TEXT,
    billing_address TEXT,
    billing_city TEXT,
    billing_country TEXT,
    
    -- Totals
    subtotal INTEGER NOT NULL,
    shipping_cost INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    
    -- Shipping method
    shipping_rate_id UUID REFERENCES public.shipping_rates(id),
    
    -- Notes
    customer_note TEXT,
    admin_note TEXT,
    
    -- Status
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method TEXT,
    payment_gateway_id TEXT,
    payment_transaction_id TEXT,
    
    -- Tracking
    tracking_number TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_email ON public.orders(shipping_email);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL, -- Snapshot
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL, -- Price in FCFA at time of order
    size TEXT,
    color TEXT,
    cup_size TEXT,
    image_url TEXT -- Snapshot of product image
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================

CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status newsletter_status DEFAULT 'active',
    source newsletter_source DEFAULT 'website',
    subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{"newArrivals": true, "promotions": true, "tips": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON public.newsletter_subscribers(status);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================

CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status contact_status DEFAULT 'new',
    admin_reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_status ON public.contact_messages(status);
CREATE INDEX idx_contact_created ON public.contact_messages(created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SITE SETTINGS TABLE (singleton-like)
-- =====================================================

CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT DEFAULT 'Cannesh Lingerie',
    site_description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    whatsapp_number TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    tiktok_url TEXT,
    currency TEXT DEFAULT 'FCFA',
    minimum_order_amount INTEGER DEFAULT 0,
    maintenance_mode BOOLEAN DEFAULT false,
    announcement_bar TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.product_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON public.shipping_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON public.shipping_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- GENERATE ORDER NUMBER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'CMD-' || upper(to_char(now(), 'YYYYMMDD')) || '-' || upper(substr(md5(random()::text), 1, 6));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- User Roles Policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- Categories Policies (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all categories" ON public.categories FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin());

-- Collections Policies (public read, admin write)
CREATE POLICY "Anyone can view active collections" ON public.product_collections FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all collections" ON public.product_collections FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert collections" ON public.product_collections FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update collections" ON public.product_collections FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete collections" ON public.product_collections FOR DELETE USING (public.is_admin());

-- Products Policies (public read, admin write)
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

-- Product Images Policies
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (public.is_admin());

-- Product Variants Policies
CREATE POLICY "Anyone can view product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variants" ON public.product_variants FOR ALL USING (public.is_admin());

-- Product Categories Junction Policies
CREATE POLICY "Anyone can view product categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage product categories" ON public.product_categories FOR ALL USING (public.is_admin());

-- Product Collection Items Policies
CREATE POLICY "Anyone can view product collection items" ON public.product_collection_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage product collection items" ON public.product_collection_items FOR ALL USING (public.is_admin());

-- Related Products Policies
CREATE POLICY "Anyone can view related products" ON public.related_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage related products" ON public.related_products FOR ALL USING (public.is_admin());

-- Shipping Zones Policies
CREATE POLICY "Anyone can view active shipping zones" ON public.shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage shipping zones" ON public.shipping_zones FOR ALL USING (public.is_admin());

-- Shipping Rates Policies
CREATE POLICY "Anyone can view active shipping rates" ON public.shipping_rates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage shipping rates" ON public.shipping_rates FOR ALL USING (public.is_admin());

-- Orders Policies (guests can create, customers see their own, admins see all)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT USING (
    shipping_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR customer_id = auth.uid()
    OR public.is_admin()
);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());

-- Order Items Policies
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = order_id 
        AND (
            o.shipping_email = current_setting('request.jwt.claims', true)::json->>'email'
            OR o.customer_id = auth.uid()
            OR public.is_admin()
        )
    )
);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Newsletter Policies (anyone can subscribe, admins manage)
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Subscribers can view their own subscription" ON public.newsletter_subscribers FOR SELECT USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR public.is_admin()
);
CREATE POLICY "Subscribers can update their subscription" ON public.newsletter_subscribers FOR UPDATE USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR public.is_admin()
);
CREATE POLICY "Admins can delete subscriptions" ON public.newsletter_subscribers FOR DELETE USING (public.is_admin());

-- Contact Messages Policies (anyone can create, admins manage)
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE USING (public.is_admin());

-- Site Settings Policies
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- =====================================================
-- INSERT DEFAULT SITE SETTINGS
-- =====================================================

INSERT INTO public.site_settings (
    site_name,
    site_description,
    currency,
    minimum_order_amount
) VALUES (
    'Cannesh Lingerie',
    'Boutique de lingerie fine au Bénin',
    'FCFA',
    0
);

-- =====================================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for products bucket
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND public.is_admin());
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND public.is_admin());
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND public.is_admin());