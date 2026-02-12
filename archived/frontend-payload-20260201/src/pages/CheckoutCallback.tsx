import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentApi } from '@/lib/api-payment';

export default function CheckoutCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const orderNumberParam = searchParams.get('order_id') || searchParams.get('orderNumber');
      
      if (!orderNumberParam) {
        setStatus('failed');
        setMessage('Numéro de commande manquant');
        return;
      }

      setOrderNumber(orderNumberParam);

      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = await paymentApi.verifyPayment(orderNumberParam);

        if (result.is_successful) {
          setStatus('success');
          setMessage('Votre paiement a été confirmé avec succès !');
          
          // Redirect to confirmation page after 2 seconds
          setTimeout(() => {
            navigate(`/confirmation/${orderNumberParam}`);
          }, 2000);
        } else if (result.is_failed) {
          setStatus('failed');
          setMessage('Le paiement a échoué. Veuillez réessayer.');
        } else if (result.is_pending) {
          setStatus('pending');
          setMessage('Votre paiement est en cours de traitement...');
          
          // Retry verification after 5 seconds
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        } else {
          setStatus('pending');
          setMessage('Vérification du paiement en cours...');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage('Erreur lors de la vérification du paiement');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-rose mx-auto mb-6" />
            <h1 className="font-serif text-2xl font-medium mb-4">
              Vérification du paiement...
            </h1>
            <p className="text-muted-foreground">
              Veuillez patienter pendant que nous vérifions votre paiement.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-serif text-2xl font-medium mb-4 text-green-600">
              Paiement réussi !
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground">
              Redirection vers la page de confirmation...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="font-serif text-2xl font-medium mb-4 text-red-600">
              Paiement échoué
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Button
                variant="rose"
                onClick={() => navigate('/panier')}
              >
                Retour au panier
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
              >
                Contacter le support
              </Button>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="font-serif text-2xl font-medium mb-4 text-yellow-600">
              Paiement en attente
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground">
              Nouvelle vérification dans quelques secondes...
            </p>
          </>
        )}

        {orderNumber && (
          <p className="text-xs text-muted-foreground mt-8">
            Numéro de commande : <strong>{orderNumber}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
