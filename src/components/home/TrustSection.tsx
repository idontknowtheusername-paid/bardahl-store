import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

const partners = [
  {
    id: 1,
    name: 'MTN Bénin',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
  },
  {
    id: 2,
    name: 'Moov Africa',
    logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=100&fit=crop',
  },
  {
    id: 3,
    name: 'Wave',
    logo: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=200&h=100&fit=crop',
  },
  {
    id: 4,
    name: 'Orange Money',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop',
  },
  {
    id: 5,
    name: 'DHL Express',
    logo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=100&fit=crop',
  },
  {
    id: 6,
    name: 'Fedex',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&h=100&fit=crop',
  },
  {
    id: 7,
    name: 'Ecobank',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&h=100&fit=crop',
  },
  {
    id: 8,
    name: 'UBA',
    logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200&h=100&fit=crop',
  },
  {
    id: 9,
    name: 'Visa',
    logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=100&fit=crop',
  },
  {
    id: 10,
    name: 'Mastercard',
    logo: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=200&h=100&fit=crop',
  },
  {
    id: 11,
    name: 'Kkiapay',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=100&fit=crop',
  },
  {
    id: 12,
    name: 'Flooz',
    logo: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=200&h=100&fit=crop',
  },
];

export function TrustSection() {
  return (
    <section className="py-16 md:py-24 border-t border-border bg-muted/30">
      <div className="container">
        {/* Partners Section */}
        <div>
          <div className="text-center mb-12">
            <h3 className="font-serif text-2xl md:text-3xl font-medium">
              Nos partenaires
            </h3>
            <p className="text-muted-foreground mt-2">
              Ils nous accompagnent au quotidien
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 2500,
                  stopOnInteraction: false,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {partners.map((partner) => (
                  <CarouselItem key={partner.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                    <div className="bg-background rounded-xl p-6 h-28 flex items-center justify-center text-center hover:shadow-md hover:scale-105 transition-all duration-300 border border-border">
                      <h4 className="font-medium text-sm">{partner.name}</h4>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
