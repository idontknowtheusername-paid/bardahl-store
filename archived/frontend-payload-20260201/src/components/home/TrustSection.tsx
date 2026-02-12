import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const celebrities = [
  {
    id: 1,
    name: 'Angélique Kidjo',
    role: 'Artiste internationale',
    country: 'Bénin',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Adekunle Gold',
    role: 'Chanteur',
    country: 'Nigeria',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Coumba Gawlo',
    role: 'Chanteuse',
    country: 'Sénégal',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Josey',
    role: 'Artiste',
    country: 'Côte d\'Ivoire',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: 5,
    name: 'Zeynab',
    role: 'Chanteuse',
    country: 'Bénin',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop&crop=face',
  },
];

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
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container">
        {/* Celebrities Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-medium">
              Ils nous font confiance
            </h2>
          </div>

          <div className="relative">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: false,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {celebrities.map((celebrity) => (
                  <CarouselItem key={celebrity.id} className="pl-4 md:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <div className="text-center group">
                    <div className="relative mb-4 mx-auto w-24 h-24 md:w-28 md:h-28">
                      <img
                        src={celebrity.image}
                        alt={celebrity.name}
                        className="w-full h-full rounded-full object-cover border-3 border-rose-light group-hover:border-rose transition-colors duration-300"
                      />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                        {celebrity.country}
                      </div>
                    </div>
                    <h4 className="font-serif font-medium text-sm md:text-base">{celebrity.name}</h4>
                    <p className="text-xs text-muted-foreground">{celebrity.role}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 md:-left-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
              <CarouselNext className="hidden md:flex -right-4 md:-right-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
          </Carousel>
          </div>
        </div>

        {/* Partners Section */}
        <div>
          <div className="text-center mb-10">
            <h3 className="font-serif text-2xl md:text-3xl font-medium">
              Nos partenaires
            </h3>
          </div>

          <div className="relative">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3500,
                  stopOnInteraction: false,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {partners.map((partner) => (
                  <CarouselItem key={partner.id} className="pl-4 md:pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4">
                    <div className="bg-muted/50 rounded-xl p-4 h-24 flex items-center justify-center text-center hover:bg-muted transition-colors duration-300">
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
