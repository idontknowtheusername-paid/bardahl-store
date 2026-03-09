import { SEOHead } from '@/components/SEOHead';
import { StructuredData } from '@/components/StructuredData';
import { Heart, Award, Truck, Users, Car, Wrench, Stethoscope, BookOpen } from 'lucide-react';

export default function About() {
  return (
    <>
      <SEOHead
        title="À Propos | Autopassion BJ - Distributeur Bardahl au Bénin"
        description="Autopassion BJ, votre distributeur officiel Bardahl au Bénin. Huiles moteur, additifs et produits d'entretien automobile de qualité à Parakou."
        keywords="autopassion bj, bardahl bénin, distributeur bardahl, huiles moteur, parakou"
        url="/about"
      />
      <StructuredData type="organization" />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-6">
              À Propos d'<span className="text-primary">Autopassion BJ</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Votre plateforme automobile digitale au Bénin — e-commerce, diagnostic intelligent et carnet d'entretien numérique.
            </p>
          </div>
        </section>

        {/* Notre Histoire */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-6">
                  Notre Histoire
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Autopassion BJ est né de la volonté de moderniser l'entretien automobile au Bénin.
                    Basés à Parakou, nous avons créé une plateforme digitale complète qui simplifie
                    l'accès aux produits d'entretien de qualité et aux services automobiles.
                  </p>
                  <p>
                    Notre mission : offrir à chaque automobiliste béninois les outils et produits
                    nécessaires pour comprendre et prendre soin de son véhicule — huiles moteur, additifs,
                    graisses, liquides de refroidissement et bien plus.
                  </p>
                  <p>
                    Grâce à notre diagnostic intelligent par IA, notre carnet d'entretien digital
                    et notre boutique en ligne, nous accompagnons nos clients à chaque étape de
                    la vie de leur véhicule.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl shadow-2xl w-full aspect-square p-8 bg-secondary flex flex-col items-center justify-center gap-4">
                  <Car className="w-24 h-24 text-accent" />
                  <p className="text-2xl font-bold text-white">Autopassion BJ</p>
                  <p className="text-white/70 text-center text-sm">Plateforme automobile digitale<br />Parakou, Bénin</p>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                  <p className="font-serif text-2xl font-medium">100%</p>
                  <p className="text-sm">Made in Bénin</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nos Services */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground text-center mb-12">
              Nos Services
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Car,
                  title: 'Boutique Auto',
                  description: 'Huiles moteur, additifs, graisses et produits d\'entretien de marques reconnues.',
                },
                {
                  icon: Stethoscope,
                  title: 'Diagnostic IA',
                  description: 'Analysez les symptômes de votre véhicule grâce à notre assistant intelligent.',
                },
                {
                  icon: BookOpen,
                  title: 'Carnet Digital',
                  description: 'Suivez l\'entretien de vos véhicules avec un carnet numérique complet.',
                },
                {
                  icon: Wrench,
                  title: 'Conseils Expert',
                  description: 'Trouvez l\'huile adaptée à votre moteur avec notre sélecteur intelligent.',
                },
              ].map((service, index) => (
                <div 
                  key={index}
                  className="bg-background p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nos Valeurs */}
        <section className="py-16 md:py-24">
          <div className="container">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground text-center mb-12">
              Nos Valeurs
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: 'Passion',
                  description: 'L\'automobile est notre passion. Nous mettons tout notre cœur au service de vos véhicules.',
                },
                {
                  icon: Award,
                  title: 'Qualité',
                  description: 'Nous sélectionnons uniquement des produits de marques reconnues pour leur fiabilité.',
                },
                {
                  icon: Users,
                  title: 'Proximité',
                  description: 'Un service client humain et réactif, disponible par WhatsApp et téléphone.',
                },
              ].map((value, index) => (
                <div 
                  key={index}
                  className="p-6 border border-border rounded-xl hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4">
                    <value.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-6">
              Prêt à Prendre Soin de Votre Véhicule ?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Explorez notre boutique, lancez un diagnostic ou créez votre carnet d'entretien digital.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="/categories"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                Voir la Boutique
              </a>
              <a 
                href="/diagnostic"
                className="inline-flex items-center justify-center px-8 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Lancer un Diagnostic
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
