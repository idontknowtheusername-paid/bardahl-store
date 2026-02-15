export default function PolitiqueConfidentialite() {
  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-4xl font-medium mb-8">Politique de Confidentialité</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">1. Collecte des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bardahl collecte des données personnelles lors de votre navigation sur notre site, 
              de la création de votre compte, de vos commandes et de vos échanges avec notre service client. 
              Les données collectées incluent : nom, prénom, adresse email, adresse de livraison, numéro de téléphone 
              et WhatsApp, historique de commandes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">2. Utilisation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données personnelles sont utilisées pour :<br />
              - Traiter et suivre vos commandes<br />
              - Gérer votre compte client<br />
              - Vous contacter via WhatsApp pour le suivi de commande<br />
              - Vous envoyer des informations sur nos produits et offres (avec votre consentement)<br />
              - Améliorer notre site et nos services
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">3. Protection des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bardahl met en œuvre des mesures techniques et organisationnelles appropriées 
              pour protéger vos données personnelles contre tout accès non autorisé, toute modification, 
              divulgation ou destruction. Les paiements Mobile Money sont sécurisés par les opérateurs.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">4. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Notre site utilise des cookies pour améliorer votre expérience de navigation, analyser 
              le trafic et personnaliser le contenu. Vous pouvez gérer vos préférences de cookies 
              à tout moment via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">5. Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à la loi béninoise sur la protection des données personnelles, vous disposez 
              des droits suivants :<br />
              - Droit d'accès à vos données<br />
              - Droit de rectification<br />
              - Droit à l'effacement<br />
              - Droit d'opposition<br /><br />
              Pour exercer ces droits, contactez-nous à : contact@bardahl.com
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">6. Conservation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont conservées pendant la durée nécessaire à la réalisation des finalités 
              pour lesquelles elles ont été collectées, et conformément aux obligations légales béninoises.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question relative à cette politique de confidentialité, vous pouvez nous 
              contacter :<br />
              - Email : contact@bardahl.com<br />
              - WhatsApp : +229 01 97 00 00 00
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
