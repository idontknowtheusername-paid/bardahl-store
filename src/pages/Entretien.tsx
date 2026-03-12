import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Wrench, Droplets, Shield, Fuel, Cog, Thermometer, Pipette, Sparkles, Wind } from 'lucide-react';
import { PacksCarousel } from '@/components/product/PacksCarousel';

const maintenanceSections = [
  {
    id: 'vidange-moteur',
    title: 'Faire la vidange moteur',
    description: 'Huiles moteur haute performance pour protéger votre moteur',
    icon: Droplets,
    href: '/categories/huiles-moteur',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'vidange-boite',
    title: 'Vidange boîte & transmission',
    description: 'Huiles de transmission et liquides de frein',
    icon: Cog,
    href: '/categories/transmission',
    color: 'bg-accent/10 text-accent',
  },
  {
    id: 'nettoyer-moteur',
    title: 'Nettoyer le moteur',
    description: 'Nettoyants injecteurs, turbo et circuit d\'huile',
    icon: Sparkles,
    href: '/categories/additifs',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'proteger-moteur',
    title: 'Protéger le moteur',
    description: 'Additifs de protection et anti-usure',
    icon: Shield,
    href: '/categories/additifs',
    color: 'bg-accent/10 text-accent',
  },
  {
    id: 'consommation',
    title: 'Réduire consommation carburant',
    description: 'Additifs carburant et nettoyants système',
    icon: Fuel,
    href: '/categories/additifs',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'reduire-fumee',
    title: 'Réduire la fumée',
    description: 'Additifs anti-fumée et nettoyants FAP/EGR',
    icon: Wind,
    href: '/categories/additifs',
    color: 'bg-accent/10 text-accent',
  },
  {
    id: 'radiateur',
    title: 'Vidange radiateur',
    description: 'Liquides de refroidissement et antigel',
    icon: Thermometer,
    href: '/categories/liquides',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'fuites',
    title: 'Réparer les fuites',
    description: 'Stop-fuites moteur, boîte et radiateur',
    icon: Pipette,
    href: '/categories/additifs',
    color: 'bg-accent/10 text-accent',
  },
  {
    id: 'confort',
    title: 'Confort & désodorisant',
    description: 'Purifiants, désodorisants et nettoyants habitacle',
    icon: Sparkles,
    href: '/categories/entretien',
    color: 'bg-primary/10 text-primary',
  },
];

export default function Entretien() {
  return (
    <>
      <SEOHead
        title="Entretien Véhicule | Autopassion BJ - Guide complet"
        description="Entretenir son moteur coûte moins cher que le réparer. Découvrez nos solutions d'entretien automobile : vidange, nettoyage, protection et maintenance."
        keywords="entretien véhicule, vidange moteur, maintenance auto, protection moteur, autopassion, bénin"
        url="/entretien"
      />

      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground py-12 md:py-16">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-accent/15 text-accent text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Wrench className="h-3.5 w-3.5" />
            Entretien véhicule
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Entretenir son moteur coûte moins cher que le réparer.
          </h1>
          <p className="text-secondary-foreground/70 text-lg max-w-lg mx-auto">
            Découvrez nos solutions de maintenance préventive pour prolonger la durée de vie de votre véhicule.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {maintenanceSections.map((section, index) => (
              <Link
                key={section.id}
                to={section.href}
                className="group bg-card border border-border rounded-xl p-4 md:p-6 hover-lift animate-fade-in transition-all hover:border-primary/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 ${section.color}`}>
                  <section.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 md:mb-2 group-hover:text-primary transition-colors">{section.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{section.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Packs recommandés */}
      <PacksCarousel />
    </>
  );
}
