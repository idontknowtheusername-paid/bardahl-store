import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useTranslation } from '@/context/LanguageContext';

const partners = [
  { id: 1, name: 'Polar Plus®' },
  { id: 2, name: 'Fullerène C60' },
  { id: 3, name: 'API Certified' },
  { id: 4, name: 'ACEA' },
  { id: 5, name: 'SAE Standards' },
  { id: 6, name: 'ISO 9001' },
  { id: 7, name: 'Visa' },
  { id: 8, name: 'Mastercard' },
  { id: 9, name: 'Mobile Money' },
  { id: 10, name: 'DHL Express' },
];

export function TrustSection() {
  const t = useTranslation();

  return (
    <section className="py-12 md:py-16 border-t border-border bg-muted/30">
      <div className="container">
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold">{t.certifications}</h3>
          <p className="text-muted-foreground mt-2 text-sm">{t.certDescription}</p>
        </div>
        <div className="max-w-5xl mx-auto">
          <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 2000, stopOnInteraction: false })]} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {partners.map((partner) => (
                <CarouselItem key={partner.id} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5">
                  <div className="bg-background rounded-xl p-4 h-20 flex items-center justify-center text-center hover:shadow-md hover:border-primary/30 transition-all duration-300 border border-border">
                    <h4 className="font-bold text-xs text-muted-foreground">{partner.name}</h4>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
