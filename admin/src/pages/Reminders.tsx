import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate, formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Search, Bell, BellOff, Calendar, Mail, Car, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export default function Reminders() {
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders', search, filterActive],
    queryFn: async () => {
      let query = supabase.from('oil_change_reminders').select('*').order('next_reminder_date', { ascending: true });
      if (search) {
        query = query.or(`customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,vehicle_brand.ilike.%${search}%`);
      }
      if (filterActive === 'active') query = query.eq('is_active', true);
      if (filterActive === 'inactive') query = query.eq('is_active', false);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('oil_change_reminders').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Rappel mis à jour');
    },
  });

  const updateIntervalMutation = useMutation({
    mutationFn: async ({ id, months }: { id: string; months: number }) => {
      const next = new Date();
      next.setMonth(next.getMonth() + months);
      const { error } = await supabase.from('oil_change_reminders').update({
        reminder_interval_months: months,
        next_reminder_date: next.toISOString(),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Fréquence mise à jour');
    },
  });

  const activeCount = reminders?.filter(r => r.is_active).length || 0;
  const dueCount = reminders?.filter(r => r.is_active && new Date(r.next_reminder_date) <= new Date()).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Rappels vidange
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} actifs · {dueCount} à envoyer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Rappels actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dueCount}</p>
                <p className="text-xs text-muted-foreground">À envoyer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reminders?.reduce((sum, r) => sum + (r.reminder_count || 0), 0) || 0}</p>
                <p className="text-xs text-muted-foreground">Emails envoyés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par email, nom, véhicule..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : !reminders?.length ? (
            <p className="text-center text-muted-foreground py-8">Aucun rappel configuré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Prochain rappel</TableHead>
                  <TableHead>Envois</TableHead>
                  <TableHead>Actif</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((r) => {
                  const isDue = r.is_active && new Date(r.next_reminder_date) <= new Date();
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{r.customer_name || '-'}</p>
                          <p className="text-xs text-muted-foreground">{r.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Car className="h-3 w-3" />
                          {[r.vehicle_brand, r.vehicle_model].filter(Boolean).join(' ') || '-'}
                        </div>
                        {r.vehicle_engine && <p className="text-xs text-muted-foreground">{r.vehicle_engine}</p>}
                      </TableCell>
                      <TableCell className="text-sm">{r.product_title || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={String(r.reminder_interval_months)}
                          onValueChange={(v) => updateIntervalMutation.mutate({ id: r.id, months: parseInt(v) })}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 mois</SelectItem>
                            <SelectItem value="6">6 mois</SelectItem>
                            <SelectItem value="9">9 mois</SelectItem>
                            <SelectItem value="12">12 mois</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isDue ? 'destructive' : 'secondary'} className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(r.next_reminder_date)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">{r.reminder_count || 0}</TableCell>
                      <TableCell>
                        <Switch
                          checked={r.is_active}
                          onCheckedChange={(v) => toggleMutation.mutate({ id: r.id, is_active: v })}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
