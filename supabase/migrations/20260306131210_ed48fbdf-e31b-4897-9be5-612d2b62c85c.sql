
-- Phase 5: Maintenance records
CREATE TABLE public.maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.customer_vehicles(id) ON DELETE CASCADE NOT NULL,
  maintenance_type text NOT NULL,
  last_date timestamptz,
  next_date timestamptz,
  mileage_at_service integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Phase 5: Lubrication plans
CREATE TABLE public.lubrication_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.customer_vehicles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  oil_type_engine text,
  oil_type_gearbox text,
  oil_quantity_engine text,
  oil_quantity_gearbox text,
  change_frequency_km integer,
  change_frequency_months integer,
  reminder_frequency_months integer DEFAULT 6,
  recommended_product_id uuid REFERENCES public.products(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Phase 5: QR codes
CREATE TABLE public.vehicle_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.customer_vehicles(id) ON DELETE CASCADE NOT NULL,
  qr_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_paid boolean DEFAULT false,
  payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lubrication_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_qr_codes ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user owns vehicle
CREATE OR REPLACE FUNCTION public.owns_vehicle(_vehicle_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.customer_vehicles v
    JOIN public.customers c ON c.id = v.customer_id
    WHERE v.id = _vehicle_id AND c.user_id = auth.uid()
  )
$$;

-- RLS: maintenance_records
CREATE POLICY "Customers can read own maintenance" ON public.maintenance_records
  FOR SELECT TO authenticated USING (public.owns_vehicle(vehicle_id));
CREATE POLICY "Customers can insert own maintenance" ON public.maintenance_records
  FOR INSERT TO authenticated WITH CHECK (public.owns_vehicle(vehicle_id));
CREATE POLICY "Customers can update own maintenance" ON public.maintenance_records
  FOR UPDATE TO authenticated USING (public.owns_vehicle(vehicle_id)) WITH CHECK (public.owns_vehicle(vehicle_id));
CREATE POLICY "Customers can delete own maintenance" ON public.maintenance_records
  FOR DELETE TO authenticated USING (public.owns_vehicle(vehicle_id));
CREATE POLICY "Admins can manage maintenance" ON public.maintenance_records
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS: lubrication_plans
CREATE POLICY "Customers can read own lubrication" ON public.lubrication_plans
  FOR SELECT TO authenticated USING (public.owns_vehicle(vehicle_id));
CREATE POLICY "Customers can insert own lubrication" ON public.lubrication_plans
  FOR INSERT TO authenticated WITH CHECK (public.owns_vehicle(vehicle_id));
CREATE POLICY "Customers can update own lubrication" ON public.lubrication_plans
  FOR UPDATE TO authenticated USING (public.owns_vehicle(vehicle_id)) WITH CHECK (public.owns_vehicle(vehicle_id));
CREATE POLICY "Admins can manage lubrication" ON public.lubrication_plans
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS: vehicle_qr_codes
CREATE POLICY "Customers can read own qr codes" ON public.vehicle_qr_codes
  FOR SELECT TO authenticated USING (public.owns_vehicle(vehicle_id));
CREATE POLICY "Customers can insert own qr codes" ON public.vehicle_qr_codes
  FOR INSERT TO authenticated WITH CHECK (public.owns_vehicle(vehicle_id));
CREATE POLICY "Admins can manage qr codes" ON public.vehicle_qr_codes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Public read for QR (by token, no auth needed)
CREATE POLICY "Public can read paid qr by token" ON public.vehicle_qr_codes
  FOR SELECT TO anon USING (is_paid = true);

-- Public read maintenance for QR view
CREATE POLICY "Public can read maintenance via qr" ON public.maintenance_records
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.vehicle_qr_codes qr
      WHERE qr.vehicle_id = maintenance_records.vehicle_id AND qr.is_paid = true
    )
  );
CREATE POLICY "Public can read lubrication via qr" ON public.lubrication_plans
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.vehicle_qr_codes qr
      WHERE qr.vehicle_id = lubrication_plans.vehicle_id AND qr.is_paid = true
    )
  );

-- Triggers
CREATE TRIGGER update_maintenance_records_updated_at
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lubrication_plans_updated_at
  BEFORE UPDATE ON public.lubrication_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
