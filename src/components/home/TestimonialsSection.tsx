import { Star, Quote, BadgeCheck } from 'lucide-react';
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
    name: 'Koffi Mensah',
    location: 'Parakou, Bénin',
    initials: 'KM',
    rating: 5,
    verified: true,
    text: "Produit efficace. Mon moteur fait moins de bruit depuis que j'utilise l'additif Bardahl. Je recommande !",
  },
  {
    id: 2,
    name: 'Adjovi Sossou',
    location: 'Cotonou, Bénin',
    initials: 'AS',
    rating: 5,
    verified: true,
    text: "Livraison rapide et bon conseil WhatsApp. J'ai reçu ma commande en moins de 24h à Cotonou.",
  },
  {
    id: 3,
    name: 'Yémalin Dossou',
    location: 'Abomey, Bénin',
    initials: 'YD',
    rating: 5,
    verified: true,
    text: "J'ai trouvé l'huile adaptée grâce au diagnostic. Très pratique, merci Autopassion !",
  },
  {
    id: 4,
    name: 'Rachidatou Alabi',
    location: 'Porto-Novo, Bénin',
    initials: 'RA',
    rating: 5,
    verified: true,
    text: "Excellente qualité des produits. Le traitement injecteur a nettement amélioré les performances de mon véhicule.",
  },
  {
    id: 5,
    name: 'Sèmèvo Agbodjan',
    location: 'Parakou, Bénin',
    initials: 'SA',
    rating: 5,
    verified: true,
    text: "Garagiste à Parakou, je ne jure que par les produits Bardahl. La technologie Polar Plus fait vraiment la différence.",
  },
  {
    id: 6,
    name: 'Faridath Koudjo',
    location: 'Bohicon, Bénin',
    initials: 'FK',
    rating: 5,
    verified: true,
    text: "Service client au top ! Ils m'ont aidé à choisir la bonne huile pour ma Toyota. Mon moteur tourne comme neuf.",
  },
  {
    id: 7,
    name: 'Honoré Gbaguidi',
    location: 'Cotonou, Bénin',
    initials: 'HG',
    rating: 5,
    verified: true,
    text: "Je commande régulièrement pour mon taxi. Les prix sont corrects et la qualité est toujours au rendez-vous.",
  },
  {
    id: 8,
    name: 'Nadège Houngbo',
    location: 'Calavi, Bénin',
    initials: 'NH',
    rating: 5,
    verified: true,
    text: "Très satisfaite de ma première commande. Le nettoyant moteur a vraiment fait des miracles sur ma voiture.",
  },
  {
    id: 9,
    name: 'Djimon Akpovi',
    location: 'Parakou, Bénin',
    initials: 'DA',
    rating: 5,
    verified: true,
    text: "Produits authentiques et conseils professionnels. Je recommande vivement Autopassion à tous les automobilistes.",
  },
  {
    id: 10,
    name: 'Sylvie Ahouandjinou',
    location: 'Abomey-Calavi, Bénin',
    initials: 'SA',
    rating: 5,
    verified: true,
    text: "Le diagnostic en ligne m'a permis d'identifier le problème de ma voiture. Produit reçu rapidement, problème résolu !",
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
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-base">{testimonial.name}</h4>
                          {testimonial.verified && (
                            <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                          )}
                        </div>
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
