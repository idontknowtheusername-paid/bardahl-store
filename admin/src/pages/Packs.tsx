import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Loader2, Package, Trash2, Search, Save } from 'lucide-react';

interface PackItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  item_type: 'fixed' | 'variable';
  options?: { product_id: string; title: string; price: number; is_default: boolean }[];
}

export default function Packs() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const { data: packs, isLoading } = useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      const { data } = await supabase.from('product_packs').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-packs'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, title, price').eq('is_active', true).order('title');
      return data || [];
    },
  });

  const filtered = productSearch.trim() ? (products || []).filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 6) : [];

  const subtotal = packItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
  const total = Math.max(0, subtotal - discount);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const packData = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        discount_type: discountType,
        discount_value: discountValue,
        is_active: true,
      };

      let packId = editId;
      if (editId) {
        const { error } = await supabase.from('product_packs').update(packData).eq('id', editId);
        if (error) throw error;
        await supabase.from('pack_items').delete().eq('pack_id', editId);
      } else {
        const { data, error } = await supabase.from('product_packs').insert(packData).select('id').single();
        if (error) throw error;
        packId = data.id;
      }

      for (const item of packItems) {
        const { data: insertedItem, error } = await supabase.from('pack_items').insert({
          pack_id: packId!,
          product_id: item.product_id,
          quantity: item.quantity,
          item_type: item.item_type,
        }).select('id').single();
        if (error) throw error;

        if (item.item_type === 'variable' && item.options?.length) {
          const options = item.options.map(o => ({
            pack_item_id: insertedItem.id,
            product_id: o.product_id,
            is_default: o.is_default,
          }));
          const { error: optErr } = await supabase.from('pack_item_options').insert(options);
          if (optErr) throw optErr;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success(editId ? 'Pack modifié' : 'Pack créé');
      resetForm();
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_packs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack supprimé');
    },
  });

  const addProduct = (p: { id: string; title: string; price: number }) => {
    setPackItems(prev => [...prev, { product_id: p.id, title: p.title, price: p.price, quantity: 1, item_type: 'fixed' }]);
    setProductSearch('');
  };

  const resetForm = () => {
    setEditId(null); setName(''); setSlug(''); setDescription('');
    setDiscountType('percentage'); setDiscountValue(0); setPackItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Packs</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nouveau pack</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'Modifier' : 'Créer'} un pack</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nom *</Label><Input value={name} onChange={e => { setName(e.target.value); if (!editId) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} /></div>
                <div><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} /></div>
              </div>
              <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>

              <div>
                <Label>Produits inclus</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Rechercher..." className="pl-9" />
                </div>
                {filtered.length > 0 && (
                  <div className="border rounded mt-1 max-h-32 overflow-y-auto">
                    {filtered.map(p => (
                      <button key={p.id} onClick={() => addProduct(p)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex justify-between">
                        <span className="truncate">{p.title}</span><span className="text-muted-foreground">{formatPrice(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {packItems.length > 0 && (
                <div className="border rounded divide-y">
                  {packItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2">
                      <span className="text-sm flex-1 truncate">{item.title}</span>
                      <Select value={item.item_type} onValueChange={(v: 'fixed' | 'variable') => setPackItems(prev => prev.map((p, i) => i === idx ? { ...p, item_type: v } : p))}>
                        <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixe</SelectItem>
                          <SelectItem value="variable">Variable</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" min={1} value={item.quantity} onChange={e => setPackItems(prev => prev.map((p, i) => i === idx ? { ...p, quantity: parseInt(e.target.value) || 1 } : p))} className="w-16 h-8 text-center" />
                      <span className="text-sm font-medium w-20 text-right">{formatPrice(item.price * item.quantity)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPackItems(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type remise</Label>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                      <SelectItem value="fixed">Montant fixe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Valeur remise</Label><Input type="number" min={0} value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} /></div>
              </div>

              <div className="bg-muted/50 rounded p-3 flex justify-between font-bold">
                <span>Prix pack</span><span>{formatPrice(total)}</span>
              </div>

              <Button onClick={() => saveMutation.mutate()} disabled={!name || packItems.length === 0 || saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editId ? 'Modifier' : 'Créer'} le pack
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : !packs?.length ? (
          <div className="text-center py-8 text-muted-foreground"><Package className="h-10 w-10 mx-auto mb-2 opacity-40" /><p>Aucun pack</p></div>
        ) : packs.map((p: any) => (
          <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Actif' : 'Inactif'}</Badge>
                <Badge variant="outline">{p.discount_type === 'percentage' ? `${p.discount_value}%` : formatPrice(p.discount_value)} de remise</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
