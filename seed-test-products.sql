-- ============================================
-- SEED: Ajouter 6 produits test par gamme (36 produits au total)
-- ============================================

INSERT INTO products (
  title, slug, description, short_description, price, compare_at_price, 
  stock, sku, is_active, is_new, is_featured, product_type,
  viscosity, capacity, api_norm, acea_norm
) VALUES
-- Huiles Moteur (6 produits)
('Bardahl XTC C60 5W-40', 'bardahl-xtc-c60-5w-40', 'Huile moteur synthétique haute performance avec technologie Polar Plus-Fullerene C60', 'Huile synthétique 5W-40 pour moteurs essence et diesel', 4500000, 5000000, 50, 'HM-001', true, true, true, 'huiles-moteur', '5W-40', '5L', 'API SN Plus', 'ACEA C3'),
('Bardahl XTS 10W-40', 'bardahl-xts-10w-40', 'Huile moteur semi-synthétique pour tous types de moteurs', 'Semi-synthétique 10W-40 polyvalente', 3500000, NULL, 75, 'HM-002', true, false, true, 'huiles-moteur', '10W-40', '4L', 'API SN', 'ACEA A3/B4'),
('Bardahl XTR 0W-30', 'bardahl-xtr-0w-30', 'Huile moteur 100% synthétique pour performances extrêmes', 'Synthétique 0W-30 haute technologie', 5500000, NULL, 30, 'HM-003', true, true, true, 'huiles-moteur', '0W-30', '5L', 'API SP', 'ACEA C2'),
('Bardahl Classic 15W-40', 'bardahl-classic-15w-40', 'Huile moteur minérale pour moteurs anciens', 'Minérale 15W-40 pour véhicules classiques', 2500000, NULL, 100, 'HM-004', true, false, false, 'huiles-moteur', '15W-40', '5L', 'API SN', 'ACEA A3/B4'),
('Bardahl Technos C60 5W-30', 'bardahl-technos-c60-5w-30', 'Huile moteur synthétique avec Fullerene C60', 'Synthétique 5W-30 économie de carburant', 4800000, NULL, 60, 'HM-005', true, false, true, 'huiles-moteur', '5W-30', '5L', 'API SN Plus', 'ACEA C3'),
('Bardahl XTM 20W-50', 'bardahl-xtm-20w-50', 'Huile moteur pour conditions extrêmes', 'Huile 20W-50 pour climats chauds', 3200000, NULL, 45, 'HM-006', true, false, false, 'huiles-moteur', '20W-50', '4L', 'API SN', 'ACEA A3/B4'),

-- Additifs & Traitements (6 produits)
('Bardahl Turbo Protect', 'bardahl-turbo-protect', 'Additif de protection pour turbocompresseurs', 'Protection turbo haute performance', 1500000, NULL, 80, 'AD-001', true, true, true, 'additifs', NULL, '400ml', NULL, NULL),
('Bardahl Engine Flush', 'bardahl-engine-flush', 'Nettoyant moteur avant vidange', 'Décrassage moteur rapide', 1200000, NULL, 100, 'AD-002', true, false, true, 'additifs', NULL, '500ml', NULL, NULL),
('Bardahl Fuel Injector Cleaner', 'bardahl-fuel-injector-cleaner', 'Nettoyant injecteurs essence et diesel', 'Nettoyage système injection', 1000000, NULL, 120, 'AD-003', true, false, true, 'additifs', NULL, '500ml', NULL, NULL),
('Bardahl Octane Booster', 'bardahl-octane-booster', 'Augmente l''indice d''octane du carburant', 'Boost performance moteur essence', 1800000, NULL, 60, 'AD-004', true, true, false, 'additifs', NULL, '250ml', NULL, NULL),
('Bardahl Stop Leak Engine', 'bardahl-stop-leak-engine', 'Colmate les fuites d''huile moteur', 'Anti-fuite moteur efficace', 1400000, NULL, 70, 'AD-005', true, false, false, 'additifs', NULL, '400ml', NULL, NULL),
('Bardahl DPF Cleaner', 'bardahl-dpf-cleaner', 'Nettoyant filtre à particules diesel', 'Régénération FAP', 2000000, NULL, 50, 'AD-006', true, true, true, 'additifs', NULL, '1L', NULL, NULL),

-- Entretien & Nettoyage (6 produits)
('Bardahl Brake Cleaner', 'bardahl-brake-cleaner', 'Nettoyant freins et embrayages', 'Dégraissant freins puissant', 800000, NULL, 150, 'EN-001', true, false, false, 'entretien', NULL, '500ml', NULL, NULL),
('Bardahl Carb Cleaner', 'bardahl-carb-cleaner', 'Nettoyant carburateur et papillon', 'Nettoyage carburateur efficace', 900000, NULL, 100, 'EN-002', true, false, false, 'entretien', NULL, '400ml', NULL, NULL),
('Bardahl Multi-Purpose Cleaner', 'bardahl-multi-purpose-cleaner', 'Dégraissant multi-usages', 'Nettoyant universel atelier', 700000, NULL, 200, 'EN-003', true, false, true, 'entretien', NULL, '1L', NULL, NULL),
('Bardahl Contact Cleaner', 'bardahl-contact-cleaner', 'Nettoyant contacts électriques', 'Nettoyage électronique auto', 1100000, NULL, 80, 'EN-004', true, false, false, 'entretien', NULL, '250ml', NULL, NULL),
('Bardahl Engine Degreaser', 'bardahl-engine-degreaser', 'Dégraissant moteur externe', 'Nettoyage compartiment moteur', 1300000, NULL, 90, 'EN-005', true, true, false, 'entretien', NULL, '1L', NULL, NULL),
('Bardahl Dashboard Polish', 'bardahl-dashboard-polish', 'Polish tableau de bord et plastiques', 'Rénovation plastiques intérieurs', 600000, NULL, 120, 'EN-006', true, false, false, 'entretien', NULL, '500ml', NULL, NULL),

