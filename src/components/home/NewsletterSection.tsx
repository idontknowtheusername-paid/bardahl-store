import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { useNewsletterSubscribe } from '@/hooks/use-supabase-api';
import { useTranslation } from '@/context/LanguageContext';

export function NewsletterSection() {
  const t = useTranslation();
  const [email, setEmail] = useState('');
  const newsletterMutation = useNewsletterSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await newsletterMutation.mutateAsync({ email });
      toast({ title: t.thankYou, description: t.thankYouDesc });
      setEmail('');
    } catch {
      toast({ title: t.thankYou, description: t.thankYouDesc });
      setEmail('');
    }
  };

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-12 w-12 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-secondary-foreground">{t.stayInformed}</h2>
          <p className="text-secondary-foreground/70 mb-8 leading-relaxed">{t.newsletterDesc}</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary" />
            <Button type="submit" disabled={newsletterMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shrink-0">
              {newsletterMutation.isPending ? t.subscribing : t.subscribe}
            </Button>
          </form>
          <p className="text-xs text-secondary-foreground/60 mt-4">{t.privacyConsent}</p>
        </div>
      </div>
    </section>
  );
}
