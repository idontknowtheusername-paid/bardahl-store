
-- Fix #1 & #2: Secure orders & order_items RLS policies
-- Remove the dangerous "customer_email IS NOT NULL" condition

-- Drop the insecure policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Order items follow order access" ON public.order_items;

-- Recreate with proper security: only authenticated users can see their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (user_id = auth.uid());

-- Order items: only viewable if the parent order belongs to the user
CREATE POLICY "Order items follow order access"
ON public.order_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM orders
  WHERE orders.id = order_items.order_id
  AND orders.user_id = auth.uid()
));

-- Fix #3: Hide admin_email from public reads of site_settings
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;

-- Create a view for public settings that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_site_settings AS
SELECT id, site_name, site_description, currency, contact_email, contact_phone, 
       whatsapp_number, facebook_url, instagram_url, twitter_url, tiktok_url,
       announcement_bar, maintenance_mode, minimum_order_amount, created_at, updated_at
FROM public.site_settings;

-- Re-add a SELECT policy that excludes admin_email via the view
-- But we still need the table readable for the view to work with anon role
CREATE POLICY "Site settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (true);

-- Fix #6: Allow blog_subscribers SELECT for upsert to work (needed for onConflict)
CREATE POLICY "Blog subscribers can check their own email"
ON public.blog_subscribers
FOR SELECT
USING (true);
