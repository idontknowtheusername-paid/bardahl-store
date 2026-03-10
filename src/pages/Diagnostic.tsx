import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Stethoscope, ArrowRight, Fuel, Gauge, Flame, Activity, Zap, Volume2, Loader2, ShoppingCart, RotateCcw, Thermometer, Wind, Car, Disc3, Plug, Wrench, Droplets, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import DiagnosticTTS from '@/components/diagnostic/DiagnosticTTS';
import { useProducts } from '@/hooks/use-supabase-api';
import { ProductCard } from '@/components/product/ProductCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bardahl-assistant`;

const symptomCategories = [
  {
    label: 'Moteur',
    symptoms: [
      { id: 'perte-puissance', label: 'Perte de puissance', icon: Gauge, description: 'Le moteur manque de puissance ou de reprise' },
      { id: 'demarrage', label: 'Démarrage difficile', icon: Zap, description: 'Difficulté au démarrage du moteur' },
      { id: 'vibrations', label: 'Moteur qui tremble', icon: Activity, description: 'Vibrations, tremblements ou le moteur broute' },
      { id: 'bruit', label: 'Moteur bruyant', icon: Volume2, description: 'Bruits métalliques ou moteur bruyant au ralenti' },
      { id: 'ralenti-instable', label: 'Ralenti instable', icon: Activity, description: 'Le moteur tourne de manière irrégulière au ralenti' },
      { id: 'moteur-cale', label: 'Moteur qui cale', icon: Zap, description: 'Le moteur cale en roulant ou à l\'arrêt' },
      { id: 'compression', label: 'Perte de compression', icon: Gauge, description: 'Le moteur a perdu de la compression' },
      { id: 'entretien-preventif', label: 'Entretien préventif', icon: Shield, description: 'Protéger et prolonger la vie du moteur' },
    ]
  },
  {
    label: 'Échappement & Fumées',
    symptoms: [
      { id: 'fumee-noire', label: 'Fumée noire', icon: Flame, description: 'Fumée noire à l\'échappement' },
      { id: 'fumee-blanche', label: 'Fumée blanche', icon: Wind, description: 'Fumée blanche à l\'échappement' },
      { id: 'fumee-bleue', label: 'Fumée bleue', icon: Flame, description: 'Fumée bleue = consommation d\'huile' },
      { id: 'diesel-fume', label: 'Diesel qui fume', icon: Flame, description: 'Moteur diesel qui fume excessivement' },
    ]
  },
  {
    label: 'Carburant & Injection',
    symptoms: [
      { id: 'consommation', label: 'Consommation élevée', icon: Fuel, description: 'Surconsommation de carburant' },
      { id: 'encrassement', label: 'Moteur encrassé', icon: Wrench, description: 'Encrassement moteur diesel ou essence' },
      { id: 'turbo-egr', label: 'Turbo/EGR encrassé', icon: Wind, description: 'Turbo ou vanne EGR encrassée' },
      { id: 'mauvais-carburant', label: 'Carburant de mauvaise qualité', icon: Fuel, description: 'Eau dans le diesel ou carburant douteux' },
      { id: 'odeur-carburant', label: 'Odeur de carburant', icon: Droplets, description: 'Odeur anormale de carburant' },
    ]
  },
  {
    label: 'Refroidissement',
    symptoms: [
      { id: 'surchauffe', label: 'Surchauffe moteur', icon: Thermometer, description: 'Le moteur surchauffe' },
      { id: 'radiateur', label: 'Radiateur bouché/fuite', icon: Droplets, description: 'Radiateur bouché ou fuite du radiateur' },
      { id: 'liquide-sale', label: 'Liquide refroidissement sale', icon: Droplets, description: 'Le liquide de refroidissement est sale ou usé' },
    ]
  },
  {
    label: 'Habitacle & Climatisation',
    symptoms: [
      { id: 'clim-odeur', label: 'Mauvaises odeurs', icon: Wind, description: 'Climatisation ou habitacle qui sent mauvais' },
      { id: 'plastiques', label: 'Plastiques/tableau de bord', icon: Car, description: 'Plastiques ternes ou tableau de bord sale' },
    ]
  },
  {
    label: 'Transmission & Freinage',
    symptoms: [
      { id: 'boite-dure', label: 'Boîte de vitesse dure', icon: Wrench, description: 'La boîte de vitesse est dure ou accroche' },
      { id: 'freins', label: 'Freins bruyants', icon: Disc3, description: 'Freins qui grincent ou disques encrassés' },
      { id: 'direction', label: 'Direction bruyante', icon: Car, description: 'Bruits dans la direction assistée' },
    ]
  },
  {
    label: 'Électrique',
    symptoms: [
      { id: 'contacts-oxydes', label: 'Contacts oxydés', icon: Plug, description: 'Contacts électriques ou connecteurs sales/oxydés' },
    ]
  },
];

// Flatten all symptoms for lookup
const allSymptoms = symptomCategories.flatMap(c => c.symptoms);

// Extract product slugs from AI response markdown links like (/produits/slug)
function extractProductSlugs(text: string): string[] {
  const regex = /\/produits\/([\w-]+)/g;
  const slugs: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (!slugs.includes(match[1])) slugs.push(match[1]);
  }
  return slugs;
}

