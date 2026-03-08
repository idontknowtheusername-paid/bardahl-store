
-- Drop the restrictive policy and recreate as permissive for authenticated users
DROP POLICY IF EXISTS "Anyone can create reminders" ON public.oil_change_reminders;

CREATE POLICY "Authenticated users can create reminders"
ON public.oil_change_reminders FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also allow authenticated users to update their own reminders
CREATE POLICY "Users can update own reminders"
ON public.oil_change_reminders FOR UPDATE
TO authenticated
USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  OR customer_phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid()))
WITH CHECK (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  OR customer_phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid()));

-- Allow authenticated users to read their own reminders
CREATE POLICY "Users can read own reminders"
ON public.oil_change_reminders FOR SELECT
TO authenticated
USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  OR customer_phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid()));
