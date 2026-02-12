import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de désabonnement invalide');
        return;
      }

      try {
        const { error } = await supabase
          .from('blog_subscribers')
          .update({ is_active: false })
          .eq('unsubscribe_token', token);

        if (error) throw error;

        setStatus('success');
        setMessage('Vous avez été désabonné avec succès des notifications du blog.');
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors du désabonnement.');
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="container max-w-md text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-rose" />
            <h1 className="font-serif text-2xl">Désabonnement en cours...</h1>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-medium">Désabonnement réussi</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Vous ne recevrez plus d'emails concernant les nouveaux articles du blog.
              Vous pouvez vous réabonner à tout moment lors d'un prochain achat.
            </p>
            <Button asChild variant="rose">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <XCircle className="h-16 w-16 mx-auto text-destructive" />
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-medium">Erreur</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Button asChild variant="rose">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
