import { Star, Quote } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const testimonials = [
  {
    id: 1,
    name: 'Aïcha Mensah',
    location: 'Cotonou, Bénin',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "La qualité est exceptionnelle ! Je n'ai jamais porté de lingerie aussi confortable. La livraison était rapide et l'emballage très discret.",
  },
  {
    id: 2,
    name: 'Fatou Diallo',
    location: 'Dakar, Sénégal',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "Enfin une marque qui comprend les femmes africaines ! Les tailles sont parfaites et les matières sont douces. Je recommande à 100%.",
  },
  {
    id: 3,
    name: 'Amara Koné',
    location: 'Abidjan, Côte d\'Ivoire',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "J'ai offert un ensemble à ma femme, elle était ravie ! Le service client est très réactif et professionnel.",
  },
  {
    id: 4,
    name: 'Blessing Adeyemi',
    location: 'Lagos, Nigeria',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "Beautiful quality and fast delivery to Lagos. The packaging was so elegant and discreet. Will definitely order again!",
  },
  {
    id: 5,
    name: 'Mariama Touré',
    location: 'Lomé, Togo',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "Les nuisettes sont magnifiques et très élégantes. Je me sens belle et confiante. Merci pour cette qualité premium !",
  },
  {
    id: 6,
    name: 'Adama Ouédraogo',
    location: 'Ouagadougou, Burkina Faso',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "Service impeccable du début à la fin. Les produits correspondent parfaitement aux photos. Je suis cliente fidèle maintenant !",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-medium">
            Ce que disent nos clientes
          </h2>
        </div>

        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:pl-6 basis-[90%] sm:basis-1/2 lg:basis-1/3">
                <div className="bg-background rounded-2xl p-5 h-full shadow-sm border border-border/50 relative">
                  <Quote className="absolute top-3 right-3 h-6 w-6 text-rose-light" />
                  
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-rose-light"
                    />
                    <div>
                      <h4 className="font-serif font-medium text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-0.5 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90 line-clamp-4">
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
