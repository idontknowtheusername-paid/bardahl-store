import { Shield, Truck, CreditCard, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Qualité Premium',
    description: 'Formulations avancées avec technologie Polar Plus® et Fullerène C60',
  },
  {
    icon: Truck,
    title: 'Livraison Gratuite',
    description: 'Livraison offerte dès 59€ d\'achat en France métropolitaine',
  },
  {
    icon: CreditCard,
    title: 'Paiement Sécurisé',
    description: 'Transactions 100% sécurisées par carte ou mobile money',
  },
  {
    icon: Headphones,
    title: 'Conseil Expert',
    description: 'Notre équipe vous aide à trouver le bon produit pour votre véhicule',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-20 border-t border-b border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
