-- Create first admin user
-- Run this in Supabase SQL Editor

-- 1. First, create the auth user (you'll need to do this via Supabase Dashboard > Authentication > Add User)
-- Email: admin@bardahl.com
-- Password: (set a strong password)
-- Auto Confirm Email: YES

-- 2. Then run this SQL to add the admin role (replace USER_ID with the actual UUID from step 1)
INSERT INTO public.user_roles (user_id, email, full_name, role, is_active)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID from Supabase Auth
  'admin@bardahl.com',
  'Admin Bardahl',
  'admin',
  true
);
