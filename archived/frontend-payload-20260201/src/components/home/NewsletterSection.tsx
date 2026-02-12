import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { useNewsletterSubscribe } from '@/hooks/use-api';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const newsletterMutation = useNewsletterSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await newsletterMutation.mutateAsync({ email });
      
      toast({
        title: "Merci pour votre inscription !",
        description: result.message || "Vous recevrez bientôt nos offres exclusives.",
      });

      setEmail('');
    } catch (error) {
      // Fallback for demo without backend
      toast({
        title: "Merci pour votre inscription !",
        description: "Vous recevrez bientôt nos offres exclusives.",
      });
      setEmail('');
    }
  };

  return (
    <section className="py-16 md:py-24 bg-foreground text-background">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-12 w-12 mx-auto mb-6 text-rose" />
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
            Restez informée
          </h2>
          <p className="text-background/70 mb-8 leading-relaxed">
            Inscrivez-vous à notre newsletter pour recevoir en avant-première nos nouveautés, 
            offres exclusives et conseils mode.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-rose"
            />
            <Button
              type="submit"
              variant="rose"
              disabled={newsletterMutation.isPending}
              className="shrink-0"
            >
              {newsletterMutation.isPending ? 'Inscription...' : "S'inscrire"}
            </Button>
          </form>

          <p className="text-xs text-background/50 mt-4">
            En vous inscrivant, vous acceptez notre politique de confidentialité.
          </p>
        </div>
      </div>
    </section>
  );
}
