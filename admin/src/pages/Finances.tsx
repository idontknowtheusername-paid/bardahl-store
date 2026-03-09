import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PiggyBank,
  Receipt,
  BarChart3,
} from 'lucide-react';

interface Expense {
  id: string;
  category: string;
  label: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'stock', label: 'Achat de stock / Fournisseurs' },
  { value: 'shipping', label: 'Frais de livraison' },
  { value: 'marketing', label: 'Marketing & Publicité' },
  { value: 'rent', label: 'Loyer & Local' },
  { value: 'salary', label: 'Salaires & Main d\'oeuvre' },
  { value: 'tools', label: 'Outils & Logiciels' },
  { value: 'taxes', label: 'Taxes & Impôts' },
  { value: 'other', label: 'Autres dépenses' },
];

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function Finances() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [newExpense, setNewExpense] = useState({ category: 'stock', label: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const queryClient = useQueryClient();

  const [year, month] = selectedMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  // Fetch orders (revenue) for the month
  const { data: orders } = useQuery({
    queryKey: ['finance-orders', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total, subtotal, shipping_cost, discount_amount, status, payment_status, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('payment_status', ['paid', 'completed']);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch expenses for the month
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['finance-expenses', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []) as Expense[];
    },
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: { category: string; label: string; amount: number; date: string; notes: string | null }) => {
      const { error } = await supabase.from('expenses').insert(expense);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
      toast.success('Dépense ajoutée');
      setDialogOpen(false);
      setNewExpense({ category: 'stock', label: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
      toast.success('Dépense supprimée');
    },
  });

  // Compute financials
  const stats = useMemo(() => {
    const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);
    const totalShippingRevenue = (orders || []).reduce((sum, o) => sum + (o.shipping_cost || 0), 0);
    const totalDiscounts = (orders || []).reduce((sum, o) => sum + (o.discount_amount || 0), 0);
    const totalExpenses = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const orderCount = (orders || []).length;

    // Expenses by category
    const byCategory: Record<string, number> = {};
    (expenses || []).forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    return { totalRevenue, totalShippingRevenue, totalDiscounts, totalExpenses, netProfit, margin, orderCount, byCategory };
  }, [orders, expenses]);

  const handleAddExpense = () => {
    const amount = parseFloat(newExpense.amount);
    if (!newExpense.label.trim()) { toast.error('Libellé requis'); return; }
    if (isNaN(amount) || amount <= 0) { toast.error('Montant invalide'); return; }
    addExpenseMutation.mutate({
      category: newExpense.category,
      label: newExpense.label.trim(),
      amount,
      date: newExpense.date,
      notes: newExpense.notes.trim() || null,
    });
  };

  // Month selector options
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({ value: val, label: `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}` });
    }
    return options;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PiggyBank className="h-6 w-6" />
            Gestion Financière
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Suivi des revenus, dépenses et bénéfices</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dépense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.orderCount} commandes payées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dépenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatPrice(stats.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">{(expenses || []).length} dépenses enregistrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            {stats.netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatPrice(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Marge : {stats.margin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Réductions accordées</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalDiscounts)}</div>
            <p className="text-xs text-muted-foreground mt-1">Codes promo utilisés</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses by Category */}
      {Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition des dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(stats.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => (
                  <div key={cat} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      {EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || cat}
                    </p>
                    <p className="text-sm font-semibold mt-1">{formatPrice(amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalExpenses > 0 ? ((amount / stats.totalExpenses) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dépenses du mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell>
                  </TableRow>
                ) : (expenses || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucune dépense ce mois. Cliquez sur "+ Dépense" pour en ajouter.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses?.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-sm">
                        {new Date(exp.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label || exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{exp.label}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {exp.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-500">
                        -{formatPrice(exp.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Supprimer cette dépense ?')) {
                              deleteExpenseMutation.mutate(exp.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une dépense</DialogTitle>
            <DialogDescription>Enregistrez une dépense pour suivre votre rentabilité.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={newExpense.category} onValueChange={v => setNewExpense(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Libellé *</Label>
              <Input
                placeholder="Ex: Achat huiles moteur fournisseur X"
                value={newExpense.label}
                onChange={e => setNewExpense(p => ({ ...p, label: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant (FCFA) *</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={newExpense.amount}
                  onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={e => setNewExpense(p => ({ ...p, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea
                placeholder="Détails supplémentaires..."
                value={newExpense.notes}
                onChange={e => setNewExpense(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleAddExpense} disabled={addExpenseMutation.isPending}>
                {addExpenseMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
