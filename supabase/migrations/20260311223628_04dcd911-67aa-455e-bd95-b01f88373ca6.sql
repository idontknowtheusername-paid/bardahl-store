ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS admin_validated boolean DEFAULT false;
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS admin_validated_at timestamp with time zone DEFAULT null;
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS admin_validated_by text DEFAULT null;