export default function Diagnostic() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [fuelType, setFuelType] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const resultRef = useRef<HTMLDivElement>(null);

  const { data: allProducts } = useProducts({ limit: 200 });

  const selectedSymptom = selectedSymptoms[0] || null;

  const recommendedProducts = useMemo(() => {
    if (!diagnosticResult || !allProducts?.length) return [];
    const slugs = extractProductSlugs(diagnosticResult);
    return slugs
      .map(slug => allProducts.find(p => p.slug === slug))
      .filter(Boolean) as NonNullable<typeof allProducts>[number][];
  }, [diagnosticResult, allProducts]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleStartDiagnostic = () => {
    if (selectedSymptoms.length === 0) return;
    setStep(2);
  };

  const handleSubmitInfo = async () => {
    if (!fuelType || selectedSymptoms.length === 0) return;
    setStep(3);
    setIsLoading(true);
    setError('');
    setDiagnosticResult('');

    const symptomDetails = selectedSymptoms.map(id => {
      const s = allSymptoms.find(x => x.id === id);
      return s ? `${s.label} (${s.description})` : id;
    }).join('\n- ');

    const diagnosticMessage = `DIAGNOSTIC AUTO - Analyse structurée demandée.

Symptômes signalés :
- ${symptomDetails}

Type de carburant : ${fuelType}
Kilométrage : ${mileage || 'Non précisé'}
Année du véhicule : ${year || 'Non précisée'}

Fais un diagnostic structuré avec :
1. **Diagnostic probable** : explique la cause probable du/des problème(s)
2. **Solutions recommandées** : liste les produits Autopassion/Bardahl adaptés avec leur lien (/produits/slug). UTILISE IMPÉRATIVEMENT le guide diagnostic problèmes/solutions pour recommander les bons produits.
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

      if (!resp.ok) throw new Error('Erreur du service de diagnostic');
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
    setSelectedSymptoms([]);
    setFuelType('');
    setMileage('');
    setYear('');
    setDiagnosticResult('');
    setError('');
  };

  return (
    <>
      <SEOHead
        title="Diagnostic Auto Rapide | Autopassion BJ"
        description="Diagnostiquez votre voiture en 1 minute. Sélectionnez les symptômes et découvrez les solutions recommandées."
        keywords="diagnostic auto, problème voiture, symptômes moteur, autopassion, bénin, huile moteur Bénin"
        url="/diagnostic"
      />

      <div className="min-h-[70vh] bg-muted/30">
        {/* Hero */}
        <section className="bg-secondary text-secondary-foreground py-12 md:py-16">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary text-sm font-bold px-4 py-2 rounded-full mb-4">
              <Stethoscope className="h-4 w-4" />
              Diagnostic rapide
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Diagnostiquez votre voiture en 1 minute
            </h1>
            <p className="text-secondary-foreground/70 text-lg max-w-lg mx-auto">
              Sélectionnez le(s) symptôme(s) de votre voiture et découvrez les solutions recommandées.
            </p>
          </div>
        </section>

        <div className="container py-12">
          {/* Step 1: Symptom selection by category */}
          {step === 1 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-center mb-2">Quel(s) problème(s) a votre voiture ?</h2>
              <p className="text-sm text-muted-foreground text-center mb-8">Vous pouvez sélectionner plusieurs symptômes.</p>
              <Accordion type="single" collapsible className="space-y-3">
                {symptomCategories.map((cat) => (
                  <AccordionItem key={cat.label} value={cat.label} className="border border-border rounded-xl overflow-hidden bg-card">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      {cat.label}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                        {cat.symptoms.map((symptom) => (
                          <button
                            key={symptom.id}
                            onClick={() => toggleSymptom(symptom.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-center hover-lift ${
                              selectedSymptoms.includes(symptom.id)
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border bg-background hover:border-primary/30'
                            }`}
                          >
                            <symptom.icon className={`h-7 w-7 mx-auto mb-2 ${selectedSymptoms.includes(symptom.id) ? 'text-primary' : 'text-muted-foreground'}`} />
                            <h4 className="font-bold text-sm mb-1">{symptom.label}</h4>
                            <p className="text-xs text-muted-foreground leading-tight">{symptom.description}</p>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {selectedSymptoms.length > 0 && (
                <div className="text-center mt-8 sticky bottom-4">
                  <Button size="lg" onClick={handleStartDiagnostic} className="bg-primary text-primary-foreground font-bold px-8 shadow-lg text-base">
                    Continuer ({selectedSymptoms.length} symptôme{selectedSymptoms.length > 1 ? 's' : ''}) <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Vehicle info */}
          {step === 2 && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold text-center mb-2">Quelques informations sur votre véhicule</h2>
              <p className="text-center text-sm text-muted-foreground mb-8">
                Symptôme(s) : <span className="font-semibold text-primary">{selectedSymptoms.map(id => allSymptoms.find(s => s.id === id)?.label).filter(Boolean).join(', ')}</span>
              </p>
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
                      {allSymptoms.find(s => s.id === selectedSymptom)?.label} • {fuelType} {year && `• ${year}`} {mileage && `• ${mileage} km`}
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
                  <>
                    <DiagnosticTTS text={diagnosticResult} />
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>h2]:text-base [&>h3]:text-sm">
                      <ReactMarkdown>{diagnosticResult}</ReactMarkdown>
                    </div>
                  </>
                )}

                {/* Recommended products carousel */}
                {!isLoading && recommendedProducts.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      Produits recommandés
                    </h3>
                    <Carousel opts={{ align: 'start', loop: recommendedProducts.length > 2 }} className="w-full">
                      <CarouselContent className="-ml-3">
                        {recommendedProducts.map((product) => (
                          <CarouselItem key={product.id} className="pl-3 basis-[70%] sm:basis-1/2">
                            <ProductCard product={product} />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {recommendedProducts.length > 2 && (
                        <>
                          <CarouselPrevious className="hidden sm:flex -left-3" />
                          <CarouselNext className="hidden sm:flex -right-3" />
                        </>
                      )}
                    </Carousel>
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
