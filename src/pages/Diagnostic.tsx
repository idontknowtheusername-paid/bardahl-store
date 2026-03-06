import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Stethoscope, ArrowRight, Fuel, Gauge, Flame, Activity, Zap, Volume2, Loader2, ShoppingCart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bardahl-assistant`;

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
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleStartDiagnostic = () => {
    if (!selectedSymptom) return;
    setStep(2);
  };

  const handleSubmitInfo = async () => {
    if (!fuelType || !selectedSymptom) return;
    setStep(3);
    setIsLoading(true);
    setError('');
    setDiagnosticResult('');

    const symptomLabel = symptoms.find(s => s.id === selectedSymptom)?.label || selectedSymptom;

    const diagnosticMessage = `DIAGNOSTIC AUTO - Analyse structurée demandée.

Symptôme principal : ${symptomLabel}
Type de carburant : ${fuelType}
Kilométrage : ${mileage || 'Non précisé'}
Année du véhicule : ${year || 'Non précisée'}

Fais un diagnostic structuré avec :
1. **Diagnostic probable** : explique la cause probable du problème
2. **Solutions recommandées** : liste les produits Autopassion/Bardahl adaptés avec leur lien (/produits/slug)
3. **Conseil entretien** : un conseil préventif

Utilise des emojis et formate bien la réponse.`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: diagnosticMessage }],
          conversationId: null,
          sessionId: `diagnostic-${Date.now()}`,
        }),
      });

      if (!resp.ok) {
        throw new Error('Erreur du service de diagnostic');
      }

      if (!resp.body) throw new Error('Pas de réponse');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              fullContent += c;
              setDiagnosticResult(fullContent);
            }
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors du diagnostic');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDiagnostic = () => {
    setStep(1);
    setSelectedSymptom(null);
    setFuelType('');
    setMileage('');
    setYear('');
    setDiagnosticResult('');
    setError('');
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
          {/* Step 1: Symptom selection */}
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

          {/* Step 2: Vehicle info */}
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

          {/* Step 3: AI Results */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto" ref={resultRef}>
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Résultat du diagnostic</h2>
                    <p className="text-xs text-muted-foreground">
                      {symptoms.find(s => s.id === selectedSymptom)?.label} • {fuelType} {year && `• ${year}`} {mileage && `• ${mileage} km`}
                    </p>
                  </div>
                </div>

                {isLoading && !diagnosticResult && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Analyse en cours...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive mb-4">
                    {error}
                  </div>
                )}

                {diagnosticResult && (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>h2]:text-base [&>h3]:text-sm">
                    <ReactMarkdown>{diagnosticResult}</ReactMarkdown>
                  </div>
                )}

                {(!isLoading || diagnosticResult) && (
                  <>
                    <p className="text-xs text-muted-foreground italic mt-6 pt-4 border-t border-border">
                      ⚠️ Le diagnostic proposé est indicatif et ne remplace pas l'avis d'un mécanicien professionnel.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Button variant="outline" onClick={resetDiagnostic} className="gap-2">
                        <RotateCcw className="h-4 w-4" /> Nouveau diagnostic
                      </Button>
                      <Button asChild className="bg-primary text-primary-foreground gap-2">
                        <Link to="/categories"><ShoppingCart className="h-4 w-4" /> Voir nos produits</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
