-- Fix category images with proper URLs
-- Replace local paths with full URLs

UPDATE public.categories
SET image_url = CASE slug
  WHEN 'ensembles' THEN 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80'
  WHEN 'soutiens-gorge' THEN 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=800&q=80'
  WHEN 'culottes' THEN 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'
  WHEN 'nuisettes' THEN 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80'
  WHEN 'pyjamas' THEN 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80'
  WHEN 'accessoires' THEN 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&q=80'
  WHEN 'shorts-boxers' THEN 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'
  WHEN 'autres' THEN 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80'
  ELSE image_url
END,
updated_at = now()
WHERE slug IN ('ensembles', 'soutiens-gorge', 'culottes', 'nuisettes', 'pyjamas', 'accessoires', 'shorts-boxers', 'autres');

-- Verify the update
SELECT id, title, slug, image_url 
FROM public.categories 
ORDER BY display_order;