-- Graisses & Lubrifiants (6 produits)
('Bardahl Lithium Grease', 'bardahl-lithium-grease', 'Graisse au lithium multi-usages', 'Graisse universelle haute qualité', 1200000, NULL, 70, 'GR-001', true, false, true, 'graisses', NULL, '400ml', NULL, NULL),
('Bardahl Copper Grease', 'bardahl-copper-grease', 'Graisse cuivrée haute température', 'Anti-grippage haute température', 1500000, NULL, 60, 'GR-002', true, false, false, 'graisses', NULL, '500ml', NULL, NULL),
('Bardahl White Grease', 'bardahl-white-grease', 'Graisse blanche pour plastiques', 'Lubrification plastiques et caoutchoucs', 1000000, NULL, 80, 'GR-003', true, false, false, 'graisses', NULL, '400ml', NULL, NULL),
('Bardahl Chain Lube', 'bardahl-chain-lube', 'Lubrifiant chaînes et câbles', 'Lubrification chaînes longue durée', 900000, NULL, 100, 'GR-004', true, true, true, 'graisses', NULL, '400ml', NULL, NULL),
('Bardahl Silicone Spray', 'bardahl-silicone-spray', 'Spray silicone lubrifiant', 'Lubrifiant silicone multi-usages', 800000, NULL, 120, 'GR-005', true, false, true, 'graisses', NULL, '500ml', NULL, NULL),
('Bardahl PTFE Lubricant', 'bardahl-ptfe-lubricant', 'Lubrifiant PTFE longue durée', 'Lubrification extrême PTFE', 1600000, NULL, 50, 'GR-006', true, true, false, 'graisses', NULL, '400ml', NULL, NULL),

-- Liquides de refroidissement (6 produits)
('Bardahl Coolant G12+', 'bardahl-coolant-g12-plus', 'Liquide de refroidissement G12+ longue durée', 'Antigel G12+ -40°C', 2500000, NULL, 60, 'LR-001', true, false, true, 'liquides', NULL, '5L', NULL, NULL),
('Bardahl Coolant G13', 'bardahl-coolant-g13', 'Liquide de refroidissement G13 écologique', 'Antigel G13 bio -35°C', 2800000, NULL, 50, 'LR-002', true, true, true, 'liquides', NULL, '5L', NULL, NULL),
('Bardahl Coolant Universal', 'bardahl-coolant-universal', 'Liquide de refroidissement universel', 'Antigel universel -30°C', 2000000, NULL, 80, 'LR-003', true, false, false, 'liquides', NULL, '5L', NULL, NULL),
('Bardahl Radiator Flush', 'bardahl-radiator-flush', 'Nettoyant circuit de refroidissement', 'Décrassage radiateur', 1200000, NULL, 70, 'LR-004', true, false, false, 'liquides', NULL, '500ml', NULL, NULL),
('Bardahl Coolant G11', 'bardahl-coolant-g11', 'Liquide de refroidissement G11 classique', 'Antigel G11 -35°C', 1800000, NULL, 90, 'LR-005', true, false, false, 'liquides', NULL, '5L', NULL, NULL),
('Bardahl Coolant Concentrate', 'bardahl-coolant-concentrate', 'Concentré antigel à diluer', 'Antigel concentré -70°C', 3500000, NULL, 40, 'LR-006', true, true, true, 'liquides', NULL, '2L', NULL, NULL),

-- Transmission & Freinage (6 produits)
('Bardahl ATF Dexron VI', 'bardahl-atf-dexron-vi', 'Huile boîte automatique Dexron VI', 'ATF synthétique haute performance', 3500000, NULL, 50, 'TR-001', true, false, true, 'transmission', NULL, '4L', NULL, NULL),
('Bardahl Gear Oil 75W-90', 'bardahl-gear-oil-75w-90', 'Huile de boîte et pont 75W-90', 'Huile transmission GL-5', 2800000, NULL, 60, 'TR-002', true, false, true, 'transmission', '75W-90', '2L', 'API GL-5', NULL),
('Bardahl DOT 4 Brake Fluid', 'bardahl-dot-4-brake-fluid', 'Liquide de frein DOT 4 synthétique', 'Liquide frein haute performance', 1500000, NULL, 100, 'TR-003', true, false, true, 'transmission', NULL, '1L', NULL, NULL),
('Bardahl DOT 5.1 Brake Fluid', 'bardahl-dot-5-1-brake-fluid', 'Liquide de frein DOT 5.1 racing', 'Liquide frein compétition', 2000000, NULL, 60, 'TR-004', true, true, true, 'transmission', NULL, '500ml', NULL, NULL),
('Bardahl Gear Oil 80W-90', 'bardahl-gear-oil-80w-90', 'Huile de pont et différentiel 80W-90', 'Huile pont GL-4/GL-5', 2500000, NULL, 70, 'TR-005', true, false, false, 'transmission', '80W-90', '2L', 'API GL-4', NULL),
('Bardahl CVT Fluid', 'bardahl-cvt-fluid', 'Huile pour boîte CVT', 'Fluide CVT synthétique', 4000000, NULL, 40, 'TR-006', true, true, false, 'transmission', NULL, '4L', NULL, NULL);
