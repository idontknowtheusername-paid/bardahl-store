CREATE TABLE IF NOT EXISTS public.vehicle_specifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  year_start integer,
  year_end integer,
  engine_type text,
  oil_type_engine text,
  oil_quantity_engine text,
  recommended_viscosity_tropical text,
  oil_type_gearbox text,
  oil_quantity_gearbox text,
  coolant_type text,
  brake_fluid_type text,
  engine_cleaner text,
  gearbox_cleaner text,
  radiator_cleaner text,
  change_frequency_km integer,
  change_frequency_months integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle specifications are publicly readable"
  ON public.vehicle_specifications FOR SELECT
  TO public USING (true);

CREATE POLICY "Admins can manage vehicle specifications"
  ON public.vehicle_specifications FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());