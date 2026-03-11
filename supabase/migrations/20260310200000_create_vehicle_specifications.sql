-- Create vehicle_specifications table for auto-filling lubrication plans
CREATE TABLE IF NOT EXISTS public.vehicle_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  engine_type VARCHAR(20), -- essence, diesel, hybride
  
  -- Moteur
  oil_type_engine VARCHAR(20), -- ex: 5W30, 10W40
  oil_quantity_engine DECIMAL(4,2), -- en litres
  recommended_viscosity_tropical VARCHAR(20), -- ex: 10W40, 20W50 pour climat chaud
  
  -- Boîte de vitesses
  oil_type_gearbox VARCHAR(50),
  oil_quantity_gearbox DECIMAL(4,2),
  
  -- Liquides
  coolant_type VARCHAR(50),
  brake_fluid_type VARCHAR(20),
  
  -- Additifs / Entretien
  engine_cleaner VARCHAR(100),
  gearbox_cleaner VARCHAR(100),
  radiator_cleaner VARCHAR(100),
  
  -- Fréquences
  change_frequency_km INTEGER,
  change_frequency_months INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélérer les recherches par marque/modèle
CREATE INDEX IF NOT EXISTS idx_vehicle_search ON public.vehicle_specifications(brand, model);

-- Enable Row Level Security
ALTER TABLE public.vehicle_specifications ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (everyone can read vehicle specs)
CREATE POLICY "Public read access" ON public.vehicle_specifications 
  FOR SELECT 
  USING (true);

-- Policy: Only authenticated users can insert/update (for admin purposes)
CREATE POLICY "Authenticated users can insert" ON public.vehicle_specifications 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON public.vehicle_specifications 
  FOR UPDATE 
  TO authenticated 
  USING (true);
