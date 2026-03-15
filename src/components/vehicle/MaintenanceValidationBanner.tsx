import { useState } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MaintenanceValidationBannerProps {
  vehicleId: string;
  maintenanceType: string;
  scheduledDate: string;
  intervalMonths: number;
  onValidated: () => void;
}

export default function MaintenanceValidationBanner({
  vehicleId,
  maintenanceType,
  scheduledDate,
  intervalMonths,
  onValidated,
}: MaintenanceValidationBannerProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isPostponing, setIsPostponing] = useState(false);

  const handleMarkAsDone = async () => {
    setIsValidating(true);
    
    try {
      const today = new Date();
      const nextDate = new Date(today);
      nextDate.setMonth(nextDate.getMonth() + intervalMonths);

      // Find existing maintenance record
      const { data: existingRecords } = await supabase
        .from('maintenance_records')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('maintenance_type', maintenanceType)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingRecords && existingRecords.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('maintenance_records')
          .update({
            last_date: today.toISOString(),
            next_date: nextDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecords[0].id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('maintenance_records')
          .insert({
            vehicle_id: vehicleId,
            maintenance_type: maintenanceType,
            last_date: today.toISOString(),
            next_date: nextDate.toISOString(),
          });

        if (error) throw error;
      }

      toast.success('✅ Vidange marquée comme effectuée !');
      onValidated();
    } catch (error) {
      console.error('Error validating maintenance:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePostpone = async () => {
    setIsPostponing(true);
    
    try {
      const newDate = new Date(scheduledDate);
      newDate.setDate(newDate.getDate() + 7);

      // Find existing maintenance record
      const { data: existingRecords } = await supabase
        .from('maintenance_records')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('maintenance_type', maintenanceType)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingRecords && existingRecords.length > 0) {
        const { error } = await supabase
          .from('maintenance_records')
          .update({
            next_date: newDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecords[0].id);

        if (error) throw error;
      }

      toast.success('⏰ Vidange reportée de 7 jours');
      onValidated();
    } catch (error) {
      console.error('Error postponing maintenance:', error);
      toast.error('Erreur lors du report');
    } finally {
      setIsPostponing(false);
    }
  };

  const formattedDate = new Date(scheduledDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-950/20 border-l-4 border-orange-500 rounded-lg p-3 shadow-sm">
      <div className="flex items-start gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-orange-900 dark:text-orange-100 mb-0.5">
            {maintenanceType} prévue le {formattedDate}
          </h3>
          <p className="text-xs text-orange-800 dark:text-orange-200">
            Avez-vous effectué cette vidange ?
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleMarkAsDone}
          disabled={isValidating || isPostponing}
          size="sm"
          className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
        >
          {isValidating ? (
            <>Validation...</>
          ) : (
            <>
              <CheckCircle className="h-3 w-3" />
              Oui, c'est fait
            </>
          )}
        </Button>
        <Button
          onClick={handlePostpone}
          disabled={isValidating || isPostponing}
          size="sm"
          className="flex-1 gap-1.5 bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs"
        >
          {isPostponing ? (
            <>Report...</>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              Reporter 7j
            </>
          )}
        </Button>
      </div>

      <p className="text-[10px] text-orange-700 dark:text-orange-300 mt-2 text-center">
        💡 Prochaine vidange calculée automatiquement ({intervalMonths} mois)
      </p>
    </div>
  );
}
