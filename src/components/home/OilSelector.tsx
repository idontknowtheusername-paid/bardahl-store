import { useState, useMemo } from 'react';
import { ChevronDown, Search, Car, Wrench, Fuel, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

// Vehicle database
const vehicleData: Record<string, Record<string, string[]>> = {
  'Renault': {
    'Clio': ['1.0 TCe 100 Essence', '1.3 TCe 140 Essence', '1.5 dCi 85 Diesel', '1.6 E-Tech Hybride'],
    'Megane': ['1.3 TCe 140 Essence', '1.5 Blue dCi 115 Diesel', '1.6 E-Tech Hybride'],
    'Captur': ['1.0 TCe 100 Essence', '1.3 TCe 155 Essence', '1.5 Blue dCi 95 Diesel'],
    'Kadjar': ['1.3 TCe 140 Essence', '1.5 Blue dCi 115 Diesel'],
    'Arkana': ['1.3 TCe 140 Essence', '1.6 E-Tech Hybride'],
  },
  'Peugeot': {
    '208': ['1.2 PureTech 75 Essence', '1.2 PureTech 100 Essence', '1.5 BlueHDi 100 Diesel', 'e-208 Électrique'],
    '308': ['1.2 PureTech 110 Essence', '1.2 PureTech 130 Essence', '1.5 BlueHDi 130 Diesel'],
    '3008': ['1.2 PureTech 130 Essence', '1.5 BlueHDi 130 Diesel', '1.6 Hybrid 225'],
    '5008': ['1.2 PureTech 130 Essence', '1.5 BlueHDi 130 Diesel'],
    '508': ['1.6 PureTech 180 Essence', '1.5 BlueHDi 130 Diesel', '1.6 Hybrid 225'],
  },
  'Toyota': {
    'Yaris': ['1.0 VVT-i 72 Essence', '1.5 Hybride 116'],
    'Corolla': ['1.8 Hybride 122', '2.0 Hybride 184'],
    'RAV4': ['2.5 Hybride 218', '2.5 Hybride Rechargeable 306'],
    'C-HR': ['1.8 Hybride 122', '2.0 Hybride 184'],
    'Hilux': ['2.4 D-4D 150 Diesel', '2.8 D-4D 204 Diesel'],
  },
  'Volkswagen': {
    'Golf': ['1.0 TSI 110 Essence', '1.5 TSI 130 Essence', '2.0 TDI 115 Diesel', '2.0 TDI 150 Diesel'],
    'Polo': ['1.0 TSI 95 Essence', '1.0 TSI 110 Essence'],
    'Tiguan': ['1.5 TSI 150 Essence', '2.0 TDI 150 Diesel', '1.4 eHybrid 245'],
    'Passat': ['1.5 TSI 150 Essence', '2.0 TDI 150 Diesel'],
    'T-Cross': ['1.0 TSI 95 Essence', '1.0 TSI 110 Essence'],
  },
  'BMW': {
    'Série 1': ['118i Essence', '120i Essence', '116d Diesel', '118d Diesel'],
    'Série 3': ['318i Essence', '320i Essence', '318d Diesel', '320d Diesel', '330e Hybride'],
    'Série 5': ['520i Essence', '530i Essence', '520d Diesel', '530d Diesel'],
    'X1': ['sDrive18i Essence', 'sDrive18d Diesel', 'xDrive25e Hybride'],
    'X3': ['xDrive20i Essence', 'xDrive20d Diesel', 'xDrive30e Hybride'],
  },
  'Mercedes': {
    'Classe A': ['A180 Essence', 'A200 Essence', 'A180d Diesel', 'A250e Hybride'],
    'Classe C': ['C180 Essence', 'C200 Essence', 'C220d Diesel', 'C300e Hybride'],
    'Classe E': ['E200 Essence', 'E220d Diesel', 'E300e Hybride'],
    'GLA': ['GLA180 Essence', 'GLA200 Essence', 'GLA200d Diesel'],
    'GLC': ['GLC200 Essence', 'GLC220d Diesel', 'GLC300e Hybride'],
  },
  'Ford': {
    'Fiesta': ['1.0 EcoBoost 100 Essence', '1.0 EcoBoost 125 Essence', '1.5 TDCi 85 Diesel'],
    'Focus': ['1.0 EcoBoost 125 Essence', '1.5 EcoBoost 150 Essence', '1.5 EcoBlue 120 Diesel'],
    'Puma': ['1.0 EcoBoost 125 Essence', '1.0 EcoBoost Hybrid 125'],
    'Kuga': ['1.5 EcoBoost 150 Essence', '1.5 EcoBlue 120 Diesel', '2.5 PHEV 225'],
    'Ranger': ['2.0 EcoBlue 130 Diesel', '2.0 EcoBlue 170 Diesel'],
  },
  'Citroën': {
    'C3': ['1.2 PureTech 83 Essence', '1.2 PureTech 110 Essence'],
    'C4': ['1.2 PureTech 100 Essence', '1.2 PureTech 130 Essence', '1.5 BlueHDi 130 Diesel'],
    'C5 Aircross': ['1.2 PureTech 130 Essence', '1.5 BlueHDi 130 Diesel', '1.6 Hybrid 225'],
    'Berlingo': ['1.2 PureTech 110 Essence', '1.5 BlueHDi 100 Diesel', '1.5 BlueHDi 130 Diesel'],
  },
  'Hyundai': {
    'i10': ['1.0 67 Essence', '1.2 84 Essence'],
    'i20': ['1.0 T-GDi 100 Essence', '1.2 84 Essence'],
    'Tucson': ['1.6 T-GDi 150 Essence', '1.6 CRDi 136 Diesel', '1.6 T-GDi Hybride 230'],
    'Kona': ['1.0 T-GDi 120 Essence', '1.6 GDi Hybride 141', 'Électrique'],
    'Santa Fe': ['1.6 T-GDi Hybride 230', '2.2 CRDi 202 Diesel'],
  },
  'Nissan': {
    'Micra': ['1.0 IG-T 92 Essence'],
    'Juke': ['1.0 DIG-T 114 Essence', '1.6 Hybride 143'],
    'Qashqai': ['1.3 DIG-T 140 Essence', '1.3 DIG-T 158 Essence', '1.5 e-Power 190 Hybride'],
    'X-Trail': ['1.5 e-Power 204 Hybride', '1.5 e-Power e-4ORCE 213'],
  },
};

// Recommended oils based on engine type
const getRecommendedOils = (engine: string): { viscosity: string; product: string }[] => {
  const lowerEngine = engine.toLowerCase();
  if (lowerEngine.includes('diesel')) {
    return [
      { viscosity: '5W-30', product: 'Bardahl XTC C60 5W-30 C2/C3' },
      { viscosity: '5W-40', product: 'Bardahl XTC C60 5W-40' },
    ];
  }
  if (lowerEngine.includes('hybride') || lowerEngine.includes('hybrid')) {
    return [
      { viscosity: '0W-20', product: 'Bardahl XTC C60 0W-20' },
      { viscosity: '0W-30', product: 'Bardahl XTC C60 0W-30' },
    ];
  }
  if (lowerEngine.includes('électrique') || lowerEngine.includes('electric')) {
    return [];
  }
  // Essence / Gasoline
  return [
    { viscosity: '5W-30', product: 'Bardahl XTC C60 5W-30' },
    { viscosity: '5W-40', product: 'Bardahl XTC C60 5W-40' },
    { viscosity: '10W-40', product: 'Bardahl XTC 10W-40' },
  ];
};

export function OilSelector() {
  const t = useTranslation();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');
  const [showResults, setShowResults] = useState(false);

  const brands = Object.keys(vehicleData);
  const models = brand ? Object.keys(vehicleData[brand] || {}) : [];
  const engines = brand && model ? (vehicleData[brand]?.[model] || []) : [];

  const currentStep = !brand ? 1 : !model ? 2 : !engine ? 3 : 4;

  const handleReset = () => {
    setBrand('');
    setModel('');
    setEngine('');
    setShowResults(false);
  };

  const handleFind = () => {
    if (brand && model && engine) setShowResults(true);
  };

  const recommendations = engine ? getRecommendedOils(engine) : [];

  return (
    <section className="py-12 md:py-20 bg-secondary">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
              <Car className="h-4 w-4" />
              {t.navFindOil}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-foreground">
              {t.oilSelectorTitle}
            </h2>
            <p className="text-secondary-foreground/60 mt-3 max-w-lg mx-auto">
              {t.oilSelectorDesc}
            </p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { num: 1, label: t.stepBrand, icon: Car },
              { num: 2, label: t.stepModel, icon: Wrench },
              { num: 3, label: t.stepEngine, icon: Fuel },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center">
                <div className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all',
                  currentStep > step.num
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === step.num
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-secondary-foreground/10 text-secondary-foreground/40'
                )}>
                  <step.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < 2 && <ArrowRight className="h-4 w-4 mx-2 text-secondary-foreground/30" />}
              </div>
            ))}
          </div>

          {/* Selector Card */}
          <div className="bg-background rounded-2xl shadow-lg p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Brand */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.stepBrand}</label>
                <div className="relative">
                  <select
                    value={brand}
                    onChange={(e) => { setBrand(e.target.value); setModel(''); setEngine(''); setShowResults(false); }}
                    className="w-full h-12 px-4 pr-10 rounded-lg border border-border bg-background text-foreground text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">{t.selectBrand}</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.stepModel}</label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => { setModel(e.target.value); setEngine(''); setShowResults(false); }}
                    disabled={!brand}
                    className="w-full h-12 px-4 pr-10 rounded-lg border border-border bg-background text-foreground text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">{t.selectModel}</option>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Engine */}
              <div>
                <label className="block text-sm font-bold mb-2">{t.stepEngine}</label>
                <div className="relative">
                  <select
                    value={engine}
                    onChange={(e) => { setEngine(e.target.value); setShowResults(false); }}
                    disabled={!model}
                    className="w-full h-12 px-4 pr-10 rounded-lg border border-border bg-background text-foreground text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">{t.selectEngine}</option>
                    {engines.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                onClick={handleFind}
                disabled={!engine}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold flex-1"
                size="lg"
              >
                <Search className="h-4 w-4 mr-2" />
                {t.findProducts}
              </Button>
              {brand && (
                <Button variant="outline" onClick={handleReset} size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            {/* Results */}
            {showResults && recommendations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  {t.compatibleProducts} — {brand} {model}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="bg-muted rounded-xl p-4 hover:shadow-md transition-shadow border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                          {rec.viscosity}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm">{rec.product}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {engine}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showResults && recommendations.length === 0 && (
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-muted-foreground">
                  Ce type de véhicule ne nécessite pas d'huile moteur conventionnelle.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
