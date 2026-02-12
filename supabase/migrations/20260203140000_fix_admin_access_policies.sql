-- Drop existing restrictive policies and add role-based access

-- Products: Admin/Editor can manage, Viewer can read
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;

CREATE POLICY "Admins and editors can manage products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'editor')
    )
  );

CREATE POLICY "Viewers can read products"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text = 'viewer'
    )
  );

CREATE POLICY "Public can read active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Categories: Admin/Editor can manage, Viewer can read
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.categories;

CREATE POLICY "Admins and editors can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'editor')
    )
  );

CREATE POLICY "Viewers can read categories"
  ON public.categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text = 'viewer'
    )
  );

CREATE POLICY "Public can read active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

-- Orders: Admin can manage, Editor/Viewer can read
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.orders;

CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text = 'admin'
    )
  );

CREATE POLICY "Editors and viewers can read orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('editor', 'viewer')
    )
  );

-- Newsletter: Admin/Editor can manage, Viewer can read
DROP POLICY IF EXISTS "Enable read access for all users" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.newsletter_subscribers;

CREATE POLICY "Admins and editors can manage newsletter"
  ON public.newsletter_subscribers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'editor')
    )
  );

CREATE POLICY "Viewers can read newsletter"
  ON public.newsletter_subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text = 'viewer'
    )
  );

-- Promo codes: Admin can manage, Editor/Viewer can read
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Editors and viewers can read promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.promo_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.promo_codes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.promo_codes;

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text = 'admin'
    )
  );

CREATE POLICY "Editors and viewers can read promo codes"
  ON public.promo_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('editor', 'viewer')
    )
  );

-- Contact messages: Admin/Editor can manage, Viewer can read
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.contact_messages;

CREATE POLICY "Admins and editors can manage contact messages"
  ON public.contact_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text IN ('admin', 'editor')
    )
  );

CREATE POLICY "Viewers can read contact messages"
  ON public.contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role::text = 'viewer'
    )
  );

-- User roles: Only admins can manage
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.user_roles;

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role::text = 'admin'
    )
  );

CREATE POLICY "Users can read their own role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());
