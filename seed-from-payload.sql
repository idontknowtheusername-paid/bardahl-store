(node:72175) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
(Use `node --trace-warnings ...` to show where the warning was created)
Connected to Payload DB

-- =====================================================
-- CATEGORIES
-- =====================================================

INSERT INTO public.categories (title, slug, description, is_active, created_at, updated_at)
VALUES (
  'Ensembles',
  'ensembles',
  'Ensembles de lingerie coordonnés',
  true,
  '2025-12-25T22:56:28.800Z',
  '2025-12-25T22:56:28.800Z'
);

INSERT INTO public.categories (title, slug, description, is_active, created_at, updated_at)
VALUES (
  'Soutiens-gorge',
  'soutiens-gorge',
  'Soutiens-gorge confortables et élégants',
  true,
  '2025-12-25T22:56:29.217Z',
  '2025-12-25T22:56:29.217Z'
);

INSERT INTO public.categories (title, slug, description, is_active, created_at, updated_at)
VALUES (
  'Culottes',
  'culottes',
  'Culottes et bas de lingerie',
  true,
  '2025-12-25T22:56:29.595Z',
  '2025-12-25T22:56:29.595Z'
);

INSERT INTO public.categories (title, slug, description, is_active, created_at, updated_at)
VALUES (
  'Nuisettes',
  'nuisettes',
  'Nuisettes et chemises de nuit',
  true,
  '2025-12-25T22:56:29.970Z',
  '2025-12-25T22:56:29.970Z'
);

INSERT INTO public.categories (title, slug, description, is_active, created_at, updated_at)
VALUES (
  'Pyjamas',
  'pyjamas',
  'Pyjamas et vêtements de nuit',
  true,
  '2025-12-25T22:56:30.722Z',
  '2025-12-25T22:56:30.723Z'
);

INSERT INTO public.categories (title, slug, description, is_active, created_at, updated_at)
VALUES (
  'Accessoires',
  'accessoires',
  'Accessoires de lingerie',
  true,
  '2025-12-25T22:56:31.098Z',
  '2025-12-25T22:56:31.098Z'
);


-- =====================================================
-- PRODUCT COLLECTIONS
-- =====================================================

Error: relation "product-collections" does not exist
