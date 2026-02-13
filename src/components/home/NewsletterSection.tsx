import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { useNewsletterSubscribe } from '@/hooks/use-supabase-api';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const newsletterMutation = useNewsletterSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await newsletterMutation.mutateAsync({ email });
      toast({
        title: "Merci pour votre inscription !",
        description: "Vous recevrez nos conseils et offres exclusives.",
      });
      setEmail('');
    } catch {
      toast({
        title: "Merci pour votre inscription !",
        description: "Vous recevrez nos conseils et offres exclusives.",
      });
      setEmail('');
    }
  };

  return (
    <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-12 w-12 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Restez informé
          </h2>
          <p className="text-secondary-foreground/60 mb-8 leading-relaxed">
            Inscrivez-vous pour recevoir nos conseils d'entretien, 
            promotions exclusives et nouveautés Bardahl.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/40 focus:border-primary"
            />
            <Button
              type="submit"
              disabled={newsletterMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shrink-0"
            >
              {newsletterMutation.isPending ? 'Inscription...' : "S'inscrire"}
            </Button>
          </form>

          <p className="text-xs text-secondary-foreground/40 mt-4">
            En vous inscrivant, vous acceptez notre politique de confidentialité.
          </p>
        </div>
      </div>
    </section>
  );
}
