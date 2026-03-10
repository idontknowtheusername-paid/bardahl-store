ALTER TABLE public.lubrication_plans
  ADD COLUMN IF NOT EXISTS coolant_type text,
  ADD COLUMN IF NOT EXISTS brake_fluid_type text,
  ADD COLUMN IF NOT EXISTS engine_cleaner text,
  ADD COLUMN IF NOT EXISTS gearbox_cleaner text,
  ADD COLUMN IF NOT EXISTS radiator_cleaner text;