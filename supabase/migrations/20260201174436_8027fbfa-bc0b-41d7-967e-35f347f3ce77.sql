-- =====================================================
-- SECURITY FIXES - Function search_path and RLS policies
-- =====================================================

-- Fix update_updated_at_column function search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix generate_order_number function search_path
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN 'CMD-' || upper(to_char(now(), 'YYYYMMDD')) || '-' || upper(substr(md5(random()::text), 1, 6));
END;
$$;

-- The RLS policies with "true" are intentional for:
-- 1. Orders INSERT - guest checkout needs to create orders without auth
-- 2. Order Items INSERT - guest checkout needs to create order items
-- 3. Newsletter INSERT - anyone can subscribe
-- 4. Contact Messages INSERT - anyone can submit
-- These are expected behaviors for an e-commerce with guest checkout