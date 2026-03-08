import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate, formatDateShort } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Bell, Calendar, Mail, Car, Clock, Send, Trash2, Plus, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface AlertsSent {
  midpoint?: string;
  one_week?: string;
  one_day?: string;
}

export default function Reminders() {
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_engine: '',
    product_title: '',
    reminder_interval_months: 6,
  });
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
        alerts_sent: {},
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Fréquence mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('oil_change_reminders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Rappel supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const next = new Date();
      next.setMonth(next.getMonth() + newReminder.reminder_interval_months);
      const { error } = await supabase.from('oil_change_reminders').insert({
        customer_name: newReminder.customer_name || null,
        customer_email: newReminder.customer_email,
        customer_phone: newReminder.customer_phone || null,
        vehicle_brand: newReminder.vehicle_brand || null,
        vehicle_model: newReminder.vehicle_model || null,
        vehicle_engine: newReminder.vehicle_engine || null,
        product_title: newReminder.product_title || null,
        reminder_interval_months: newReminder.reminder_interval_months,
        next_reminder_date: next.toISOString(),
        last_purchase_date: new Date().toISOString(),
        is_active: true,
        reminder_count: 0,
        alerts_sent: {},
        alert_preferences: { midpoint: true, one_week: true, one_day: true },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Rappel créé avec succès');
      setCreateOpen(false);
      setNewReminder({
        customer_name: '', customer_email: '', customer_phone: '',
        vehicle_brand: '', vehicle_model: '', vehicle_engine: '',
        product_title: '', reminder_interval_months: 6,
      });
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const [sending, setSending] = useState(false);
  const sendReminders = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('oil-change-reminder');
      if (error) throw error;
      const result = data as { sent?: number; message?: string };
      toast.success(`${result?.sent || 0} alertes envoyées`);
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const activeCount = reminders?.filter(r => r.is_active).length || 0;
  const dueCount = reminders?.filter(r => r.is_active && new Date(r.next_reminder_date) <= new Date()).length || 0;
  const totalEmailsSent = reminders?.reduce((sum, r) => sum + (r.reminder_count || 0), 0) || 0;

  const renderAlertBadges = (alertsSent: AlertsSent) => {
    const alerts = [
      { key: 'midpoint', label: 'Mi-chemin', color: 'bg-blue-100 text-blue-700' },
      { key: 'one_week', label: 'J-7', color: 'bg-orange-100 text-orange-700' },
      { key: 'one_day', label: 'J-1', color: 'bg-red-100 text-red-700' },
    ] as const;

    return (
      <div className="flex flex-wrap gap-1">
        {alerts.map(a => {
          const sent = alertsSent?.[a.key];
          return (
            <span
              key={a.key}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${sent ? a.color : 'bg-muted text-muted-foreground'}`}
              title={sent ? `Envoyé le ${formatDateShort(sent)}` : 'Pas encore envoyé'}
            >
              {sent ? <CheckCircle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
              {a.label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Rappels vidange
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} actifs · {dueCount} à envoyer · {totalEmailsSent} emails envoyés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={sendReminders} disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Envoyer maintenant
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nouveau rappel</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un rappel vidange</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Email client *</Label>
                  <Input value={newReminder.customer_email} onChange={e => setNewReminder({ ...newReminder, customer_email: e.target.value })} placeholder="client@email.com" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nom</Label>
                    <Input value={newReminder.customer_name} onChange={e => setNewReminder({ ...newReminder, customer_name: e.target.value })} placeholder="Nom du client" />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={newReminder.customer_phone} onChange={e => setNewReminder({ ...newReminder, customer_phone: e.target.value })} placeholder="+229..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Marque véhicule</Label>
                    <Input value={newReminder.vehicle_brand} onChange={e => setNewReminder({ ...newReminder, vehicle_brand: e.target.value })} placeholder="Toyota" />
                  </div>
                  <div>
                    <Label>Modèle</Label>
                    <Input value={newReminder.vehicle_model} onChange={e => setNewReminder({ ...newReminder, vehicle_model: e.target.value })} placeholder="Corolla" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Motorisation</Label>
                    <Input value={newReminder.vehicle_engine} onChange={e => setNewReminder({ ...newReminder, vehicle_engine: e.target.value })} placeholder="1.8L Diesel" />
                  </div>
                  <div>
                    <Label>Fréquence</Label>
                    <Select value={String(newReminder.reminder_interval_months)} onValueChange={v => setNewReminder({ ...newReminder, reminder_interval_months: parseInt(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 mois</SelectItem>
                        <SelectItem value="6">6 mois</SelectItem>
                        <SelectItem value="9">9 mois</SelectItem>
                        <SelectItem value="12">12 mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Produit recommandé</Label>
                  <Input value={newReminder.product_title} onChange={e => setNewReminder({ ...newReminder, product_title: e.target.value })} placeholder="Huile Bardahl 5W-30" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button onClick={() => createMutation.mutate()} disabled={!newReminder.customer_email || createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats cards */}
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
                <p className="text-2xl font-bold">{totalEmailsSent}</p>
                <p className="text-xs text-muted-foreground">Emails envoyés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Les alertes sont envoyées progressivement : <strong>mi-chemin</strong>, <strong>J-7</strong> et <strong>J-1</strong> avant la date de vidange. Utilisez "Envoyer maintenant" pour déclencher l'envoi des alertes en attente.</span>
      </div>

      {/* Table */}
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Fréquence</TableHead>
                    <TableHead>Prochain rappel</TableHead>
                    <TableHead>Alertes cycle</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((r) => {
                    const isDue = r.is_active && new Date(r.next_reminder_date) <= new Date();
                    const alertsSent = (r.alerts_sent as AlertsSent) || {};
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
                            {formatDateShort(r.next_reminder_date)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {renderAlertBadges(alertsSent)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={r.is_active}
                            onCheckedChange={(v) => toggleMutation.mutate({ id: r.id, is_active: v })}
                          />
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce rappel ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Le rappel pour {r.customer_name || r.customer_email} sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
