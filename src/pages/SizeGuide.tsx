import { Helmet } from 'react-helmet-async';
import { Ruler, Info } from 'lucide-react';

const sizeTables = {
  soutiensGorge: {
    title: 'Soutiens-gorge',
    headers: ['Taille', 'Tour de poitrine', 'Tour de dos'],
    rows: [
      ['XS / 85A', '78-82 cm', '68-72 cm'],
      ['S / 90B', '83-87 cm', '73-77 cm'],
      ['M / 95C', '88-92 cm', '78-82 cm'],
      ['L / 100D', '93-97 cm', '83-87 cm'],
      ['XL / 105E', '98-102 cm', '88-92 cm'],
    ],
  },
  culottes: {
    title: 'Culottes & Strings',
    headers: ['Taille', 'Tour de hanches', 'Tour de taille'],
    rows: [
      ['XS / 34', '84-88 cm', '60-64 cm'],
      ['S / 36', '88-92 cm', '64-68 cm'],
      ['M / 38', '92-96 cm', '68-72 cm'],
      ['L / 40', '96-100 cm', '72-76 cm'],
      ['XL / 42', '100-104 cm', '76-80 cm'],
    ],
  },
  bonnets: {
    title: 'Bonnets',
    headers: ['Bonnet', 'Différence poitrine - dos'],
    rows: [
      ['A', '12-14 cm'],
      ['B', '14-16 cm'],
      ['C', '16-18 cm'],
      ['D', '18-20 cm'],
      ['E', '20-22 cm'],
    ],
  },
};

export default function SizeGuide() {
  return (
    <>
      <Helmet>
        <title>Guide des Tailles | Cannesh Lingerie</title>
        <meta name="description" content="Trouvez votre taille parfaite grâce à notre guide des tailles détaillé pour soutiens-gorge, culottes et ensembles." />
      </Helmet>

      <main className="min-h-screen py-12 md:py-20">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose/10 rounded-full mb-6">
              <Ruler className="w-8 h-8 text-rose" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-4">
              Guide des Tailles
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trouvez votre taille parfaite en quelques étapes simples. 
              Un bon ajustement est essentiel pour votre confort au quotidien.
            </p>
          </div>

          {/* Comment prendre ses mesures */}
          <section className="bg-muted/50 rounded-2xl p-6 md:p-8 mb-12">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 flex items-center gap-2">
              <Info className="w-6 h-6 text-rose" />
              Comment Prendre Vos Mesures
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Tour de Poitrine</h3>
                  <p className="text-sm text-muted-foreground">
                    Mesurez autour de la partie la plus forte de votre poitrine, 
                    en passant le mètre ruban sous les aisselles et sur les omoplates.
                  </p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Tour de Dos</h3>
                  <p className="text-sm text-muted-foreground">
                    Mesurez juste en dessous de votre poitrine, là où se place 
                    la bande du soutien-gorge.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Tour de Taille</h3>
                  <p className="text-sm text-muted-foreground">
                    Mesurez à l'endroit le plus étroit de votre taille, 
                    généralement au niveau du nombril.
                  </p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Tour de Hanches</h3>
                  <p className="text-sm text-muted-foreground">
                    Mesurez autour de la partie la plus large de vos hanches, 
                    en passant par le point le plus fort des fesses.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-rose/10 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Conseil :</strong> Prenez vos mesures en sous-vêtements fins ou nue, 
                debout et détendue. Le mètre ruban doit être bien à plat, sans serrer.
              </p>
            </div>
          </section>

          {/* Tableaux de tailles */}
          <div className="space-y-12">
            {Object.entries(sizeTables).map(([key, table]) => (
              <section key={key}>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
                  {table.title}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        {table.headers.map((header, index) => (
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
                      {table.rows.map((row, rowIndex) => (
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
            ))}
          </div>

          {/* Conseils */}
          <section className="mt-12 bg-gradient-to-br from-rose/10 to-transparent rounded-2xl p-6 md:p-8">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
              Nos Conseils
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">•</span>
                <span>Si vous êtes entre deux tailles, optez pour la taille supérieure pour plus de confort.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">•</span>
                <span>Les tailles peuvent varier légèrement selon les modèles et les matières.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">•</span>
                <span>Pour les soutiens-gorge, la bande doit être parallèle au sol et ne pas remonter dans le dos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">•</span>
                <span>Un soutien-gorge bien ajusté ne doit ni serrer ni laisser des marques.</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Besoin d'aide pour trouver votre taille ?
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
