CREATE POLICY "Customers can update own qr codes"
ON public.vehicle_qr_codes
FOR UPDATE
TO authenticated
USING (owns_vehicle(vehicle_id))
WITH CHECK (owns_vehicle(vehicle_id));