import { useTranslation } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqData = [
  {
    q: 'Quelle huile choisir pour mon véhicule ?',
    a: 'Utilisez notre sélecteur d\'huile intelligent sur la page d\'accueil ou consultez le manuel de votre véhicule pour connaître la viscosité recommandée. Vous pouvez aussi nous contacter sur WhatsApp pour un conseil personnalisé.',
  },
  {
    q: 'Comment fonctionne le diagnostic IA ?',
    a: 'Notre assistant intelligent analyse les symptômes que vous décrivez (bruits, vibrations, voyants) et vous propose un pré-diagnostic avec les causes probables et les actions recommandées. Il ne remplace pas un mécanicien professionnel mais vous aide à mieux comprendre votre véhicule.',
  },
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'Parakou et environs : 24-48h. Autres villes du Bénin (Cotonou, Porto-Novo, Bohicon, etc.) : 2-4 jours ouvrés. Afrique de l\'Ouest : 5-10 jours selon la destination.',
  },
  {
    q: 'Puis-je retourner un produit ?',
    a: 'Oui, vous disposez de 7 jours à compter de la réception pour demander un échange. Le produit doit être non ouvert et dans son emballage d\'origine.',
  },
  {
    q: 'Quels modes de paiement acceptez-vous ?',
    a: 'Nous acceptons MTN Mobile Money, Moov Money, les virements bancaires et le paiement à la livraison (Parakou et environs uniquement).',
  },
  {
    q: 'Qu\'est-ce que le carnet d\'entretien digital ?',
    a: 'C\'est un espace personnel où vous enregistrez vos véhicules, suivez l\'historique des entretiens et recevez des rappels automatiques pour vos prochaines vidanges ou maintenances.',
  },
  {
    q: 'Les produits vendus sont-ils authentiques ?',
    a: 'Oui, tous nos produits proviennent de fournisseurs officiels et de marques reconnues. Nous garantissons l\'authenticité de chaque article.',
  },
];

export default function FAQ() {
  const t = useTranslation();

  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{t.faqTitle}</h1>
          <p className="text-muted-foreground">Retrouvez les réponses aux questions les plus fréquentes sur Autopassion BJ.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqData.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left font-semibold">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
