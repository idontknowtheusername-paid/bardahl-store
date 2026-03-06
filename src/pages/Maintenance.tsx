import { Helmet } from 'react-helmet-async';
import { Wrench, Clock, Mail } from 'lucide-react';

export default function Maintenance() {
  return (
    <>
      <Helmet>
        <title>Site en maintenance | Autopassion BJ</title>
        <meta name="description" content="Notre site est actuellement en maintenance. Nous revenons bientôt avec de nouvelles fonctionnalités." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Illustration */}
          <div className="mb-8 animate-fade-in">
            <img 
              src="/maintenance.svg" 
              alt="Travaux en cours" 
              className="w-full max-w-md mx-auto"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/15 text-accent text-xs font-bold px-4 py-2 rounded-full mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Wrench className="h-4 w-4 animate-pulse" />
            Travaux en cours
          </div>

          {/* Titre */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Site en maintenance
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
            Nous travaillons actuellement sur de nouvelles fonctionnalités pour améliorer votre expérience. 
            Le site sera de retour très bientôt !
          </p>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
            <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Retour prévu</h3>
              <p className="text-xs text-muted-foreground">Très bientôt</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
              <Mail className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Besoin d'aide ?</h3>
              <p className="text-xs text-muted-foreground">
                <a href="tel:+22996786284" className="text-primary hover:underline">
                  +229 96 78 62 84
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '600ms' }}>
            Merci pour votre patience 🙏
          </p>
        </div>
      </div>
    </>
  );
}
