
-- Phase 4: Customers table (linked to auth.users)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone text NOT NULL UNIQUE,
  email text,
  full_name text NOT NULL,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Phase 4: Customer vehicles table
CREATE TABLE public.customer_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  license_plate text NOT NULL UNIQUE,
  brand text,
  model text,
  year integer,
  fuel_type text,
  mileage integer,
  vin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS: customers can read/update their own data
CREATE POLICY "Customers can read own profile" ON public.customers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Customers can update own profile" ON public.customers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS: vehicles - customers can manage their own vehicles
CREATE POLICY "Customers can read own vehicles" ON public.customer_vehicles
  FOR SELECT TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can insert own vehicles" ON public.customer_vehicles
  FOR INSERT TO authenticated
  WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can update own vehicles" ON public.customer_vehicles
  FOR UPDATE TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
  WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can delete own vehicles" ON public.customer_vehicles
  FOR DELETE TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage vehicles" ON public.customer_vehicles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Function to lookup customer by phone or license plate (for login alias)
CREATE OR REPLACE FUNCTION public.lookup_customer_email(identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_email text;
BEGIN
  -- Try phone lookup first
  SELECT c.phone || '@autopassion.local' INTO found_email
  FROM public.customers c
  WHERE c.phone = identifier;
  
  IF found_email IS NOT NULL THEN
    RETURN found_email;
  END IF;

  -- Try license plate lookup
  SELECT c.phone || '@autopassion.local' INTO found_email
  FROM public.customer_vehicles v
  JOIN public.customers c ON c.id = v.customer_id
  WHERE UPPER(REPLACE(REPLACE(v.license_plate, '-', ''), ' ', '')) = UPPER(REPLACE(REPLACE(identifier, '-', ''), ' ', ''));
  
  RETURN found_email;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_vehicles_updated_at
  BEFORE UPDATE ON public.customer_vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
