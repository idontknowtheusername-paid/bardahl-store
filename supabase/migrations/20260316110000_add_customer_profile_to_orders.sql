-- Add customer_profile_id to orders table to link with customers table
-- This allows linking orders to customer profiles (separate from auth.users)

-- Add new column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_profile_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_profile ON public.orders(customer_profile_id);

-- Add comment
COMMENT ON COLUMN public.orders.customer_profile_id IS 'Links order to customer profile (customers table). NULL for guest checkout.';
