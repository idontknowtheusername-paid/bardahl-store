
-- Add alerts_sent column to track which progressive alerts have been sent per cycle
ALTER TABLE public.oil_change_reminders 
  ADD COLUMN IF NOT EXISTS alerts_sent jsonb NOT NULL DEFAULT '{}';

-- Add alert_preferences column for client customization
ALTER TABLE public.oil_change_reminders 
  ADD COLUMN IF NOT EXISTS alert_preferences jsonb NOT NULL DEFAULT '{"midpoint": true, "one_week": true, "one_day": true}';

COMMENT ON COLUMN public.oil_change_reminders.alerts_sent IS 'Tracks sent alerts per cycle: {"midpoint": "2026-03-01", "one_week": "2026-03-08", "one_day": "2026-03-14"}';
COMMENT ON COLUMN public.oil_change_reminders.alert_preferences IS 'Client preferences: {"midpoint": true, "one_week": true, "one_day": true}';
