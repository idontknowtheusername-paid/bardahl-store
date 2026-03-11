-- Migration: Alimentation des données véhicules (Standard Bénin/Afrique de l'Ouest)
-- Produits: Bardahl / Climat: Tropical / Fréquence: 10k km ou 6 mois

INSERT INTO public.vehicle_specifications 
(brand, model, year_start, year_end, engine_type, oil_type_engine, oil_quantity_engine, recommended_viscosity_tropical, oil_type_gearbox, oil_quantity_gearbox, coolant_type, brake_fluid_type, engine_cleaner, gearbox_cleaner, radiator_cleaner, change_frequency_km, change_frequency_months)
VALUES 

-- ==========================================
-- TOYOTA (Leader du Marché)
-- ==========================================
-- Corolla
('Toyota', 'Corolla (E120)', 2000, 2007, 'Essence', '5W30', 3.7, '10W40', 'ATF T-IV', 2.0, 'Vert G11', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Corolla (E150)', 2008, 2013, 'Essence', '5W30', 4.2, '10W40', 'ATF WS', 2.2, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Corolla (E170)', 2014, 2019, 'Essence', '5W30', 4.2, '10W40', 'CVT Fluid FE', 3.4, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Corolla (E210)', 2020, 2026, 'Essence', '0W20', 4.4, '5W30', 'CVT Fluid FE', 3.6, 'Rose G12++', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- Camry
('Toyota', 'Camry (XV30)', 2002, 2006, 'Essence', '5W30', 4.3, '10W40', 'ATF T-IV', 2.5, 'Vert G11', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Camry (XV40)', 2007, 2011, 'Essence', '5W20', 4.3, '10W40', 'ATF WS', 2.8, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Camry (XV50)', 2012, 2017, 'Essence', '5W20', 4.4, '10W40', 'ATF WS', 3.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- RAV4
('Toyota', 'RAV4 (XA30)', 2006, 2012, 'Essence', '5W30', 4.3, '10W40', 'ATF WS', 3.5, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'RAV4 (XA40)', 2013, 2018, 'Essence', '0W20', 4.4, '10W40', 'ATF WS', 3.7, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- Utilitaires
('Toyota', 'Hilux (KUN25)', 2005, 2015, 'Diesel', '10W40', 6.9, '15W40', '75W90 GL-5', 2.5, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Hiace', 2005, 2018, 'Diesel', '10W40', 6.5, '15W40', 'ATF Dexron III', 2.4, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- ==========================================
-- HONDA
-- ==========================================
('Honda', 'Accord', 2008, 2012, 'Essence', '0W20', 4.2, '5W30', 'ATF DW-1', 3.2, 'Rose G12', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'CR-V', 2007, 2011, 'Essence', '0W20', 3.7, '5W30', 'ATF DW-1', 3.0, 'Rose G12', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- ==========================================
-- NISSAN (Robustesse 4x4)
-- ==========================================
('Nissan', 'Patrol (Y61)', 2000, 2013, 'Diesel', '10W40', 8.2, '15W40', '75W90 GL-4', 3.8, 'Vert G11', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Nissan', 'Navara (D40)', 2005, 2015, 'Diesel', '5W30', 7.5, '15W40', 'ATF Matic S', 3.5, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- ==========================================
-- PEUGEOT / RENAULT (Héritage Francophone)
-- ==========================================
('Peugeot', '301', 2012, 2020, 'Essence', '5W30', 3.2, '10W40', '75W80 GL-4', 1.9, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Peugeot', '508', 2011, 2018, 'Diesel', '5W30', 5.0, '15W40', 'ATF AW-1', 3.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Renault', 'Duster', 2010, 2017, 'Essence', '5W40', 4.8, '10W40', '75W80 GL-4', 2.5, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- ==========================================
-- MERCEDES / BMW / VW (Prestige)
-- ==========================================
('Mercedes', 'Classe C (W204)', 2007, 2014, 'Essence', '5W30', 5.5, '10W40', 'MB 236.14', 5.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Volkswagen', 'Golf 4', 1998, 2004, 'Essence', '10W40', 4.5, '10W40', '75W90 GL-4', 2.0, 'Vert G11', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Volkswagen', 'Tiguan', 2016, 2024, 'Essence', '5W30', 5.5, '5W30', 'DSG Fluid', 6.0, 'Rose G12++', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- ==========================================
-- HYUNDAI / KIA (La montée en puissance)
-- ==========================================
('Hyundai', 'Elantra', 2011, 2015, 'Essence', '5W30', 4.0, '10W40', 'ATF SP-IV', 3.5, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Hyundai', 'Tucson', 2016, 2020, 'Essence', '5W30', 4.5, '10W40', 'ATF SP-IV', 3.8, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Kia', 'Picanto', 2011, 2017, 'Essence', '5W30', 3.0, '10W40', 'ATF SP-IV', 2.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Kia', 'Sportage', 2016, 2021, 'Essence', '5W30', 4.5, '10W40', 'ATF SP-IV', 3.8, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- ==========================================
-- LUXE & SUV PREMIUM (Très demandés au Bénin/Nigeria)
-- ==========================================
('Lexus', 'RX 330/350', 2004, 2009, 'Essence', '5W30', 4.7, '10W40', 'ATF WS', 3.8, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Lexus', 'RX 350', 2010, 2015, 'Essence', '5W30', 6.1, '10W40', 'ATF WS', 4.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Lexus', 'GX 460', 2010, 2023, 'Essence', '0W20', 7.5, '5W30', 'ATF WS', 4.5, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Land Rover', 'Range Rover Sport', 2005, 2013, 'Diesel', '5W30', 9.5, '15W40', 'ZF Lifeguard 6', 4.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Land Rover', 'Range Rover Vogue', 2014, 2021, 'Diesel', '5W30', 9.5, '10W40', 'ZF Lifeguard 8', 4.5, 'Rose G12++', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Mercedes', 'ML 350 (W164)', 2005, 2011, 'Essence', '5W40', 8.0, '10W40', 'MB 236.14', 4.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Mercedes', 'GLE (W166)', 2015, 2019, 'Essence', '5W30', 7.0, '5W40', 'MB 236.15', 7.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('BMW', 'X5 (E70)', 2007, 2013, 'Essence', '5W30', 6.5, '10W40', 'ZF Lifeguard 6', 5.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('BMW', 'Série 5 (F10)', 2010, 2016, 'Essence', '5W30', 5.5, '10W40', 'ZF Lifeguard 8', 5.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- ==========================================
-- BERLINES & CITADINES COMPLÉMENTAIRES
-- ==========================================
('Toyota', 'Yaris (Belta/Vitz)', 2006, 2012, 'Essence', '5W30', 3.4, '10W40', 'ATF WS', 2.5, 'Vert G11', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Avensis', 2003, 2008, 'Essence', '5W30', 4.2, '10W40', '75W90 GL-4', 1.9, 'Vert G11', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Suzuki', 'Swift', 2017, 2024, 'Essence', '5W30', 3.1, '10W40', 'ATF 3317', 2.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Ford', 'Focus', 2011, 2018, 'Essence', '5W20', 4.1, '5W30', 'Mercon LV', 2.4, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Mazda', '3', 2014, 2018, 'Essence', '0W20', 4.2, '5W30', 'ATF FZ', 3.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Peugeot', '207', 2006, 2012, 'Essence', '5W40', 4.0, '10W40', '75W80 GL-4', 2.0, 'Vert G11', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Peugeot', '3008', 2017, 2024, 'Essence', '5W30', 4.3, '5W30', 'ATF AW-1', 3.0, 'Rose G12++', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Renault', 'Kwid', 2015, 2024, 'Essence', '5W30', 3.0, '10W40', '75W80 GL-4', 1.5, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- ==========================================
-- POIDS LOURDS & LOGISTIQUE (Importants pour le Port)
-- ==========================================
('DAF', 'XF 105', 2006, 2013, 'Diesel', '10W40', 33.0, '15W40', '75W90 GL-5', 12.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 15000, 6),
('Renault Trucks', 'Kerax', 2000, 2013, 'Diesel', '15W40', 36.0, '15W40', '80W90 GL-5', 15.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 15000, 6),
('Sinotruk', 'HOWO 371', 2010, 2022, 'Diesel', '15W40', 28.0, '15W40', '85W140 GL-5', 10.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 15000, 6),

-- ==========================================
-- MODÈLES AMÉRICAINS (Très importés à Cotonou)
-- ==========================================
('Ford', 'Explorer', 2011, 2019, 'Essence', '5W30', 5.7, '10W40', 'Mercon LV', 5.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Dodge', 'Grand Caravan', 2011, 2020, 'Essence', '5W20', 5.6, '10W40', 'ATF +4', 5.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Jeep', 'Grand Cherokee', 2011, 2021, 'Essence', '5W20', 5.7, '10W40', 'ATF +4', 5.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6);
