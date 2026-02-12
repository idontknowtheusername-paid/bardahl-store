-- =====================================================
-- UPDATE CATEGORIES
-- 1. Rename "Culottes" to "Culottes & Strings"
-- 2. Add new category "Shorts & Boxers"
-- =====================================================

-- Update existing "Culottes" category
UPDATE public.categories
SET 
    title = 'Culottes & Strings',
    description = 'Culottes, strings et bas de lingerie',
    updated_at = now()
WHERE slug = 'culottes';

-- Insert new "Shorts & Boxers" category
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
