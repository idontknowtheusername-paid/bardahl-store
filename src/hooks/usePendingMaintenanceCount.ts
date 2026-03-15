import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export function usePendingMaintenanceCount() {
  const { vehicles, isAuthenticated } = useCustomerAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || vehicles.length === 0) {
      setCount(0);
      setLoading(false);
      return;
    }

    const fetchPendingCount = async () => {
      setLoading(true);
      let pendingCount = 0;

      for (const vehicle of vehicles) {
        // Fetch alert reminder for this vehicle
        const { data: reminders } = await supabase
          .from('oil_change_reminders')
          .select('next_reminder_date, reminder_interval_months')
          .eq('is_active', true)
          .eq('vehicle_brand', vehicle.brand)
          .eq('vehicle_model', vehicle.model);

        if (reminders && reminders.length > 0) {
          const reminder = reminders[0];
          const nextDate = new Date(reminder.next_reminder_date);
          const today = new Date();

          // Check if date is past
          if (nextDate < today) {
            // Check if there's a maintenance record for this date
            const { data: records } = await supabase
              .from('maintenance_records')
              .select('id, maintenance_type, next_date')
              .eq('vehicle_id', vehicle.id)
              .eq('maintenance_type', 'Vidange moteur')
              .eq('next_date', reminder.next_reminder_date);

            if (records && records.length > 0) {
              pendingCount++;
            }
          }
        }
      }

      setCount(pendingCount);
      setLoading(false);
    };

    fetchPendingCount();
  }, [vehicles, isAuthenticated]);

  return { count, loading };
}
