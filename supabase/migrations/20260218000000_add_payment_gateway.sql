-- Add payment_gateway column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'KkiaPay';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway ON orders(payment_gateway);

-- Add comment
COMMENT ON COLUMN orders.payment_gateway IS 'Payment gateway used: KkiaPay or genius_pay';
