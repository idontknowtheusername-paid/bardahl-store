-- Create a table to track description generation schedule
CREATE TABLE IF NOT EXISTS description_generation_schedule (
  id SERIAL PRIMARY KEY,
  setup_date TIMESTAMPTZ DEFAULT NOW(),
  switch_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  current_frequency TEXT DEFAULT 'twice-daily', -- 'twice-daily' or 'daily'
  last_run TIMESTAMPTZ,
  total_runs INTEGER DEFAULT 0,
  total_processed INTEGER DEFAULT 0
);

-- Insert initial tracking record
INSERT INTO description_generation_schedule (setup_date, switch_date, current_frequency)
VALUES (NOW(), NOW() + INTERVAL '30 days', 'twice-daily')
ON CONFLICT DO NOTHING;

-- Create a function to check if we should switch to daily
CREATE OR REPLACE FUNCTION should_switch_to_daily()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  switch_date TIMESTAMPTZ;
  current_freq TEXT;
BEGIN
  SELECT s.switch_date, s.current_frequency 
  INTO switch_date, current_freq
  FROM description_generation_schedule s
  ORDER BY id DESC
  LIMIT 1;
  
  RETURN (NOW() >= switch_date AND current_freq = 'twice-daily');
END;
$$;

-- Create a function to update schedule frequency
CREATE OR REPLACE FUNCTION update_schedule_frequency(new_frequency TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE description_generation_schedule
  SET current_frequency = new_frequency
  WHERE id = (SELECT id FROM description_generation_schedule ORDER BY id DESC LIMIT 1);
END;
$$;

-- Create a function to log generation runs
CREATE OR REPLACE FUNCTION log_generation_run(processed_count INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE description_generation_schedule
  SET 
    last_run = NOW(),
    total_runs = total_runs + 1,
    total_processed = total_processed + processed_count
  WHERE id = (SELECT id FROM description_generation_schedule ORDER BY id DESC LIMIT 1);
END;
$$;

COMMENT ON TABLE description_generation_schedule IS 
'Tracks the schedule and statistics for automatic product description generation';

COMMENT ON FUNCTION should_switch_to_daily() IS 
'Checks if 30 days have passed and schedule should switch from twice-daily to daily';

COMMENT ON FUNCTION update_schedule_frequency(TEXT) IS 
'Updates the current generation frequency (twice-daily or daily)';

COMMENT ON FUNCTION log_generation_run(INTEGER) IS 
'Logs a generation run with the number of products processed';
