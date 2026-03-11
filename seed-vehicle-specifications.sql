-- Seed vehicle specifications for common vehicles in Benin
-- Adapted for tropical climate (higher viscosity recommendations)

-- TOYOTA (Most popular in Benin)
INSERT INTO public.vehicle_specifications (
  brand, model, year_start, year_end, engine_type,
  oil_type_engine, oil_quantity_engine, recommended_viscosity_tropical,
  oil_type_gearbox, oil_quantity_gearbox,
  coolant_type, brake_fluid_type,
  engine_cleaner, gearbox_cleaner, radiator_cleaner,
  change_frequency_km, change_frequency_months
) VALUES
-- Toyota Corolla
('Toyota', 'Corolla', 2000, 2007, 'Essence', '5W-30', 3.7, '10W-40', '75W-90', 2.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Corolla', 2008, 2013, 'Essence', '5W-30', 4.2, '10W-40', '75W-90', 2.2, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Corolla', 2014, 2019, 'Essence', '0W-20', 4.4, '10W-40', 'ATF WS', 2.5, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Corolla', 2020, 2026, 'Essence', '0W-20', 4.4, '5W-30', 'ATF WS', 2.5, 'Rose G12++', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- Toyota Camry
('Toyota', 'Camry', 2002, 2006, 'Essence', '5W-30', 4.3, '10W-40', '75W-90', 2.8, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Camry', 2007, 2011, 'Essence', '5W-30', 4.4, '10W-40', 'ATF WS', 3.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Camry', 2012, 2017, 'Essence', '0W-20', 4.7, '10W-40', 'ATF WS', 3.2, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Camry', 2018, 2026, 'Essence', '0W-20', 4.8, '5W-30', 'ATF WS', 3.2, 'Rose G12++', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- Toyota RAV4
('Toyota', 'RAV4', 2006, 2012, 'Essence', '5W-30', 4.4, '10W-40', '75W-90', 2.0, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'RAV4', 2013, 2018, 'Essence', '0W-20', 4.7, '10W-40', 'ATF WS', 2.2, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'RAV4', 2019, 2026, 'Essence', '0W-20', 4.8, '5W-30', 'ATF WS', 2.5, 'Rose G12++', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- Toyota Hilux
('Toyota', 'Hilux', 2005, 2015, 'Diesel', '5W-30', 5.5, '15W-40', '75W-90', 2.8, 'Vert G11', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Hilux', 2016, 2026, 'Diesel', '5W-30', 6.1, '15W-40', '75W-90', 3.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

-- Toyota Yaris
('Toyota', 'Yaris', 2006, 2011, 'Essence', '5W-30', 3.7, '10W-40', '75W-90', 1.9, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Yaris', 2012, 2019, 'Essence', '0W-20', 3.9, '10W-40', '75W-90', 2.0, 'Rose G12+', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Toyota', 'Yaris', 2020, 2026, 'Essence', '0W-20', 3.9, '5W-30', 'ATF WS', 2.0, 'Rose G12++', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6)

-- HONDA (Popular in Benin)
,('Honda', 'Accord', 2003, 2007, 'Essence', '5W-20', 4.3, '10W-40', 'ATF Z1', 2.5, 'Vert G11', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'Accord', 2008, 2012, 'Essence', '5W-20', 4.4, '10W-40', 'ATF Z1', 2.8, 'Rose G12', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'Accord', 2013, 2017, 'Essence', '0W-20', 4.5, '5W-30', 'ATF Z1', 3.0, 'Rose G12+', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'Accord', 2018, 2026, 'Essence', '0W-20', 4.6, '5W-30', 'ATF Z1', 3.0, 'Rose G12+', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

('Honda', 'Civic', 2006, 2011, 'Essence', '5W-20', 3.7, '10W-40', 'ATF Z1', 2.0, 'Vert G11', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'Civic', 2012, 2015, 'Essence', '0W-20', 3.9, '5W-30', 'ATF Z1', 2.2, 'Rose G12', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'Civic', 2016, 2021, 'Essence', '0W-20', 4.2, '5W-30', 'ATF Z1', 2.5, 'Rose G12+', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'Civic', 2022, 2026, 'Essence', '0W-20', 4.4, '5W-30', 'ATF Z1', 2.5, 'Rose G12+', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

('Honda', 'CR-V', 2007, 2011, 'Essence', '5W-20', 4.2, '10W-40', 'ATF Z1', 2.4, 'Vert G11', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'CR-V', 2012, 2016, 'Essence', '0W-20', 4.4, '5W-30', 'ATF Z1', 2.6, 'Rose G12', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Honda', 'CR-V', 2017, 2026, 'Essence', '0W-20', 4.7, '5W-30', 'ATF Z1', 2.8, 'Rose G12+', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6)

-- NISSAN (Popular in Benin)
,('Nissan', 'Patrol', 2004, 2010, 'Diesel', '5W-30', 7.8, '15W-40', '75W-90', 3.5, 'Vert G11', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Nissan', 'Patrol', 2011, 2026, 'Diesel', '5W-30', 8.0, '15W-40', '75W-90', 3.8, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

('Nissan', 'Qashqai', 2007, 2013, 'Essence', '5W-30', 4.5, '10W-40', '75W-90', 2.0, 'Vert G11', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Nissan', 'Qashqai', 2014, 2026, 'Essence', '5W-30', 4.8, '10W-40', 'ATF Matic S', 2.2, 'Rose G12', 'DOT 4', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),

('Nissan', 'Sentra', 2007, 2012, 'Essence', '5W-30', 4.0, '10W-40', '75W-90', 2.0, 'Vert G11', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Nissan', 'Sentra', 2013, 2019, 'Essence', '5W-30', 4.3, '10W-40', 'ATF Matic S', 2.2, 'Rose G12', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6),
('Nissan', 'Sentra', 2020, 2026, 'Essence', '0W-20', 4.5, '5W-30', 'ATF Matic S', 2.5, 'Rose G12+', 'DOT 3', 'Bardahl Engine Flush', 'Bardahl Gearbox Flush', 'Bardahl Radiator Flush', 10000, 6)
