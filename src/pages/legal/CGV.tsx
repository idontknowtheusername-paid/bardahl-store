export default function CGV() {
  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-4xl font-medium mb-8">Conditions Générales de Vente</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">Article 1 - Objet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes conditions générales de vente régissent les relations contractuelles entre 
              Cannesh Lingerie et ses clients, dans le cadre de la vente de produits de lingerie via le 
              site internet cannesh-lingerie.com.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">Article 2 - Prix</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les prix de nos produits sont indiqués en Francs CFA (FCFA), toutes taxes comprises. 
              Les frais de livraison sont indiqués avant validation de la commande et varient selon 
              la zone de livraison au Bénin et en Afrique de l'Ouest.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">Article 3 - Commandes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le client peut passer commande sur le site internet 24h/24 et 7j/7, ou via WhatsApp. 
              La validation de la commande par le client vaut acceptation des prix et descriptions 
              des produits disponibles à la vente ainsi que des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">Article 4 - Paiement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le paiement s'effectue par :<br />
              - Mobile Money (MTN MoMo, Moov Money)<br />
              - Virement bancaire<br />
              - Paiement à la livraison (Cotonou et environs uniquement)<br />
              La commande est validée après réception du paiement ou confirmation pour les paiements 
              à la livraison.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">Article 5 - Livraison</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les produits sont livrés à l'adresse de livraison indiquée lors de la commande.<br />
              - Cotonou : 24-48h, à partir de 1 000 FCFA<br />
              - Autres villes du Bénin : 2-4 jours, à partir de 2 000 FCFA<br />
              - Afrique de l'Ouest : 5-10 jours, tarif selon destination<br />
              Livraison gratuite dès 50 000 FCFA d'achat à Cotonou.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">Article 6 - Échanges et Retours</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vous disposez d'un délai de 7 jours à compter de la réception de votre commande pour 
              demander un échange. Les articles doivent être retournés dans leur état d'origine, 
              non portés et non lavés, avec leurs étiquettes. Les frais de retour sont à la charge 
              du client sauf en cas de défaut du produit.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">Article 7 - Garanties</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tous nos produits bénéficient d'une garantie contre les défauts de fabrication. 
              En cas de produit défectueux, nous procédons à un échange ou un remboursement 
              selon votre préférence.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium mb-4">Article 8 - Service client</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question ou réclamation, notre service client est disponible :<br />
              - Par WhatsApp : +229 01 97 00 00 00 (du lundi au samedi de 8h à 20h)<br />
              - Par email : contact@cannesh-lingerie.com<br />
              - Par téléphone : +229 01 97 00 00 00
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
