import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Stethoscope, ArrowRight, Fuel, Gauge, Flame, Activity, Zap, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const symptoms = [
  { id: 'fumee-noire', label: 'Fumée noire', icon: Flame, description: 'Fumée noire à l\'échappement' },
  { id: 'perte-puissance', label: 'Perte de puissance', icon: Gauge, description: 'Le moteur manque de puissance' },
  { id: 'consommation', label: 'Consommation élevée', icon: Fuel, description: 'Surconsommation de carburant' },
  { id: 'vibrations', label: 'Moteur qui tremble', icon: Activity, description: 'Vibrations ou tremblements' },
  { id: 'demarrage', label: 'Démarrage difficile', icon: Zap, description: 'Difficulté au démarrage' },
  { id: 'bruit', label: 'Moteur bruyant', icon: Volume2, description: 'Bruits anormaux du moteur' },
];

export default function Diagnostic() {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [fuelType, setFuelType] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [year, setYear] = useState<string>('');

  const handleStartDiagnostic = () => {
    if (!selectedSymptom) return;
    setStep(2);
  };

  const handleSubmitInfo = () => {
    // TODO Phase 2: connect to bardahl-assistant edge function for AI diagnostic
    setStep(3);
  };

  return (
    <>
      <Helmet>
        <title>Diagnostic auto intelligent | Autopassion BJ</title>
        <meta name="description" content="Diagnostiquez les problèmes de votre voiture en quelques secondes grâce à notre assistant intelligent." />
      </Helmet>

      <div className="min-h-[70vh] bg-muted/30">
        {/* Hero */}
        <section className="bg-secondary text-secondary-foreground py-12 md:py-16">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Stethoscope className="h-3.5 w-3.5" />
              Diagnostic intelligent
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Votre voiture a un problème ?
            </h1>
            <p className="text-secondary-foreground/70 text-lg max-w-lg mx-auto">
              Faites un diagnostic en quelques secondes et découvrez les solutions recommandées.
            </p>
          </div>
        </section>

        <div className="container py-12">
          {step === 1 && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-bold text-center mb-8">Quel problème a votre voiture ?</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => setSelectedSymptom(symptom.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-center hover-lift ${
                      selectedSymptom === symptom.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <symptom.icon className={`h-8 w-8 mx-auto mb-3 ${selectedSymptom === symptom.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-bold text-sm mb-1">{symptom.label}</h3>
                    <p className="text-xs text-muted-foreground">{symptom.description}</p>
                  </button>
                ))}
              </div>
              {selectedSymptom && (
                <div className="text-center mt-8">
                  <Button size="lg" onClick={handleStartDiagnostic} className="bg-primary text-primary-foreground font-bold px-8">
                    Continuer <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold text-center mb-8">Quelques informations sur votre véhicule</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Type de carburant</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Diesel', 'Essence'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFuelType(type)}
                        className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                          fuelType === type ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Kilométrage approximatif</label>
                  <input
                    type="text"
                    placeholder="Ex: 120000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full p-3 rounded-lg border border-input bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Année du véhicule</label>
                  <input
                    type="text"
                    placeholder="Ex: 2018"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-3 rounded-lg border border-input bg-background text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Retour</Button>
                  <Button onClick={handleSubmitInfo} className="flex-1 bg-primary text-primary-foreground font-bold" disabled={!fuelType}>
                    Analyser <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Diagnostic en cours de développement</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Cette fonctionnalité sera bientôt connectée à notre assistant IA pour vous fournir un diagnostic précis et des recommandations de produits.
                </p>
                <p className="text-xs text-muted-foreground italic mb-6">
                  Le diagnostic proposé est indicatif et ne remplace pas l'avis d'un mécanicien professionnel.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => { setStep(1); setSelectedSymptom(null); }}>
                    Nouveau diagnostic
                  </Button>
                  <Button asChild className="bg-primary text-primary-foreground">
                    <Link to="/categories">Voir nos produits</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}