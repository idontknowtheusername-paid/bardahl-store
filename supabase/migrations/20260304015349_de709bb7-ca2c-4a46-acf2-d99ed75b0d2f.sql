
-- Table for storing chat conversations
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table for storing chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table for oil change reminders
CREATE TABLE public.oil_change_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text,
  customer_phone text,
  vehicle_brand text,
  vehicle_model text,
  vehicle_engine text,
  product_title text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  reminder_interval_months integer NOT NULL DEFAULT 6,
  last_purchase_date timestamptz NOT NULL DEFAULT now(),
  next_reminder_date timestamptz NOT NULL DEFAULT (now() + interval '6 months'),
  reminder_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read conversations by session" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Admins can manage conversations" ON public.chat_conversations FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Admins can manage messages" ON public.chat_messages FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- RLS for oil_change_reminders
ALTER TABLE public.oil_change_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage reminders" ON public.oil_change_reminders FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Anyone can create reminders" ON public.oil_change_reminders FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_conversations_session ON public.chat_conversations(session_id);
CREATE INDEX idx_oil_change_reminders_email ON public.oil_change_reminders(customer_email);
CREATE INDEX idx_oil_change_reminders_next_date ON public.oil_change_reminders(next_reminder_date) WHERE is_active = true;
