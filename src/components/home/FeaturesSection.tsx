import { Shield, Truck, CreditCard, Headphones } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export function FeaturesSection() {
  const t = useTranslation();
  
  const features = [
    { icon: Shield, title: t.premiumQuality, description: t.premiumQualityDesc },
    { icon: Truck, title: t.freeDelivery, description: t.freeDeliveryDesc },
    { icon: CreditCard, title: t.securePayment, description: t.securePaymentDesc },
    { icon: Headphones, title: t.expertAdvice, description: t.expertAdviceDesc },
  ];

  return (
    <section className="py-16 md:py-20 border-t border-b border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div key={feature.title} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
