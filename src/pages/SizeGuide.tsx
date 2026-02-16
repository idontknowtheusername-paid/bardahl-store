import { Helmet } from 'react-helmet-async';
import { Wrench, Info, Car, Fuel, Settings } from 'lucide-react';

const productGuides = {
  motorOils: {
    title: 'Huiles Moteur',
    icon: Car,
    headers: ['Viscosité', 'Type de moteur', 'Spécifications'],
    rows: [
      ['5W-30', 'Essence & Diesel moderne', 'API SN, ACEA A3/B4'],
      ['10W-40', 'Essence & Diesel classique', 'API SL, ACEA A3/B3'],
      ['15W-40', 'Diesel lourd & industriel', 'API CI-4, ACEA E7'],
      ['0W-20', 'Essence moderne (Eco)', 'API SP, ACEA C5'],
      ['5W-40', 'Haute performance', 'API SN Plus, ACEA A3/B4'],
    ],
  },
  additives: {
    title: 'Additifs & Traitements',
    icon: Fuel,
    headers: ['Type', 'Application', 'Bénéfices'],
    rows: [
      ['Additif moteur', 'Huile moteur', 'Réduction friction, protection'],
      ['Nettoyant injecteurs', 'Carburant', 'Décalaminage, économie'],
      ['Traitement diesel', 'Gazole', 'Antigel, lubrification'],
      ['Additif boîte', 'Boîte automatique', 'Fluidité, protection'],
      ['Traitement freins', 'Liquide frein', 'Anti-humidité, performance'],
    ],
  },
  maintenance: {
    title: 'Produits d\'Entretien',
    icon: Settings,
    headers: ['Produit', 'Utilisation', 'Fréquence'],
    rows: [
      ['Liquide refroidissement', 'Circuit refroidissement', 'Tous les 2 ans'],
      ['Liquide frein DOT4', 'Système freinage', 'Tous les 2 ans'],
      ['Huile direction', 'Direction assistée', 'Tous les 60 000 km'],
      ['Graisse universelle', 'Châssis, cardans', 'Selon usure'],
      ['Nettoyant freins', 'Disques & plaquettes', 'À chaque entretien'],
    ],
  },
};

export default function SizeGuide() {
  return (
    <>
      <Helmet>
        <title>Guide de Sélection | Bardahl</title>
        <meta name="description" content="Trouvez le produit adapté à votre véhicule grâce à notre guide de sélection détaillé." />
      </Helmet>

      <main className="min-h-screen py-12 md:py-20">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose/10 rounded-full mb-6">
              <Wrench className="w-8 h-8 text-rose" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-4">
              Guide de Sélection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choisissez le produit Bardahl adapté à votre véhicule pour une performance optimale et une protection maximale.
            </p>
          </div>

          {/* Comment choisir */}
          <section className="bg-muted/50 rounded-2xl p-6 md:p-8 mb-12">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 flex items-center gap-2">
              <Info className="w-6 h-6 text-rose" />
              Comment Choisir le Bon Produit
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">1. Consultez le manuel</h3>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez les spécifications recommandées par le constructeur (viscosité, normes API/ACEA).
                  </p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">2. Type de moteur</h3>
                  <p className="text-sm text-muted-foreground">
                    Essence, diesel, hybride ou électrique ? Chaque type a des besoins spécifiques.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">3. Conditions d'utilisation</h3>
                  <p className="text-sm text-muted-foreground">
                    Ville, autoroute, climat chaud ou froid ? Adaptez le produit à votre usage.
                  </p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">4. Kilométrage</h3>
                  <p className="text-sm text-muted-foreground">
                    Les véhicules à fort kilométrage peuvent nécessiter des produits spécifiques.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-rose/10 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Conseil :</strong> Utilisez notre sélecteur d'huile intelligent sur la page d'accueil
                pour une recommandation personnalisée basée sur votre véhicule.
              </p>
            </div>
          </section>

          {/* Guides produits */}
          <div className="space-y-12">
            {Object.entries(productGuides).map(([key, guide]) => {
              const Icon = guide.icon;
              return (
                <section key={key}>
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="w-6 h-6 text-rose" />
                    <h2 className="font-serif text-2xl font-medium text-foreground">
                      {guide.title}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          {guide.headers.map((header, index) => (
                            <th
                              key={index}
                              className="text-left p-4 font-medium text-foreground border-b border-border"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {guide.rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className={`p-4 border-b border-border ${cellIndex === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Conseils */}
          <section className="mt-12 bg-gradient-to-br from-rose/10 to-transparent rounded-2xl p-6 md:p-8">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
              Nos Conseils Techniques
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">•</span>
                <span>Respectez toujours les intervalles de vidange recommandés par le constructeur.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">•</span>
                <span>Utilisez des produits compatibles avec les normes spécifiées dans votre manuel.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">•</span>
                <span>Pour les véhicules anciens, privilégiez les huiles minérales ou semi-synthétiques.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">•</span>
                <span>En climat extrême, adaptez la viscosité (0W-XX pour froid, 15W-XX pour chaud).</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Besoin d'un conseil personnalisé pour votre véhicule ?
            </p>
            <a 
              href="https://wa.me/22901970000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactez-nous sur WhatsApp
            </a>
          </section>
        </div>
      </main>
    </>
  );
}
