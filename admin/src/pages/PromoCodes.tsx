import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Percent, Tag } from 'lucide-react';
import { toast } from 'sonner';

type PromoCode = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  uses_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  max_discount_amount: number | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  applies_to_product_ids: string[] | null;
  created_at: string;
};

export default function PromoCodes() {
  const [open, setOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const queryClient = useQueryClient();

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      // Note: This table doesn't exist yet in the schema
      // You'll need to create it in Supabase
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching promo codes:', error);
        return [];
      }
      return data as PromoCode[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Code promo supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce code promo ?')) {
      deleteMutation.mutate(id);
    }
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const isMaxUsesReached = (code: PromoCode) => {
    if (!code.max_uses) return false;
    return code.uses_count >= code.max_uses;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Codes Promo</h1>
        <Dialog open={open} onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditingCode(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCode ? 'Modifier le code promo' : 'Nouveau code promo'}
              </DialogTitle>
            </DialogHeader>
            <PromoCodeForm
              code={editingCode}
              onSuccess={() => {
                setOpen(false);
                setEditingCode(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !promoCodes?.length ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun code promo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créez votre premier code promo pour offrir des réductions
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Réduction</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-medium">{code.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {code.discount_type === 'percentage' ? (
                          `${code.discount_value}%`
                        ) : code.discount_type === 'fixed_amount' ? (
                          `${code.discount_value} FCFA`
                        ) : code.discount_type === 'free_shipping' ? (
                          'Livraison gratuite'
                        ) : (
                          `Achetez ${code.buy_quantity}, obtenez ${code.get_quantity}`
                        )}
                      </div>
                      {code.min_order_amount && (
                        <p className="text-xs text-muted-foreground">
                          Min: {code.min_order_amount} FCFA
                        </p>
                      )}
                      {code.max_discount_amount && code.discount_type === 'percentage' && (
                        <p className="text-xs text-muted-foreground">
                          Max: {code.max_discount_amount} FCFA
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {code.uses_count} {code.max_uses ? `/ ${code.max_uses}` : ''}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>Du {formatDate(code.valid_from)}</div>
                      {code.valid_until && (
                        <div className="text-muted-foreground">
                          Au {formatDate(code.valid_until)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {!code.is_active ? (
                        <Badge variant="secondary">Inactif</Badge>
                      ) : isExpired(code.valid_until) ? (
                        <Badge variant="destructive">Expiré</Badge>
                      ) : isMaxUsesReached(code) ? (
                        <Badge variant="secondary">Épuisé</Badge>
                      ) : (
                        <Badge className="bg-green-500">Actif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(code)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(code.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PromoCodeForm({ code, onSuccess }: { code: PromoCode | null; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: code?.code || '',
    discount_type: code?.discount_type || 'percentage',
    discount_value: code?.discount_value || 0,
    min_order_amount: code?.min_order_amount || null,
    max_uses: code?.max_uses || null,
    max_discount_amount: code?.max_discount_amount || null,
    buy_quantity: code?.buy_quantity || null,
    get_quantity: code?.get_quantity || null,
    valid_from: code?.valid_from?.split('T')[0] || new Date().toISOString().split('T')[0],
    valid_until: code?.valid_until?.split('T')[0] || '',
    is_active: code?.is_active ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        // Set discount_value to 0 for free_shipping
        discount_value: data.discount_type === 'free_shipping' ? 0 : data.discount_value,
      };

      if (code) {
        const { error } = await supabase
          .from('promo_codes')
          .update(payload)
          .eq('id', code.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert({ ...payload, uses_count: 0 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success(code ? 'Code promo modifié' : 'Code promo créé');
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Save error:', error);

      let errorMessage = 'Erreur lors de la sauvegarde';

      if (error.message?.includes('duplicate key') || error.code === '23505') {
        errorMessage = 'Ce code promo existe déjà. Veuillez en choisir un autre.';
      } else if (error.message?.includes('discount_value_check')) {
        errorMessage = 'La valeur de réduction doit être supérieure à 0';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Erreur', {
        description: errorMessage,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.discount_type === 'buy_x_get_y') {
      if (!formData.buy_quantity || !formData.get_quantity) {
        toast.error('Veuillez remplir les quantités pour "Achetez X, obtenez Y"');
        return;
      }
    }

    if (formData.discount_type !== 'free_shipping' && !formData.discount_value) {
      toast.error('Veuillez entrer une valeur de réduction');
      return;
    }

    saveMutation.mutate(formData);
  };

  const showDiscountValue = formData.discount_type !== 'free_shipping' && formData.discount_type !== 'buy_x_get_y';
  const showBuyXGetY = formData.discount_type === 'buy_x_get_y';
  const showMaxDiscount = formData.discount_type === 'percentage';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="code">Code *</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          placeholder="SUMMER2024"
          required
        />
      </div>

      <div>
        <Label htmlFor="discount_type">Type de réduction *</Label>
        <select
          id="discount_type"
          value={formData.discount_type}
          onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="percentage">Pourcentage (%)</option>
          <option value="fixed_amount">Montant fixe (FCFA)</option>
          <option value="free_shipping">Livraison gratuite</option>
          <option value="buy_x_get_y">Achetez X, obtenez Y gratuit</option>
        </select>
      </div>

      {showDiscountValue && (
        <div>
          <Label htmlFor="discount_value">
            Valeur * {formData.discount_type === 'percentage' ? '(%)' : '(FCFA)'}
          </Label>
          <Input
            id="discount_value"
            type="number"
            step="0.01"
            value={formData.discount_value}
            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      )}

      {showBuyXGetY && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buy_quantity">Quantité à acheter *</Label>
            <Input
              id="buy_quantity"
              type="number"
              min="1"
              value={formData.buy_quantity || ''}
              onChange={(e) => setFormData({ ...formData, buy_quantity: parseInt(e.target.value) || null })}
              required
            />
          </div>
          <div>
            <Label htmlFor="get_quantity">Quantité gratuite *</Label>
            <Input
              id="get_quantity"
              type="number"
              min="1"
              value={formData.get_quantity || ''}
              onChange={(e) => setFormData({ ...formData, get_quantity: parseInt(e.target.value) || null })}
              required
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="min_order_amount">Montant min. commande (FCFA)</Label>
          <Input
            id="min_order_amount"
            type="number"
            step="0.01"
            value={formData.min_order_amount || ''}
            onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>

        {showMaxDiscount && (
          <div>
            <Label htmlFor="max_discount_amount">Réduction max (FCFA)</Label>
            <Input
              id="max_discount_amount"
              type="number"
              step="0.01"
              value={formData.max_discount_amount || ''}
              onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>
        )}

        {!showMaxDiscount && (
          <div>
            <Label htmlFor="max_uses">Utilisations max</Label>
            <Input
              id="max_uses"
              type="number"
              value={formData.max_uses || ''}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>
        )}
      </div>

      {showMaxDiscount && (
        <div>
          <Label htmlFor="max_uses">Utilisations max</Label>
          <Input
            id="max_uses"
            type="number"
            value={formData.max_uses || ''}
            onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="valid_from">Valide du *</Label>
          <Input
            id="valid_from"
            type="date"
            value={formData.valid_from}
            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="valid_until">Valide jusqu'au</Label>
          <Input
            id="valid_until"
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Actif</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
