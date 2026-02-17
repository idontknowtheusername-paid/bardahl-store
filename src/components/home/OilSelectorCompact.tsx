import { useState, useEffect } from 'react';
import { ChevronDown, Search, Car, Wrench, Fuel, ArrowRight, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useCurrency } from '@/context/CurrencyContext';
import { useProducts } from '@/hooks/use-supabase-api';
import type { Product } from '@/types/product';

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

const getRecommendedProducts = (engine: string, allProducts: Product[]): Product[] => {
  const lowerEngine = engine.toLowerCase();
  
  // Filter for motor oils - check both category and product name/type
  const allOils = allProducts.filter(p => 
    p.category === 'huiles-moteur' || 
    p.name.toLowerCase().includes('huile') ||
    p.style?.toLowerCase().includes('huile')
  );

  console.log('All oils found:', allOils.length, allOils.map(p => p.name));

  if (lowerEngine.includes('diesel')) {
    const filtered = allOils.filter(p =>
      p.name.includes('5W-30') ||
      p.name.includes('5W-40') ||
      p.name.toLowerCase().includes('diesel')
    );
    console.log('Diesel oils:', filtered.length);
    return filtered.slice(0, 3);
  }
  if (lowerEngine.includes('hybride') || lowerEngine.includes('hybrid')) {
    const filtered = allOils.filter(p =>
      p.name.includes('0W-20') ||
      p.name.includes('0W-30') ||
      p.name.includes('5W-30')
    );
    console.log('Hybrid oils:', filtered.length);
    return filtered.slice(0, 3);
  }
  if (lowerEngine.includes('électrique') || lowerEngine.includes('electric')) {
    return [];
  }
  // Essence / Gasoline
  const filtered = allOils.filter(p =>
    p.name.includes('5W-30') ||
    p.name.includes('5W-40') ||
    p.name.includes('10W-40')
  );
  console.log('Gasoline oils:', filtered.length);
  return filtered.slice(0, 3);
};

interface OilSelectorCompactProps {
  onClose?: () => void;
}

export function OilSelectorCompact({ onClose }: OilSelectorCompactProps) {
  const t = useTranslation();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState<'brand' | 'model' | 'engine' | 'results'>('brand');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');

  // Fetch ALL products and filter client-side for better reliability
  const { data: products, isLoading } = useProducts();

  const brands = Object.keys(vehicleData);
  const models = brand ? Object.keys(vehicleData[brand] || {}) : [];
  const engines = brand && model ? (vehicleData[brand]?.[model] || []) : [];

  const handleBrandSelect = (selectedBrand: string) => {
    setBrand(selectedBrand);
    setModel('');
    setEngine('');
    setStep('model');
  };

  const handleModelSelect = (selectedModel: string) => {
    setModel(selectedModel);
    setEngine('');
    setStep('engine');
  };

  const handleEngineSelect = (selectedEngine: string) => {
    setEngine(selectedEngine);
    setStep('results');
  };

  const handleReset = () => {
    setBrand('');
    setModel('');
    setEngine('');
    setStep('brand');
  };

  const handleBack = () => {
    if (step === 'results') setStep('engine');
    else if (step === 'engine') setStep('model');
    else if (step === 'model') setStep('brand');
  };

  const recommendedProducts = engine && products ? getRecommendedProducts(engine, products) : [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Car className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">
              {t.oilSelectorTitle}
            </h3>
            <p className="text-white/70 text-sm">
              {step === 'brand' && 'Étape 1/3 : Sélectionnez votre marque'}
              {step === 'model' && 'Étape 2/3 : Sélectionnez votre modèle'}
              {step === 'engine' && 'Étape 3/3 : Sélectionnez votre motorisation'}
              {step === 'results' && `${brand} ${model} - Produits compatibles`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {step !== 'brand' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Step: Brand Selection */}
      {step === 'brand' && (
        <div className="animate-slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => handleBrandSelect(b)}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-primary rounded-xl p-4 text-white font-medium transition-all hover:scale-105 active:scale-95"
              >
                <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Model Selection */}
      {step === 'model' && (
        <div className="animate-slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {models.map((m) => (
              <button
                key={m}
                onClick={() => handleModelSelect(m)}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-primary rounded-xl p-4 text-white font-medium transition-all hover:scale-105 active:scale-95"
              >
                <Wrench className="h-6 w-6 mx-auto mb-2 text-primary" />
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Engine Selection */}
      {step === 'engine' && (
        <div className="animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {engines.map((e) => (
              <button
                key={e}
                onClick={() => handleEngineSelect(e)}
                disabled={isLoading}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-primary rounded-xl p-4 text-left text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Fuel className="h-5 w-5 text-primary mb-2" />
                <div className="font-medium text-sm">{e}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && (
        <div className="animate-slide-up">
          {recommendedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {recommendedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/produits/${product.slug}`}
                    className="bg-white rounded-xl p-4 hover:shadow-lg transition-all group"
                    onClick={onClose}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h5 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h5>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Nouvelle recherche
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70 mb-4">
                Ce type de véhicule ne nécessite pas d'huile moteur conventionnelle.
              </p>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Nouvelle recherche
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
