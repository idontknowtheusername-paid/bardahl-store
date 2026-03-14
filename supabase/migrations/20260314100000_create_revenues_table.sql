-- Create revenues table for manual revenue entries (offline sales, services, etc.)
CREATE TABLE IF NOT EXISTS public.revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_revenues_date ON public.revenues (date DESC);
CREATE INDEX IF NOT EXISTS idx_revenues_category ON public.revenues (category);

-- Enable RLS
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users (admins) can access revenues
CREATE POLICY "Authenticated users can manage revenues"
  ON public.revenues
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.revenues IS 'Manual revenue entries for offline sales, services, and other income sources';
