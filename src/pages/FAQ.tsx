import { useTranslation } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqData = [
  {
    q: { fr: 'Quelle huile choisir pour mon véhicule ?', en: 'Which oil should I choose for my vehicle?' },
    a: { fr: 'Utilisez notre sélecteur d\'huile intelligent sur la page d\'accueil ou consultez le manuel de votre véhicule pour connaître la viscosité recommandée.', en: 'Use our smart oil selector on the homepage or consult your vehicle manual for the recommended viscosity.' },
  },
  {
    q: { fr: 'Qu\'est-ce que la technologie Polar Plus® ?', en: 'What is Polar Plus® technology?' },
    a: { fr: 'Polar Plus® est une technologie exclusive Bardahl qui crée un film protecteur ultra-résistant sur les surfaces métalliques du moteur, réduisant la friction et l\'usure.', en: 'Polar Plus® is an exclusive Bardahl technology that creates an ultra-resistant protective film on engine metal surfaces, reducing friction and wear.' },
  },
  {
    q: { fr: 'Quels sont les délais de livraison ?', en: 'What are the delivery times?' },
    a: { fr: 'Livraison standard en 2-4 jours ouvrés, express en 24-48h. Gratuite dès 59€ d\'achat.', en: 'Standard delivery in 2-4 business days, express in 24-48h. Free shipping on orders over €59.' },
  },
  {
    q: { fr: 'Puis-je retourner un produit ?', en: 'Can I return a product?' },
    a: { fr: 'Oui, vous disposez de 14 jours pour retourner un produit non ouvert dans son emballage d\'origine.', en: 'Yes, you have 14 days to return an unopened product in its original packaging.' },
  },
  {
    q: { fr: 'Quels modes de paiement acceptez-vous ?', en: 'What payment methods do you accept?' },
    a: { fr: 'Nous acceptons les cartes bancaires (Visa, Mastercard), le mobile money et les virements bancaires.', en: 'We accept credit cards (Visa, Mastercard), mobile money and bank transfers.' },
  },
];

export default function FAQ() {
  const t = useTranslation();

  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{t.faqTitle}</h1>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqData.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left font-semibold">
                {faq.q.fr}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a.fr}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
