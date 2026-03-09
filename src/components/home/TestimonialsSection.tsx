import { Star, Quote } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    id: 1,
    name: 'Client vérifié',
    location: 'Parakou, Bénin',
    initials: 'CP',
    rating: 5,
    text: "Produit efficace. Mon moteur fait moins de bruit depuis que j'utilise l'additif Bardahl. Je recommande !",
  },
  {
    id: 2,
    name: 'Client vérifié',
    location: 'Cotonou, Bénin',
    initials: 'CC',
    rating: 5,
    text: "Livraison rapide et bon conseil WhatsApp. J'ai reçu ma commande en moins de 24h à Cotonou.",
  },
  {
    id: 3,
    name: 'Client vérifié',
    location: 'Abomey, Bénin',
    initials: 'CA',
    rating: 5,
    text: "J'ai trouvé l'huile adaptée grâce au diagnostic. Très pratique, merci Autopassion !",
  },
  {
    id: 4,
    name: 'Client vérifié',
    location: 'Porto-Novo, Bénin',
    initials: 'PN',
    rating: 5,
    text: "Excellente qualité des produits. Le traitement injecteur a nettement amélioré les performances de mon véhicule.",
  },
  {
    id: 5,
    name: 'Client vérifié',
    location: 'Parakou, Bénin',
    initials: 'PK',
    rating: 5,
    text: "Garagiste à Parakou, je ne jure que par les produits Bardahl. La technologie Polar Plus fait vraiment la différence.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-bold tracking-widest uppercase">TÉMOIGNAGES</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
            Ce que disent nos clients
          </h2>
        </div>

        <div className="relative">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:pl-6 basis-[90%] sm:basis-1/2 lg:basis-1/3">
                  <div className="bg-background rounded-2xl p-6 h-full shadow-card border border-border/50 relative">
                    <Quote className="absolute top-4 right-4 h-6 w-6 text-primary/20" />
                    
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-base">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>

                    <div className="flex gap-0.5 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>

                    <p className="text-base leading-relaxed text-foreground/80">
                      "{testimonial.text}"
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
            <CarouselNext className="-right-4 md:-right-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
