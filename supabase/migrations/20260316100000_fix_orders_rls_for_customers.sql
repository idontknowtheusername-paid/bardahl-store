-- Fix RLS policies for orders table to allow customers to view their orders by phone
-- This allows the CustomerHistory page to work for authenticated customers

-- Drop the existing SELECT policy that only allows auth.uid()
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create new SELECT policy that allows:
-- 1. Admins to see all orders (via is_admin())
-- 2. Authenticated Supabase users to see their own orders (via auth.uid())
-- 3. Public access for customer portal (customer_phone IS NOT NULL)
--    The app will filter by phone number on the client side
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  -- Admins can see all
  public.is_admin()
  OR
  -- Authenticated Supabase users can see their own
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Public access for customer portal (filtered by app logic)
  -- This allows CustomerHistory page to work
  customer_phone IS NOT NULL
);

-- Ensure order_items can be read publicly (needed for CustomerHistory)
DROP POLICY IF EXISTS "Anyone can read order items" ON public.order_items;
CREATE POLICY "Anyone can read order items"
ON public.order_items
FOR SELECT
USING (true);
