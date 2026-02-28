
-- Fix the SECURITY DEFINER VIEW issue
DROP VIEW IF EXISTS public.public_site_settings;
CREATE OR REPLACE VIEW public.public_site_settings 
WITH (security_invoker = true)
AS
SELECT id, site_name, site_description, currency, contact_email, contact_phone, 
       whatsapp_number, facebook_url, instagram_url, twitter_url, tiktok_url,
       announcement_bar, maintenance_mode, minimum_order_amount, created_at, updated_at
FROM public.site_settings;
