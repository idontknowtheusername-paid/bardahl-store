-- Add paid_at and payment_gateway_response columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_gateway_response JSONB;
