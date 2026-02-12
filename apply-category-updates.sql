-- Apply category updates
-- Run this in Supabase SQL Editor

-- 1. Update "Culottes" to "Culottes & Strings"
UPDATE public.categories
SET 
    title = 'Culottes & Strings',
    description = 'Culottes, strings et bas de lingerie',
    updated_at = now()
WHERE slug = 'culottes';

-- 2. Insert new "Shorts & Boxers" category
INSERT INTO public.categories (
    title,
    slug,
    description,
    display_order,
    is_active
) VALUES (
    'Shorts & Boxers',
    'shorts-boxers',
    'Shorts, boxers et sous-vêtements confort',
    7,
    true
);

-- 3. Verify changes
SELECT id, title, slug, description, display_order, is_active
FROM public.categories
ORDER BY display_order;
