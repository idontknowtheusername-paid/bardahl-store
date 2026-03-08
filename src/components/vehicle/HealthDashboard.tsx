import { CheckCircle, AlertTriangle, AlertOctagon, Droplets, Battery, Disc3, CircleDot, Shield, FileCheck, Receipt } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MaintenanceRecord {
  id: string;
  maintenance_type: string;
  last_date: string | null;
  next_date: string | null;
  mileage_at_service: number | null;
  notes: string | null;
}

interface HealthDashboardProps {
  records: MaintenanceRecord[];
}

const HEALTH_ITEMS = [
  { type: 'Vidange moteur', icon: Droplets, label: 'Vidange moteur' },
  { type: 'Vidange boîte', icon: Droplets, label: 'Vidange boîte' },
  { type: 'Remplacement batterie', icon: Battery, label: 'Batterie' },
  { type: 'Remplacement filtres', icon: Disc3, label: 'Filtres' },
  { type: 'Freins', icon: CircleDot, label: 'Freins' },
  { type: 'Pneus', icon: CircleDot, label: 'Pneus' },
  { type: 'Assurance', icon: Shield, label: 'Assurance' },
  { type: 'Visite technique', icon: FileCheck, label: 'Visite technique' },
  { type: 'TVM', icon: Receipt, label: 'TVM' },
];

type Status = 'ok' | 'warning' | 'urgent' | 'unknown';

function getStatus(record: MaintenanceRecord | undefined): { status: Status; label: string; progress: number } {
  if (!record || !record.next_date) {
    return { status: 'unknown', label: 'Non renseigné', progress: 0 };
  }

  const now = new Date();
  const next = new Date(record.next_date);
  const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'urgent', label: `En retard de ${Math.abs(diffDays)}j`, progress: 100 };
  }
  if (diffDays <= 30) {
    return { status: 'warning', label: `Dans ${diffDays}j`, progress: 75 };
  }
  return { status: 'ok', label: `Dans ${diffDays}j`, progress: Math.max(10, Math.min(50, 50 - (diffDays - 30))) };
}

const statusConfig: Record<Status, { color: string; bg: string; progressColor: string; Icon: typeof CheckCircle }> = {
  ok: { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', progressColor: '[&>div]:bg-emerald-500', Icon: CheckCircle },
  warning: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', progressColor: '[&>div]:bg-amber-500', Icon: AlertTriangle },
  urgent: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', progressColor: '[&>div]:bg-red-500', Icon: AlertOctagon },
  unknown: { color: 'text-muted-foreground', bg: 'bg-muted/50 border-border', progressColor: '[&>div]:bg-muted-foreground/30', Icon: CheckCircle },
};

export default function HealthDashboard({ records }: HealthDashboardProps) {
  const latestByType = new Map<string, MaintenanceRecord>();
  for (const r of records) {
    const existing = latestByType.get(r.maintenance_type);
    if (!existing || (r.last_date && (!existing.last_date || r.last_date > existing.last_date))) {
      latestByType.set(r.maintenance_type, r);
    }
  }

  const items = HEALTH_ITEMS.map(item => {
    const record = latestByType.get(item.type);
    const { status, label, progress } = getStatus(record);
    return { ...item, status, label, progress, record };
  });

  const okCount = items.filter(i => i.status === 'ok').length;
  const totalKnown = items.filter(i => i.status !== 'unknown').length;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">🔍 Santé véhicule 360°</h3>
        {totalKnown > 0 && (
          <span className="text-xs text-muted-foreground">
            {okCount}/{totalKnown} OK
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {items.map(item => {
          const cfg = statusConfig[item.status];
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              className={`rounded-lg border p-2 text-center transition-all ${cfg.bg}`}
            >
              <Icon className={`h-4 w-4 mx-auto mb-1 ${cfg.color}`} />
              <p className="text-[10px] font-semibold truncate">{item.label}</p>
              <p className={`text-[9px] mt-0.5 ${cfg.color} font-medium`}>
                {item.status === 'unknown' ? '—' : item.label}
              </p>
              {item.status !== 'unknown' && (
                <Progress value={item.progress} className={`h-1 mt-1 ${cfg.progressColor}`} />
              )}
            </div>
          );
        })}
      </div>

      {totalKnown === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Ajoutez des entretiens avec des dates pour voir l'état de santé.
        </p>
      )}
    </div>
  );
}
