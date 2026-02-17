import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Truck, Save } from 'lucide-react';
import { useState } from 'react';

const ORDER_STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'processing', label: 'En cours' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'refunded', label: 'Remboursée' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      setTrackingNumber(data.tracking_number || '');
      setAdminNote(data.admin_note || data.notes || '');
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase.from('orders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande mise à jour');
    },
  });

  const markAsShipped = async () => {
    if (!trackingNumber) {
      toast.error('Veuillez entrer un numéro de suivi');
      return;
    }

    console.log('🚚 Starting markAsShipped process...', {
      orderId: id,
      trackingNumber,
      customerEmail: order?.customer_email,
      orderNumber: order?.order_number,
    });

    try {
      // Update order status
      console.log('📝 Updating order status to shipped...');
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('❌ Order update error:', updateError);
        throw updateError;
      }
      console.log('✅ Order status updated successfully');

      // Send shipping email
      console.log('📧 Sending shipping email...');
      const emailPayload = {
        to: order.customer_email,
        subject: `Votre commande ${order.order_number} a été expédiée - Bardahl`,
        template: 'order_shipped',
        data: {
          customerName: order.customer_name,
          orderNumber: order.order_number,
          trackingNumber: trackingNumber,
        },
      };
      console.log('Email payload:', emailPayload);

      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
        body: emailPayload,
      });

      if (emailError) {
        console.error('❌ Email sending error:', emailError);
        toast.warning('Commande expédiée mais email non envoyé');
      } else {
        console.log('✅ Email sent successfully:', emailData);
        toast.success('Commande expédiée et email envoyé');
      }

      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

    } catch (error) {
      console.error('❌ markAsShipped error:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!order) return <div>Commande non trouvée</div>;

  // Parse shipping address if it's JSON
  const shippingAddr = typeof order.shipping_address === 'object' && order.shipping_address
    ? order.shipping_address as any
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Statut</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Statut commande</Label>
                <Select value={order.status || 'pending'} onValueChange={(status) => updateMutation.mutate({ status })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Paiement</Label>
                <Badge className="mt-2 block" variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                  {order.payment_status === 'paid' ? 'Payé' : order.payment_status === 'failed' ? 'Échoué' : 'En attente'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Numéro de suivi</Label>
              <div className="flex gap-2">
                <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Numéro de suivi" />
                <Button onClick={markAsShipped} disabled={updateMutation.isPending}><Truck className="h-4 w-4 mr-2" />Expédier</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Client</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{order.customer_name || 'N/A'}</p>
            <p className="text-muted-foreground">{order.customer_email}</p>
            <p className="text-muted-foreground">{order.customer_phone}</p>
            {shippingAddr && (
              <div className="pt-2 border-t">
                <p>{shippingAddr.address || shippingAddr.street}</p>
                <p>{shippingAddr.city}, {shippingAddr.country}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Articles</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.product_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.size && `Capacité: ${item.size}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                  <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between"><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Livraison</span><span>{formatPrice(order.shipping_cost || 0)}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Note interne</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Note interne (non visible par le client)" rows={3} />
          <Button onClick={() => updateMutation.mutate({ admin_note: adminNote, notes: adminNote })} disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />Enregistrer la note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
