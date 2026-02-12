-- Update default stock value from 0 to 100
ALTER TABLE public.products 
ALTER COLUMN stock SET DEFAULT 100;

-- Update existing products with stock = 0 to stock = 100
UPDATE public.products 
SET stock = 100 
WHERE stock = 0;
