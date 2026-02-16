import { Helmet } from 'react-helmet-async';
import { Heart, Award, Truck, Users } from 'lucide-react';

export default function About() {
  return (
    <>
      <Helmet>
        <title>À Propos | Bardahl</title>
        <meta name="description" content="Découvrez l'histoire de Bardahl, notre passion pour les produits automobiles de qualité et notre engagement envers nos clients." />
      </Helmet>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-rose/10 to-background">
          <div className="container text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-6">
              À Propos de <span className="text-rose">Bardahl</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Votre partenaire de confiance pour l'entretien et la performance de votre véhicule.
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
                    Bardahl est une marque reconnue mondialement pour ses produits automobiles de haute qualité.
                    Fondée avec une passion pour l'excellence, notre mission est de fournir des solutions
                    d'entretien et de performance pour tous types de véhicules.
                  </p>
                  <p>
                    Nous croyons que chaque véhicule mérite les meilleurs soins,
                    c'est pourquoi nous développons des produits innovants qui allient
                    performance, protection et durabilité.
                  </p>
                  <p>
                    Notre engagement : vous offrir des produits de qualité supérieure
                    qui prolongent la vie de votre moteur et optimisent ses performances.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/Bardahl_idiSpcDptj_1.svg"
                  alt="Bardahl Logo"
                  className="rounded-2xl shadow-2xl w-full object-contain aspect-square p-8 bg-white"
                />
                <div className="absolute -bottom-6 -left-6 bg-rose text-white p-6 rounded-xl shadow-lg">
                  <p className="font-serif text-2xl font-medium">100%</p>
                  <p className="text-sm">Qualité Premium</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nos Valeurs */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground text-center mb-12">
              Nos Valeurs
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Heart,
                  title: 'Passion',
                  description: 'Nous mettons tout notre cœur dans le développement de chaque produit.',
                },
                {
                  icon: Award,
                  title: 'Qualité',
                  description: 'Des formules premium pour une protection et une performance exceptionnelles.',
                },
                {
                  icon: Truck,
                  title: 'Service',
                  description: 'Livraison rapide et service client attentif à vos besoins.',
                },
                {
                  icon: Users,
                  title: 'Communauté',
                  description: 'Une relation de confiance avec nos clients fidèles.',
                },
              ].map((value, index) => (
                <div 
                  key={index}
                  className="bg-background p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-rose" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pourquoi Nous Choisir */}
        <section className="py-16 md:py-24">
          <div className="container">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground text-center mb-12">
              Pourquoi Nous Choisir ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Large Gamme',
                  description: 'Des huiles moteur aux additifs, trouvez le produit parfait pour votre véhicule.',
                },
                {
                  title: 'Prix Compétitifs',
                  description: 'La qualité premium à des prix justes, pour tous les budgets.',
                },
                {
                  title: 'Paiement Sécurisé',
                  description: 'Mobile Money et autres méthodes de paiement sécurisées disponibles.',
                },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="p-6 border border-border rounded-xl hover:border-rose/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-rose text-white rounded-full flex items-center justify-center font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-rose text-white">
          <div className="container text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-6">
              Prêt à Découvrir Notre Gamme ?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Explorez notre sélection de produits et trouvez celui qui correspond à votre véhicule.
            </p>
            <a 
              href="/collections"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-rose font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              Voir les Collections
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
