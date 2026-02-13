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
    name: 'Jean-Pierre M.',
    location: 'Paris, France',
    initials: 'JP',
    rating: 5,
    text: "J'utilise Bardahl XTC C60 depuis 2 ans, mon moteur n'a jamais été aussi silencieux. La différence se sent dès les premiers kilomètres.",
  },
  {
    id: 2,
    name: 'Kofi A.',
    location: 'Cotonou, Bénin',
    initials: 'KA',
    rating: 5,
    text: "Les additifs Bardahl ont redonné vie à mon moteur diesel. Consommation réduite et démarrage plus facile. Je recommande fortement !",
  },
  {
    id: 3,
    name: 'Mamadou D.',
    location: 'Dakar, Sénégal',
    initials: 'MD',
    rating: 5,
    text: "Excellente qualité, livraison rapide. Le traitement Bardahl a nettement amélioré les performances de mon véhicule.",
  },
  {
    id: 4,
    name: 'Thomas R.',
    location: 'Lyon, France',
    initials: 'TR',
    rating: 5,
    text: "Garagiste depuis 20 ans, je ne jure que par Bardahl. La technologie Polar Plus fait vraiment la différence sur la longévité des moteurs.",
  },
  {
    id: 5,
    name: 'Fatou S.',
    location: 'Abidjan, Côte d\'Ivoire',
    initials: 'FS',
    rating: 5,
    text: "Première commande et déjà convaincue. L'additif pour carburant a fait disparaître les à-coups de mon moteur. Merci Bardahl !",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-bardahl-light">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            Nos clients témoignent
          </h2>
        </div>

        <div className="relative">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:pl-6 basis-[90%] sm:basis-1/2 lg:basis-1/3">
                  <div className="bg-background rounded-2xl p-6 h-full shadow-card border border-border/50 relative">
                    <Quote className="absolute top-4 right-4 h-6 w-6 text-primary/20" />
                    
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-sm">{testimonial.name}</h4>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>

                    <div className="flex gap-0.5 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>

                    <p className="text-sm leading-relaxed text-foreground/80">
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
