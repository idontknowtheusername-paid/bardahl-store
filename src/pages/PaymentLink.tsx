import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, ShoppingBag, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

interface PaymentLinkData {
  id: string;
  token: string;
  customer_name: string;
  items: { product_id: string; title: string; price: number; quantity: number }[];
  discount_type: string;
  discount_value: number;
  subtotal: number;
  total: number;
  status: string;
  expires_at: string;
}

export default function PaymentLink() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { clearCart, addItem } = useCart();
  const [data, setData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 min

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data: link, error: err } = await supabase
        .from('payment_links')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (err || !link) {
        setError('Lien introuvable.');
        setLoading(false);
        return;
      }
      if (link.status === 'paid') {
        setError('Ce lien a déjà été utilisé.');
        setLoading(false);
        return;
      }
      if (new Date(link.expires_at) < new Date()) {
        setError('Ce lien a expiré.');
        setLoading(false);
        return;
      }
      setData(link as unknown as PaymentLinkData);
      setLoading(false);
    })();
  }, [token]);

  // Countdown timer (visual only)
  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setCountdown(prev => (prev <= 0 ? 600 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handlePay = () => {
    if (!data) return;
    clearCart();
    data.items.forEach(item => {
      const product: any = {
        id: item.product_id,
        slug: item.product_id,
        name: item.title,
        price: item.price,
        images: [],
        category: '',
        collection: '',
        colors: [],
        sizes: [{ size: 'unique', available: true }],
        description: '',
        composition: '',
        care: '',
        style: '',
        stock: { unique: 99 },
      };
      addItem(product, 'unique', '', item.quantity);
    });
    navigate('/checkout');
  };

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h1 className="text-xl font-bold mb-2">Lien invalide</h1>
      <p className="text-muted-foreground">{error}</p>
    </div>
  );

  if (!data) return null;

  return (
    <>
      <Helmet><title>Paiement | Autopassion BJ</title></Helmet>
      <div className="min-h-[70vh] bg-muted/30 py-8">
        <div className="container max-w-lg">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <ShoppingBag className="h-10 w-10 text-primary mx-auto mb-3" />
              <h1 className="text-xl font-extrabold">Commande pour {data.customer_name}</h1>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-bold text-primary">
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {data.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{formatPrice(data.subtotal)}</span>
              </div>
              {data.discount_value > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Remise ({data.discount_type === 'percentage' ? `${data.discount_value}%` : formatPrice(data.discount_value)})</span>
                  <span>-{formatPrice(data.subtotal - data.total)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-extrabold pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(data.total)}</span>
              </div>
            </div>

            <Button onClick={handlePay} size="lg" className="w-full mt-6 text-base font-bold">
              Payer maintenant
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
