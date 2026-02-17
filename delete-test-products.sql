-- ============================================
-- DELETE: Supprimer tous les produits test
-- ============================================

-- Supprimer d'abord les order_items qui référencent ces produits
DELETE FROM order_items 
WHERE product_id IN (
  SELECT id FROM products 
  WHERE sku IN (
    -- Huiles Moteur
    'HM-001', 'HM-002', 'HM-003', 'HM-004', 'HM-005', 'HM-006',
    -- Additifs
    'AD-001', 'AD-002', 'AD-003', 'AD-004', 'AD-005', 'AD-006',
    -- Entretien
    'EN-001', 'EN-002', 'EN-003', 'EN-004', 'EN-005', 'EN-006',
    -- Graisses
    'GR-001', 'GR-002', 'GR-003', 'GR-004', 'GR-005', 'GR-006',
    -- Liquides
    'LR-001', 'LR-002', 'LR-003', 'LR-004', 'LR-005', 'LR-006',
    -- Transmission
    'TR-001', 'TR-002', 'TR-003', 'TR-004', 'TR-005', 'TR-006'
  )
);

-- Supprimer par SKU (tous les produits test ont des SKU spécifiques)
DELETE FROM products 
WHERE sku IN (
  -- Huiles Moteur
  'HM-001', 'HM-002', 'HM-003', 'HM-004', 'HM-005', 'HM-006',
  -- Additifs
  'AD-001', 'AD-002', 'AD-003', 'AD-004', 'AD-005', 'AD-006',
  -- Entretien
  'EN-001', 'EN-002', 'EN-003', 'EN-004', 'EN-005', 'EN-006',
  -- Graisses
  'GR-001', 'GR-002', 'GR-003', 'GR-004', 'GR-005', 'GR-006',
  -- Liquides
  'LR-001', 'LR-002', 'LR-003', 'LR-004', 'LR-005', 'LR-006',
  -- Transmission
  'TR-001', 'TR-002', 'TR-003', 'TR-004', 'TR-005', 'TR-006'
);

-- Vérifier le nombre de produits supprimés
-- SELECT COUNT(*) as deleted_count FROM products WHERE sku LIKE 'HM-%' OR sku LIKE 'AD-%' OR sku LIKE 'EN-%' OR sku LIKE 'GR-%' OR sku LIKE 'LR-%' OR sku LIKE 'TR-%';
