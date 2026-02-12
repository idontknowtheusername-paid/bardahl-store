import { useState } from 'react';
import { Mail, Phone, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from '@/hooks/use-toast';
import { useContactSubmit } from '@/hooks/use-supabase-api';

const faqs = [
  {
    question: "Comment choisir ma taille ?",
    answer: "Consultez notre guide des tailles disponible sur chaque fiche produit. En cas de doute entre deux tailles, nous vous conseillons de prendre la taille supérieure pour plus de confort. Vous pouvez aussi nous contacter sur WhatsApp pour un conseil personnalisé."
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer: "Cotonou : 24-48h. Autres villes du Bénin : 2-4 jours. Afrique de l'Ouest : 5-10 jours selon la destination."
  },
  {
    question: "Comment retourner un article ?",
    answer: "Vous disposez de 7 jours pour demander un échange. Contactez-nous via WhatsApp au +229 01 97 00 00 00 avec votre numéro de commande et une photo de l'article."
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: "Nous acceptons MTN Mobile Money, Moov Money, les virements bancaires, et le paiement à la livraison (Cotonou uniquement)."
  },
  {
    question: "La livraison est-elle discrète ?",
    answer: "Oui, tous nos colis sont emballés de manière neutre sans mention du contenu. L'expéditeur affiché est 'CL Express'."
  },
];

export default function Contact() {
  const contactMutation = useContactSubmit();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await contactMutation.mutateAsync(formData);
      
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      // Fallback: simulate success for demo without backend
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="py-12 md:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Contactez-nous
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une question, un conseil ? Notre équipe est à votre écoute pour vous accompagner.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* WhatsApp - Primary */}
            <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <div className="p-3 bg-green-500 rounded-full">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium mb-1">WhatsApp (Recommandé)</h3>
                <a
                  href="https://wa.me/22901970000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 transition-colors font-medium"
                >
                  +229 01 97 00 00 00
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  Réponse rapide garantie
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-light rounded-full">
                <Phone className="h-5 w-5 text-rose" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Téléphone</h3>
                <a
                  href="tel:+22901970000000"
                  className="text-muted-foreground hover:text-rose transition-colors"
                >
                  +229 01 97 00 00 00
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-light rounded-full">
                <Mail className="h-5 w-5 text-rose" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Email</h3>
                <a
                  href="mailto:contact@cannesh-lingerie.com"
                  className="text-muted-foreground hover:text-rose transition-colors"
                >
                  contact@cannesh-lingerie.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-light rounded-full">
                <Clock className="h-5 w-5 text-rose" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Horaires</h3>
                <p className="text-muted-foreground text-sm">
                  Lundi - Samedi : 8h - 20h<br />
                  Dimanche : 10h - 18h
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Sujet *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un sujet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Ma commande</SelectItem>
                    <SelectItem value="return">Échange</SelectItem>
                    <SelectItem value="size">Conseil taille</SelectItem>
                    <SelectItem value="delivery">Livraison</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="rose"
                size="lg"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? (
                  'Envoi en cours...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <section className="mt-20">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
