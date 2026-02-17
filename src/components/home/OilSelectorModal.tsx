import { useState } from 'react';
import { X, ArrowLeft, Car, Wrench, Fuel, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/use-supabase-api';
import { ProductCard } from '@/components/product/ProductCard';
import { vehicleData } from '@/data/vehicles';
import type { Product } from '@/types/product';

const getRecommendedProducts = (engine: string, allProducts: Product[]): Product[] => {
  const lowerEngine = engine.toLowerCase();
  
  // Filter for motor oils - check category and product type
  const allOils = allProducts.filter(p => 
    p.category === 'huiles-moteur' || 
    p.name.toLowerCase().includes('huile') ||
    p.style?.toLowerCase().includes('huile')
  );

  // If no oils found, return empty
  if (allOils.length === 0) return [];

  // Improved detection for hybrid engines (including e-Power, PHEV, etc.)
  if (lowerEngine.includes('hybride') || lowerEngine.includes('hybrid') || 
      lowerEngine.includes('e-power') || lowerEngine.includes('phev') || 
      lowerEngine.includes('e-tech')) {
    // Hybrid engines prefer low viscosity oils (0W-20, 0W-30, 5W-30)
    const filtered = allOils.filter(p =>
      p.viscosity === '0W-20' ||
      p.viscosity === '0W-30' ||
      p.viscosity === '5W-30' ||
      // Fallback to name matching if viscosity field not set
      p.name.includes('0W-20') ||
      p.name.includes('0W-30') ||
      p.name.includes('5W-30')
    );
    return filtered.length > 0 ? filtered.slice(0, 4) : allOils.slice(0, 4);
  }
  
  if (lowerEngine.includes('diesel')) {
    // Diesel engines - common viscosities
    const filtered = allOils.filter(p =>
      p.viscosity === '5W-30' ||
      p.viscosity === '5W-40' ||
      p.viscosity === '10W-40' ||
      // Fallback to name matching
      p.name.includes('5W-30') ||
      p.name.includes('5W-40') ||
      p.name.toLowerCase().includes('diesel')
    );
    return filtered.length > 0 ? filtered.slice(0, 4) : allOils.slice(0, 4);
  }
  
  if (lowerEngine.includes('électrique') || lowerEngine.includes('electric')) {
    return []; // Electric vehicles don't need motor oil
  }
  
  // Gasoline engines - common viscosities
  const filtered = allOils.filter(p =>
    p.viscosity === '5W-30' ||
    p.viscosity === '5W-40' ||
    p.viscosity === '10W-40' ||
    // Fallback to name matching
    p.name.includes('5W-30') ||
    p.name.includes('5W-40') ||
    p.name.includes('10W-40')
  );
  return filtered.length > 0 ? filtered.slice(0, 4) : allOils.slice(0, 4);
};

interface OilSelectorModalProps {
  open: boolean;
  onClose: () => void;
}

export function OilSelectorModal({ open, onClose }: OilSelectorModalProps) {
  const t = useTranslation();
  const [step, setStep] = useState<'brand' | 'model' | 'engine' | 'results'>('brand');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');

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

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const recommendedProducts = engine && products ? getRecommendedProducts(engine, products) : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="h-full w-full overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black border-b border-white/10 sticky top-0 z-10">
            <div className="container py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {step !== 'brand' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBack}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <div>
                    <h2 className="text-white font-bold text-xl">Trouver l'huile idéale</h2>
                    <p className="text-white/60 text-sm">
                      {step === 'brand' && 'Étape 1/3 : Sélectionnez votre marque'}
                      {step === 'model' && 'Étape 2/3 : Sélectionnez votre modèle'}
                      {step === 'engine' && 'Étape 3/3 : Sélectionnez votre motorisation'}
                      {step === 'results' && 'Produits recommandés'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 mt-4">
                <div className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  step !== 'brand' ? "bg-primary" : "bg-white/20"
                )} />
                <div className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  step === 'engine' || step === 'results' ? "bg-primary" : "bg-white/20"
                )} />
                <div className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  step === 'results' ? "bg-primary" : "bg-white/20"
                )} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-gradient-to-b from-gray-900 to-black">
            <div className="container py-8 md:py-12">
              {/* Step: Brand Selection */}
              {step === 'brand' && (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <Car className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Quelle est la marque de votre véhicule ?</h3>
                    <p className="text-white/60">Sélectionnez parmi les marques disponibles</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => handleBrandSelect(b)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary rounded-xl p-6 text-white font-medium transition-all hover:scale-105 active:scale-95 group"
                      >
                        <Car className="h-8 w-8 mx-auto mb-3 text-white/40 group-hover:text-primary transition-colors" />
                        <div className="text-lg">{b}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Model Selection */}
              {step === 'model' && (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Quel est le modèle ?</h3>
                    <p className="text-white/60">{brand}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {models.map((m) => (
                      <button
                        key={m}
                        onClick={() => handleModelSelect(m)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary rounded-xl p-6 text-white font-medium transition-all hover:scale-105 active:scale-95 group"
                      >
                        <Wrench className="h-8 w-8 mx-auto mb-3 text-white/40 group-hover:text-primary transition-colors" />
                        <div className="text-lg">{m}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Engine Selection */}
              {step === 'engine' && (
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <Fuel className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Quelle motorisation ?</h3>
                    <p className="text-white/60">{brand} {model}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {engines.map((e) => (
                      <button
                        key={e}
                        onClick={() => handleEngineSelect(e)}
                        disabled={isLoading}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary rounded-xl p-5 text-left text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <Fuel className="h-6 w-6 text-white/40 group-hover:text-primary mb-3 transition-colors" />
                        <div className="font-medium">{e}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Results */}
              {step === 'results' && (
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                      <Check className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Produits recommandés</h3>
                    <p className="text-white/60">{brand} {model} - {engine}</p>
                  </div>

                  {recommendedProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8 max-w-3xl mx-auto">
                        {recommendedProducts.slice(0, 4).map((product) => (
                          <div key={product.id} onClick={handleClose}>
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <Button
                          onClick={handleReset}
                          variant="secondary"
                          size="lg"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Nouvelle recherche
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-white/5 rounded-xl p-8 max-w-md mx-auto">
                        <p className="text-white/70 mb-6">
                          {engine.toLowerCase().includes('électrique') 
                            ? 'Les véhicules électriques ne nécessitent pas d\'huile moteur conventionnelle.'
                            : 'Aucun produit spécifique trouvé pour cette motorisation. Contactez-nous pour des recommandations personnalisées.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Nouvelle recherche
                          </Button>
                          <Button
                            asChild
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Link to="/categories" onClick={handleClose}>
                              Voir toutes les huiles
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
