import { Truck, Package, RefreshCw, Clock } from 'lucide-react';

export default function LivraisonRetours() {
  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-4xl font-medium mb-8">Livraison & Retours</h1>

        {/* Shipping Options */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="h-6 w-6 text-rose" />
            <h2 className="font-serif text-2xl font-medium">Options de livraison</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Cotonou Express</h3>
                <span className="text-rose font-medium">1 500 FCFA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Livraison à domicile sous 24-48h à Cotonou et environs. 
                <strong className="text-green-600"> Gratuite dès 50 000 FCFA d'achat !</strong>
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Bénin Standard</h3>
                <span className="text-rose font-medium">2 500 FCFA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Livraison dans toutes les grandes villes du Bénin sous 2-4 jours ouvrés 
                (Porto-Novo, Parakou, Abomey-Calavi, Bohicon, etc.).
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Afrique de l'Ouest</h3>
                <span className="text-rose font-medium">À partir de 5 000 FCFA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Livraison au Togo, Niger, Burkina Faso, Côte d'Ivoire, Sénégal et autres pays 
                de la zone UEMOA sous 5-10 jours.
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Paiement à la livraison</h3>
                <span className="text-green-600 font-medium">Disponible</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Option disponible uniquement pour Cotonou et ses environs. 
                Payez en espèces ou Mobile Money à la réception.
              </p>
            </div>
          </div>
        </section>

        {/* Packaging */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-rose" />
            <h2 className="font-serif text-2xl font-medium">Emballage discret</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Toutes nos commandes sont expédiées dans un emballage neutre et discret, sans aucune mention 
            de la nature du contenu. Votre intimité est notre priorité. L'expéditeur indiqué est simplement 
            "CL Express".
          </p>
        </section>

        {/* Returns */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="h-6 w-6 text-rose" />
            <h2 className="font-serif text-2xl font-medium">Échanges & Retours</h2>
          </div>
          
          <div className="bg-rose-light p-4 rounded-lg mb-6">
            <p className="font-medium text-center">
              7 jours pour échanger votre article
            </p>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              <strong className="text-foreground">Conditions d'échange :</strong><br />
              Les articles doivent être retournés dans leur état d'origine, non portés, non lavés, 
              avec toutes les étiquettes attachées. Pour des raisons d'hygiène, les articles ayant 
              été portés ne peuvent être ni repris ni échangés.
            </p>

            <p className="leading-relaxed">
              <strong className="text-foreground">Procédure d'échange :</strong><br />
              1. Contactez-nous via WhatsApp au +229 01 97 00 00 00<br />
              2. Envoyez une photo de l'article et votre numéro de commande<br />
              3. Nous organisons la récupération de l'article<br />
              4. L'échange est effectué sous 48h après réception
            </p>

            <p className="leading-relaxed">
              <strong className="text-foreground">Remboursement :</strong><br />
              Le remboursement est effectué sous forme d'avoir ou via Mobile Money 
              dans un délai de 7 jours suivant la réception de votre retour.
            </p>
          </div>
        </section>

        {/* Tracking */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-rose" />
            <h2 className="font-serif text-2xl font-medium">Suivi de commande</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Un message WhatsApp de confirmation avec les détails de suivi vous est envoyé dès 
            l'expédition de votre colis. Notre équipe reste disponible pour vous informer de 
            l'avancement de votre livraison en temps réel.
          </p>
        </section>
      </div>
    </div>
  );
}
