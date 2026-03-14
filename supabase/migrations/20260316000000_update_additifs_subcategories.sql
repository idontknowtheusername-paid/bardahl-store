-- Update additifs subcategories names and slugs
-- This migration updates the subcategories under "Additifs & Traitements"

-- Update the subcategories
UPDATE categories 
SET 
  slug = 'additifs-carburant',
  title = 'Additifs carburant'
WHERE slug = 'additif-essence';

UPDATE categories 
SET 
  slug = 'additifs-moteur',
  title = 'Additifs moteur'
WHERE slug = 'additif-diesel';

UPDATE categories 
SET 
  slug = 'autres-additifs',
  title = 'Autres additifs & traitements'
WHERE slug = 'additif-moteur';
