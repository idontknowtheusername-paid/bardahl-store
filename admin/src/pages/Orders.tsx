import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateShort } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, Eye, Download, Trash2 } from 'lucide-react';

const ORDER_STATUSES = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'En cours', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Expédiée', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Livrée', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Remboursée', color: 'bg-gray-100 text-gray-800' },
];

export default function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', search, statusFilter],
    queryFn: async () => {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (search) query = query.or(`order_number.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`);
      if (statusFilter && statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Statut mis à jour');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour', { description: error.message });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete order items first
      await supabase.from('order_items').delete().eq('order_id', id);
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande supprimée');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression', { description: error.message });
    },
  });

  const deleteBulkMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await supabase.from('order_items').delete().eq('order_id', id);
      }
      const { error } = await supabase.from('orders').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedIds(new Set());
      toast.success('Commandes supprimées');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression', { description: error.message });
    },
  });

  const exportCSV = () => {
    if (!orders?.length) return;
    const headers = ['Numéro', 'Date', 'Client', 'Email', 'Téléphone', 'Total', 'Statut', 'Paiement'];
    const rows = orders.map(o => [o.order_number, formatDateShort(o.created_at), o.customer_name || '', o.customer_email || '', o.customer_phone || '', o.total, o.status, o.payment_status]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const allIds = orders?.map(o => o.id) || [];
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <div className="flex gap-2">
          {someSelected && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer {selectedIds.size} commande(s) ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Les commandes et leurs articles seront supprimés définitivement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteBulkMutation.mutate(Array.from(selectedIds))}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />Exporter CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead>Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">Chargement...</TableCell></TableRow>
            ) : orders?.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucune commande</TableCell></TableRow>
            ) : (
              orders?.map((order) => (
                <TableRow key={order.id} className={selectedIds.has(order.id) ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(order.id)}
                      onCheckedChange={() => toggleSelect(order.id)}
                      aria-label={`Sélectionner ${order.order_number}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateShort(order.created_at)}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.customer_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email || order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {order.payment_status === 'paid' ? 'Payé' : order.payment_status === 'failed' ? 'Échoué' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={order.status || 'pending'} onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/orders/${order.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la commande {order.order_number} ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La commande et tous ses articles seront supprimés définitivement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOrderMutation.mutate(order.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
