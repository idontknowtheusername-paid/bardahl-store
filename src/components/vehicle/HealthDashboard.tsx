import { useState } from 'react';
import { CheckCircle, AlertTriangle, AlertOctagon, Droplets, Battery, Filter, Disc3, CircleDot, Shield, FileCheck, Receipt, ChevronDown, Cog } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [open, setOpen] = useState(false);

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
  const warningCount = items.filter(i => i.status === 'warning').length;
  const urgentCount = items.filter(i => i.status === 'urgent').length;
  const totalKnown = items.filter(i => i.status !== 'unknown').length;

  // Build summary badges
  const summaryParts: { label: string; className: string }[] = [];
  if (urgentCount > 0) summaryParts.push({ label: `${urgentCount} urgent`, className: 'bg-red-100 text-red-700' });
  if (warningCount > 0) summaryParts.push({ label: `${warningCount} à surveiller`, className: 'bg-amber-100 text-amber-700' });
  if (okCount > 0) summaryParts.push({ label: `${okCount} OK`, className: 'bg-emerald-100 text-emerald-700' });
  if (totalKnown === 0) summaryParts.push({ label: 'Aucune donnée', className: 'bg-muted text-muted-foreground' });

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card border border-border rounded-xl shadow-card mb-4 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors text-left">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">🔍</span>
              <span className="font-bold text-sm">Santé 360°</span>
              <div className="flex gap-1.5 flex-wrap">
                {summaryParts.map((s, i) => (
                  <span key={i} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.className}`}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3.5 pb-3.5">
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
