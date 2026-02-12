import { Package, Truck, CreditCard, Lock } from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Qualité Premium',
    description: 'Matières soigneusement sélectionnées pour un confort optimal',
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Expédition sous 24-48h, gratuite dès 80€ d\'achat',
  },
  {
    icon: CreditCard,
    title: 'Paiement Sécurisé',
    description: 'Transactions 100% sécurisées via Lygos',
  },
  {
    icon: Lock,
    title: 'Emballage Discret',
    description: 'Colis neutre pour une confidentialité totale',
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
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-light mb-4">
                <feature.icon className="h-6 w-6 text-rose" />
              </div>
              <h3 className="font-serif text-lg font-medium mb-2">{feature.title}</h3>
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
