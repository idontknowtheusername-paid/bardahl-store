-- Ajouter colonne alerts_history pour persister tous les cycles d'alertes
ALTER TABLE public.oil_change_reminders 
ADD COLUMN IF NOT EXISTS alerts_history JSONB DEFAULT '[]'::jsonb;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_oil_change_reminders_alerts_history ON public.oil_change_reminders USING GIN(alerts_history);
