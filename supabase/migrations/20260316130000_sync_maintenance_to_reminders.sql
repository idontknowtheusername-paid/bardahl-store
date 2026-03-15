-- Synchroniser automatiquement les alertes email avec le carnet d'entretien
-- Quand une vidange est ajoutée/modifiée dans maintenance_records, 
-- mettre à jour automatiquement oil_change_reminders

-- Ajouter les colonnes manquantes pour lier les tables
ALTER TABLE public.oil_change_reminders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.customer_vehicles(id) ON DELETE CASCADE;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_oil_change_reminders_customer ON public.oil_change_reminders(customer_id);
CREATE INDEX IF NOT EXISTS idx_oil_change_reminders_vehicle ON public.oil_change_reminders(vehicle_id);

-- Fonction pour synchroniser les alertes
CREATE OR REPLACE FUNCTION sync_oil_change_reminder()
RETURNS TRIGGER AS $$
DECLARE
  v_vehicle RECORD;
  v_customer RECORD;
  v_reminder_id UUID;
BEGIN
  -- Ne traiter que les vidanges moteur
  IF NEW.maintenance_type != 'Vidange moteur' THEN
    RETURN NEW;
  END IF;

  -- Récupérer les infos du véhicule
  SELECT * INTO v_vehicle
  FROM customer_vehicles
  WHERE id = NEW.vehicle_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Récupérer les infos du client
  SELECT * INTO v_customer
  FROM customers
  WHERE id = v_vehicle.customer_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Vérifier si une alerte existe déjà pour ce véhicule
  SELECT id INTO v_reminder_id
  FROM oil_change_reminders
  WHERE vehicle_id = NEW.vehicle_id
    AND is_active = true;

  IF FOUND THEN
    -- Mettre à jour l'alerte existante SEULEMENT si elle est active
    -- (respecter le choix de l'utilisateur s'il l'a désactivée)
    UPDATE oil_change_reminders
    SET 
      next_reminder_date = NEW.next_date,
      alerts_sent = '{}', -- Reset les alertes envoyées
      updated_at = NOW()
    WHERE id = v_reminder_id
      AND is_active = true; -- Ne pas réactiver si l'utilisateur l'a désactivée
  ELSE
    -- Créer une nouvelle alerte si elle n'existe pas
    INSERT INTO oil_change_reminders (
      customer_id,
      vehicle_id,
      customer_email,
      customer_name,
      customer_phone,
      vehicle_brand,
      vehicle_model,
      next_reminder_date,
      reminder_interval_months,
      is_active,
      alerts_sent,
      alert_preferences
    ) VALUES (
      v_customer.id,
      v_vehicle.id,
      v_customer.email,
      v_customer.full_name,
      v_customer.phone,
      v_vehicle.brand,
      v_vehicle.model,
      NEW.next_date,
      6, -- Intervalle par défaut de 6 mois
      true,
      '{}',
      '{"midpoint": true, "one_week": true, "one_day": true}'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour désactiver l'alerte quand la vidange est supprimée
CREATE OR REPLACE FUNCTION deactivate_oil_change_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne traiter que les vidanges moteur
  IF OLD.maintenance_type != 'Vidange moteur' THEN
    RETURN OLD;
  END IF;

  -- Désactiver l'alerte au lieu de la supprimer (pour garder l'historique)
  UPDATE oil_change_reminders
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE vehicle_id = OLD.vehicle_id
    AND is_active = true;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
DROP TRIGGER IF EXISTS sync_oil_change_reminder_trigger ON maintenance_records;
CREATE TRIGGER sync_oil_change_reminder_trigger
  AFTER INSERT OR UPDATE OF next_date
  ON maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION sync_oil_change_reminder();

DROP TRIGGER IF EXISTS deactivate_oil_change_reminder_trigger ON maintenance_records;
CREATE TRIGGER deactivate_oil_change_reminder_trigger
  AFTER DELETE
  ON maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION deactivate_oil_change_reminder();

-- Synchroniser les données existantes
UPDATE oil_change_reminders r
SET 
  next_reminder_date = m.next_date,
  alerts_sent = '{}',
  updated_at = NOW()
FROM maintenance_records m
WHERE r.vehicle_id = m.vehicle_id
  AND m.maintenance_type = 'Vidange moteur'
  AND r.is_active = true
  AND r.next_reminder_date != m.next_date;

-- Log
DO $$
DECLARE
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO synced_count
  FROM oil_change_reminders r
  JOIN maintenance_records m ON r.vehicle_id = m.vehicle_id
  WHERE m.maintenance_type = 'Vidange moteur'
    AND r.is_active = true;
  
  RAISE NOTICE 'Synchronisé % alertes avec le carnet d''entretien', synced_count;
END $$;
