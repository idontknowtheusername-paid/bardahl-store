import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useTranslation } from '@/context/LanguageContext';

const certifications = [
  { id: 1, name: 'Polar Plus®', description: 'Technologie exclusive' },
  { id: 2, name: 'Fullerène C60', description: 'Protection avancée' },
  { id: 3, name: 'API Certified', description: 'Norme américaine' },
  { id: 4, name: 'ACEA', description: 'Norme européenne' },
  { id: 5, name: 'SAE Standards', description: 'Standards internationaux' },
  { id: 6, name: 'ISO 9001', description: 'Qualité certifiée' },
];

export function TrustSection() {
  const t = useTranslation();

  return (
    <section className="py-12 md:py-16 border-t border-border bg-muted/30">
      <div className="container">
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold">Technologies & Certifications</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Des produits conformes aux normes internationales les plus strictes
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 2500, stopOnInteraction: false })]} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {certifications.map((cert) => (
                <CarouselItem key={cert.id} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                  <div className="bg-background rounded-xl p-4 h-24 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-primary/30 transition-all duration-300 border border-border">
                    <h4 className="font-bold text-sm mb-1">{cert.name}</h4>
                    <p className="text-xs text-muted-foreground">{cert.description}</p>
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
