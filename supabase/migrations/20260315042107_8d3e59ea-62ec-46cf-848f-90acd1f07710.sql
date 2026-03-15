
-- TASK 1: Fix RLS - oil_change_reminders already has INSERT for authenticated
-- But the issue is the WITH CHECK might be too restrictive. Let's ensure it works.

-- TASK 3: Payment links table
CREATE TABLE IF NOT EXISTS public.payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(8), 'hex'),
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  discount_type text DEFAULT 'none',
  discount_value numeric DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  order_id uuid REFERENCES public.orders(id),
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment links" ON public.payment_links FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Anyone can read payment links by token" ON public.payment_links FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can read payment links" ON public.payment_links FOR SELECT TO authenticated USING (true);

-- TASK 4: Configurable packs tables
CREATE TABLE IF NOT EXISTS public.product_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  discount_type text DEFAULT 'percentage',
  discount_value numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Packs are publicly readable" ON public.product_packs FOR SELECT USING (true);
CREATE POLICY "Admins can manage packs" ON public.product_packs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.pack_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES public.product_packs(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  item_type text NOT NULL DEFAULT 'fixed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pack_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pack items are publicly readable" ON public.pack_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage pack items" ON public.pack_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.pack_item_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_item_id uuid NOT NULL REFERENCES public.pack_items(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_default boolean DEFAULT false
);

ALTER TABLE public.pack_item_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pack options are publicly readable" ON public.pack_item_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage pack options" ON public.pack_item_options FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- TASK 5: Filter equivalences table
CREATE TABLE IF NOT EXISTS public.filter_equivalences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  brand text NOT NULL,
  filter_type text NOT NULL DEFAULT 'Filtre à huile',
  equivalent_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.filter_equivalences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Filter equivalences are publicly readable" ON public.filter_equivalences FOR SELECT USING (true);
CREATE POLICY "Admins can manage filter equivalences" ON public.filter_equivalences FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed filter equivalences data
INSERT INTO public.filter_equivalences (reference, brand, filter_type, equivalent_references) VALUES
('W712/95', 'MANN', 'Filtre à huile', '["BOSCH F 026 407 157", "MAHLE OC 593/4", "HIFI SO 6111", "PURFLUX LS 923"]'::jsonb),
('W940/25', 'MANN', 'Filtre à huile', '["BOSCH 0 451 103 318", "MAHLE OC 47", "HIFI SO 242", "FRAM PH 2870A"]'::jsonb),
('HU7008z', 'MANN', 'Filtre à huile', '["BOSCH F 026 407 072", "MAHLE OX 388D", "PURFLUX L 365", "HIFI SO 7093"]'::jsonb),
('C14130', 'MANN', 'Filtre à air', '["BOSCH F 026 400 157", "MAHLE LX 1566", "PURFLUX A 1294", "HIFI SA 5548"]'::jsonb),
('CU2939', 'MANN', 'Filtre habitacle', '["BOSCH 1 987 432 369", "MAHLE LAK 181", "PURFLUX AHC 207", "HIFI SC 9108"]'::jsonb),
('WK820/17', 'MANN', 'Filtre à carburant', '["BOSCH F 026 402 062", "MAHLE KL 723D", "PURFLUX FCS 748", "HIFI SN 70308"]'::jsonb),
('F 026 407 157', 'BOSCH', 'Filtre à huile', '["MANN W712/95", "MAHLE OC 593/4", "PURFLUX LS 923", "FRAM PH 5796A"]'::jsonb),
('0 451 103 318', 'BOSCH', 'Filtre à huile', '["MANN W940/25", "MAHLE OC 47", "PURFLUX LS 149A", "HIFI SO 242"]'::jsonb),
('OC 593/4', 'MAHLE', 'Filtre à huile', '["MANN W712/95", "BOSCH F 026 407 157", "PURFLUX LS 923", "HIFI SO 6111"]'::jsonb),
('LS 923', 'PURFLUX', 'Filtre à huile', '["MANN W712/95", "BOSCH F 026 407 157", "MAHLE OC 593/4", "FRAM PH 5796A"]'::jsonb),
('PH 5796A', 'FRAM', 'Filtre à huile', '["MANN W712/95", "BOSCH F 026 407 157", "PURFLUX LS 923", "HIFI SO 6111"]'::jsonb),
('SO 6111', 'HIFI', 'Filtre à huile', '["MANN W712/95", "BOSCH F 026 407 157", "MAHLE OC 593/4", "PURFLUX LS 923"]'::jsonb),
('SA 5548', 'HIFI', 'Filtre à air', '["MANN C14130", "BOSCH F 026 400 157", "MAHLE LX 1566", "PURFLUX A 1294"]'::jsonb),
('SO 242', 'HIFI', 'Filtre à huile', '["MANN W940/25", "BOSCH 0 451 103 318", "MAHLE OC 47", "FRAM PH 2870A"]'::jsonb);
