-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index on products title for faster fuzzy search
CREATE INDEX IF NOT EXISTS products_title_trgm_idx ON products USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_description_trgm_idx ON products USING GIN (short_description gin_trgm_ops);

-- Create a function for intelligent product search with fuzzy matching
CREATE OR REPLACE FUNCTION search_products_fuzzy(search_query TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  short_description TEXT,
  price NUMERIC,
  stock INTEGER,
  is_active BOOLEAN,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.short_description,
    p.price,
    p.stock,
    p.is_active,
    GREATEST(
      similarity(p.title, search_query),
      similarity(COALESCE(p.short_description, ''), search_query),
      similarity(COALESCE(p.sku, ''), search_query),
      similarity(COALESCE(p.viscosity, ''), search_query)
    ) as similarity_score
  FROM products p
  WHERE 
    p.is_active = true
    AND (
      p.title ILIKE '%' || search_query || '%'
      OR p.short_description ILIKE '%' || search_query || '%'
      OR p.sku ILIKE '%' || search_query || '%'
      OR p.viscosity ILIKE '%' || search_query || '%'
      OR similarity(p.title, search_query) > 0.3
      OR similarity(COALESCE(p.short_description, ''), search_query) > 0.3
    )
  ORDER BY similarity_score DESC, p.title
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
