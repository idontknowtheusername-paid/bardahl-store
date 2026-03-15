import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateShort } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Copy, Send, Loader2, Link as LinkIcon, Trash2, Search } from 'lucide-react';

interface LinkItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
}

const SITE_URL = 'https://autopassionbj.com';

export default function PaymentLinks() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [items, setItems] = useState<LinkItem[]>([]);
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const { data: links, isLoading } = useQuery({
    queryKey: ['payment-links'],
    queryFn: async () => {
      const { data } = await supabase.from('payment_links').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-links'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, title, price').eq('is_active', true).order('title');
      return data || [];
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products || !productSearch.trim()) return [];
    return products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8);
  }, [products, productSearch]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountType === 'fixed' ? discountValue : 0;
  const total = Math.max(0, subtotal - discount);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from('payment_links').insert({
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        items: items as any,
        discount_type: discountType,
        discount_value: discountValue,
        subtotal,
        total,
      }).select('token').single();
      if (error) throw error;
      return data.token;
    },
    onSuccess: (token) => {
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
      setGeneratedLink(`${SITE_URL}/paiement/${token}`);
      setGeneratedToken(token);
      toast.success('Lien généré !');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payment_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
      toast.success('Lien supprimé');
    },
  });

  const addProduct = (p: { id: string; title: string; price: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === p.id);
      if (existing) return prev.map(i => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: p.id, title: p.title, price: p.price, quantity: 1 }];
    });
    setProductSearch('');
  };

  const removeItem = (pid: string) => setItems(prev => prev.filter(i => i.product_id !== pid));
  const updateQty = (pid: string, qty: number) => setItems(prev => prev.map(i => i.product_id === pid ? { ...i, quantity: Math.max(1, qty) } : i));

  const copyLink = () => {
    if (generatedLink) { navigator.clipboard.writeText(generatedLink); toast.success('Lien copié !'); }
  };

  const sendWhatsApp = () => {
    if (!generatedLink) return;
    const msg = encodeURIComponent(`Bonjour ${customerName}, voici votre lien de paiement: ${generatedLink}\n\nTotal: ${formatPrice(total)}`);
    const phone = customerPhone?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const resetForm = () => {
    setCustomerName(''); setCustomerPhone(''); setCustomerEmail('');
    setItems([]); setDiscountType('none'); setDiscountValue(0);
    setGeneratedLink(null); setGeneratedToken(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Liens de paiement</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nouveau lien</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Générer un lien de paiement</DialogTitle></DialogHeader>

            {generatedLink ? (
              <div className="space-y-4 py-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Lien généré :</p>
                  <p className="text-xs bg-muted p-2 rounded font-mono break-all">{generatedLink}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={copyLink} variant="outline"><Copy className="h-4 w-4 mr-2" /> Copier</Button>
                  <Button onClick={sendWhatsApp} className="bg-green-600 hover:bg-green-700 text-white"><Send className="h-4 w-4 mr-2" /> WhatsApp</Button>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold mb-1">Récapitulatif</p>
                  {items.map(i => (
                    <div key={i.product_id} className="flex justify-between text-xs py-1">
                      <span>{i.quantity}x {i.title}</span>
                      <span>{formatPrice(i.price * i.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm pt-2 border-t mt-2">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><Label>Nom client *</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Jean Dupont" /></div>
                  <div><Label>Téléphone</Label><Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+229..." /></div>
                  <div><Label>Email</Label><Input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@..." /></div>
                </div>

                <div>
                  <Label>Ajouter des produits</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Rechercher un produit..." className="pl-9" />
                  </div>
                  {filteredProducts.length > 0 && (
                    <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto">
                      {filteredProducts.map(p => (
                        <button key={p.id} onClick={() => addProduct(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between">
                          <span className="truncate">{p.title}</span>
                          <span className="text-muted-foreground ml-2 shrink-0">{formatPrice(p.price)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {items.map(i => (
                      <div key={i.product_id} className="flex items-center gap-2 px-3 py-2">
                        <span className="text-sm flex-1 truncate">{i.title}</span>
                        <Input type="number" min={1} value={i.quantity} onChange={e => updateQty(i.product_id, parseInt(e.target.value) || 1)} className="w-16 h-8 text-center" />
                        <span className="text-sm font-medium w-24 text-right">{formatPrice(i.price * i.quantity)}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i.product_id)}><Trash2 className="h-3 w-3" /></Button>
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
                        <SelectItem value="none">Pas de remise</SelectItem>
                        <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                        <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {discountType !== 'none' && (
                    <div>
                      <Label>Valeur</Label>
                      <Input type="number" min={0} value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} />
                    </div>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-sm text-primary"><span>Remise</span><span>-{formatPrice(discount)}</span></div>}
                  <div className="flex justify-between text-base font-bold pt-1 border-t"><span>Total</span><span>{formatPrice(total)}</span></div>
                </div>

                <Button onClick={() => createMutation.mutate()} disabled={!customerName || items.length === 0 || createMutation.isPending} className="w-full">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                  Générer le lien
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Client</th>
            <th className="text-left p-3 font-medium">Total</th>
            <th className="text-left p-3 font-medium">Statut</th>
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : !links?.length ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Aucun lien</td></tr>
            ) : links.map((l: any) => (
              <tr key={l.id} className="border-b">
                <td className="p-3"><div>{l.customer_name}</div><div className="text-xs text-muted-foreground">{l.customer_phone}</div></td>
                <td className="p-3 font-medium">{formatPrice(l.total)}</td>
                <td className="p-3">
                  <Badge variant={l.status === 'paid' ? 'default' : l.status === 'expired' ? 'destructive' : 'secondary'}>
                    {l.status === 'paid' ? 'Payé' : l.status === 'expired' ? 'Expiré' : 'En attente'}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">{formatDateShort(l.created_at)}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(`${SITE_URL}/paiement/${l.token}`); toast.success('Copié !'); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(l.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
