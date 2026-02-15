import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Mail, Package, MapPin, Truck, User, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/format';

interface OrderDetails {
  firstName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export default function Confirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Try to retrieve shipping info from localStorage
    const savedShipping = localStorage.getItem('bardahl-order-details');
    if (savedShipping) {
      try {
        setOrderDetails(JSON.parse(savedShipping));
      } catch (e) {
        console.error('Failed to parse order details');
      }
    }
  }, []);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
  const deliveryDateStr = estimatedDelivery.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3 animate-slide-up">
            Merci pour votre commande !
          </h1>

          <p className="text-muted-foreground animate-slide-up" style={{ animationDelay: '100ms' }}>
            Votre commande a été confirmée et sera expédiée dans les plus brefs délais.
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-muted p-6 rounded-xl mb-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Package className="h-5 w-5 text-rose" />
            <span className="font-medium">Numéro de commande</span>
          </div>
          <p className="font-mono text-2xl font-bold text-center">{orderId}</p>
        </div>

        {/* Order Details */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
          {/* Delivery Info */}
          {orderDetails && (
            <>
              <div className="p-5">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-rose" />
                  Adresse de livraison
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {orderDetails.firstName}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {orderDetails.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {orderDetails.email}
                  </p>
                  {orderDetails.address && (
                    <p className="pl-6">{orderDetails.address}</p>
                  )}
                  <p className="pl-6">{orderDetails.city}, {orderDetails.country}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Estimated Delivery */}
          <div className="p-5">
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <Truck className="h-4 w-4 text-rose" />
              Livraison estimée
            </h3>
            <p className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{deliveryDateStr}</span>
            </p>
          </div>

          <Separator />

          {/* Next Steps */}
          <div className="p-5 bg-rose-light/50">
            <h3 className="font-medium mb-3">Prochaines étapes</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose text-primary-foreground flex items-center justify-center text-xs">1</span>
                <span>Vous recevrez un email de confirmation avec les détails de votre commande</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose text-primary-foreground flex items-center justify-center text-xs">2</span>
                <span>Nous préparons votre colis avec soin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose text-primary-foreground flex items-center justify-center text-xs">3</span>
                <span>Vous serez notifié par SMS/WhatsApp lors de l'expédition</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Email Notice */}
        <div className="bg-muted/50 border border-border p-4 rounded-lg mt-6 flex items-start gap-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Mail className="h-5 w-5 text-rose flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Un email de confirmation a été envoyé à votre adresse avec tous les détails de votre commande.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-8">
          <Button variant="rose" size="lg" asChild>
            <Link to="/collections">Continuer mes achats</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
