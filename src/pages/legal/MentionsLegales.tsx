export default function MentionsLegales() {
  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-4xl font-medium mb-8">Mentions Légales</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium mb-4">Éditeur du site</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cannesh Lingerie<br />
              Société à Responsabilité Limitée (SARL)<br />
              Capital social : 1 000 000 FCFA<br />
              Siège social : Quartier Zongo, Cotonou, Bénin<br />
              RCCM : RB/COT/24 B 12345<br />
              IFU : 3202400000000
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium mb-4">Directeur de la publication</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cannesh SARL, Gérante de Cannesh Lingerie
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium mb-4">Hébergement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site est hébergé par :<br />
              Lovable Technologies<br />
              San Francisco, CA, États-Unis
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium mb-4">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Email : contact@cannesh-lingerie.com<br />
              Téléphone : +229 01 97 00 00 00<br />
              WhatsApp : +229 01 97 00 00 00
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium mb-4">Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble des contenus (textes, images, logos, vidéos) présents sur ce site sont protégés 
              par le droit d'auteur et sont la propriété exclusive de Cannesh Lingerie ou de ses partenaires. 
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des 
              éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sauf autorisation 
              écrite préalable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
