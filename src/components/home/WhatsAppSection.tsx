import { MessageCircle, ArrowRight } from 'lucide-react';

export function WhatsAppSection() {
  const whatsappUrl = `https://wa.me/22996786284?text=${encodeURIComponent("Bonjour, j'aimerais un conseil pour mon véhicule. Marque : , Modèle : , Problème : ")}`;

  return (
    <section className="py-16 md:py-20 bg-green-600 text-white">
      <div className="container text-center">
        <div className="max-w-2xl mx-auto">
          <MessageCircle className="h-14 w-14 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Besoin d'un conseil pour votre voiture ?
          </h2>
          <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8">
            Envoyez-nous la marque, le modèle et le problème de votre voiture.
            <br />
            Nous vous recommandons la solution adaptée.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-green-700 font-bold text-lg px-8 py-4 rounded-full shadow-xl hover:bg-white/90 transition-all group"
          >
            <MessageCircle className="h-6 w-6" />
            Commandez sur WhatsApp
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
