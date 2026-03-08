
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can update own reminders" ON public.oil_change_reminders;
DROP POLICY IF EXISTS "Users can read own reminders" ON public.oil_change_reminders;

-- Create a security definer function to get user email/phone
CREATE OR REPLACE FUNCTION public.get_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.get_user_phone()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid()
$$;

-- Recreate policies using functions
CREATE POLICY "Users can read own reminders"
ON public.oil_change_reminders FOR SELECT
TO authenticated
USING (customer_email = public.get_user_email() OR customer_phone = public.get_user_phone());

CREATE POLICY "Users can update own reminders"
ON public.oil_change_reminders FOR UPDATE
TO authenticated
USING (customer_email = public.get_user_email() OR customer_phone = public.get_user_phone())
WITH CHECK (customer_email = public.get_user_email() OR customer_phone = public.get_user_phone());
