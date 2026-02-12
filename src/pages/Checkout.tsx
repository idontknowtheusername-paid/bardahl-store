import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Truck, Zap, Store, Loader2, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { shippingApi, paymentApi } from '@/lib/api-payment';
import { formatPrice } from '@/lib/format';
import { usePromoCode } from '@/hooks/use-promo-code';

type Step = 'shipping' | 'delivery' | 'payment';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: typeof Truck;
}

const defaultShippingOptions: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Livraison Standard',
    description: '2-4 jours ouvrés',
    price: 2000,
    icon: Truck,
  },
  {
    id: 'express',
    name: 'Livraison Express',
    description: '24-48h',
    price: 5000,
    icon: Zap,
  },
  {
    id: 'pickup',
    name: 'Retrait en boutique',
    description: 'Gratuit - Disponible sous 24h',
    price: 0,
    icon: Store,
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Promo code
  const { promoCode, isValidating, error: promoError, validatePromoCode, calculateDiscount, clearPromoCode } = usePromoCode();
  const [promoCodeInput, setPromoCodeInput] = useState('');

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Bénin',
  });
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [acceptCGV, setAcceptCGV] = useState(true);
  const [subscribeToBlog, setSubscribeToBlog] = useState(true);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(defaultShippingOptions);
  const [calculatedShippingCost, setCalculatedShippingCost] = useState<number | null>(null);
  const [freeShippingApplied, setFreeShippingApplied] = useState(false);

  // Calculate shipping when city changes or delivery step is reached
  useEffect(() => {
    const calculateShipping = async () => {
      if (!shippingInfo.city || currentStep !== 'delivery') return;
      
      setIsCalculatingShipping(true);
      try {
        const result = await shippingApi.calculateShipping(
          shippingInfo.city,
          subtotal,
          selectedShipping,
          shippingInfo.country
        );
        
        if (!result.error) {
          setCalculatedShippingCost(result.shippingCost);
          setFreeShippingApplied(result.freeShipping);
        }
      } catch (error) {
        console.warn('Shipping calculation failed, using defaults');
      } finally {
        setIsCalculatingShipping(false);
      }
    };
    
    calculateShipping();
  }, [shippingInfo.city, shippingInfo.country, currentStep, selectedShipping, subtotal]);

  const selectedShippingOption = shippingOptions.find(o => o.id === selectedShipping);
  
  // Calculate discount
  const discount = calculateDiscount(subtotal, items.length);
  const discountAmount = discount?.amount || 0;
  const isFreeShipping = discount?.freeShipping || freeShippingApplied;

  // Use calculated shipping or fallback to default option price
  const shippingCost = (selectedShipping === 'pickup' || isFreeShipping)
    ? 0 
    : (calculatedShippingCost !== null ? calculatedShippingCost : (selectedShippingOption?.price || 0));
  
  const total = subtotal - discountAmount + shippingCost;

  const handleApplyPromoCode = async () => {
    const isValid = await validatePromoCode(promoCodeInput);
    if (isValid) {
      toast({
        title: 'Code promo appliqué',
        description: `Le code ${promoCodeInput} a été appliqué avec succès`,
      });
    } else {
      toast({
        title: 'Code promo invalide',
        description: promoError || 'Ce code promo n\'est pas valide',
        variant: 'destructive',
      });
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Livraison' },
    { key: 'delivery', label: 'Mode de livraison' },
    { key: 'payment', label: 'Paiement' },
  ];

  const getStepIndex = (step: Step) => steps.findIndex(s => s.key === step);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields only
    if (!shippingInfo.firstName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.city) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('cannesh-checkout-shipping', JSON.stringify(shippingInfo));
    setCurrentStep('delivery');
  };

  const handleDeliverySubmit = () => {
    setCurrentStep('payment');
  };

  const handlePayment = async () => {
    if (!acceptCGV) {
      toast({
        title: "CGV non acceptées",
        description: "Veuillez accepter les conditions générales de vente.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Subscribe to blog if checked
      if (subscribeToBlog && shippingInfo.email) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase
            .from('blog_subscribers')
            .upsert({
              email: shippingInfo.email,
              is_active: true
            }, {
              onConflict: 'email',
              ignoreDuplicates: false
            });
        } catch (error) {
          console.warn('Failed to subscribe to blog:', error);
          // Don't block checkout if blog subscription fails
        }
      }

      // Prepare order items
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        cupSize: item.cupSize,
      }));

      // Create order and get payment URL
      const result = await paymentApi.createOrder(
        orderItems,
        {
          firstName: shippingInfo.firstName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          city: shippingInfo.city,
          address: shippingInfo.address,
          country: shippingInfo.country,
        },
        selectedShipping
      );

      if (result.success && result.payment_url) {
        // Save order info for callback
        localStorage.setItem('cannesh-pending-order', JSON.stringify({
          orderNumber: result.order_number,
          orderId: result.order_id,
          amount: result.amount,
        }));

        // Clear cart
        clearCart();
        localStorage.removeItem('cannesh-checkout-shipping');

        // Redirect to Lygos payment
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers la page de paiement sécurisée.",
        });

        setTimeout(() => {
          paymentApi.redirectToPayment(result.payment_url!);
        }, 1000);
      } else {
        throw new Error(result.message || 'Échec de la création de la commande');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-medium mb-4">Votre panier est vide</h1>
        <Button asChild>
          <Link to="/collections">Découvrir nos collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-5xl">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => getStepIndex(currentStep) > index && setCurrentStep(step.key)}
                className={cn(
                  "flex items-center gap-2",
                  getStepIndex(currentStep) > index && "cursor-pointer"
                )}
                disabled={getStepIndex(currentStep) < index}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep === step.key
                      ? "bg-rose text-primary-foreground"
                      : getStepIndex(currentStep) > index
                      ? "bg-green-500 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {getStepIndex(currentStep) > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "hidden sm:inline text-sm font-medium",
                    currentStep === step.key
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Info */}
            {currentStep === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <h2 className="font-serif text-2xl font-medium mb-6">
                  Informations de livraison
                </h2>

                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={shippingInfo.firstName}
                    onChange={(e) =>
                      setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        setShippingInfo(prev => ({ ...prev, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo(prev => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+229 XX XX XX XX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <select
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo(prev => ({ ...prev, city: e.target.value }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Sélectionnez votre ville</option>
                    <option value="Cotonou">Cotonou</option>
                    <option value="Porto-Novo">Porto-Novo</option>
                    <option value="Parakou">Parakou</option>
                    <option value="Abomey-Calavi">Abomey-Calavi</option>
                    <option value="Djougou">Djougou</option>
                    <option value="Bohicon">Bohicon</option>
                    <option value="Natitingou">Natitingou</option>
                    <option value="Lokossa">Lokossa</option>
                    <option value="Ouidah">Ouidah</option>
                    <option value="Kandi">Kandi</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="address">Adresse (optionnel)</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo(prev => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Quartier, rue, repère..."
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-rose-light rounded-lg border border-rose/20">
                  <Checkbox
                    id="blogSubscribe"
                    checked={subscribeToBlog}
                    onCheckedChange={(checked) => setSubscribeToBlog(!!checked)}
                  />
                  <Label htmlFor="blogSubscribe" className="text-sm cursor-pointer leading-relaxed">
                    📰 Je souhaite recevoir les nouveaux articles du blog par email
                  </Label>
                </div>

                <Button variant="rose" size="lg" type="submit" className="w-full sm:w-auto">
                  Continuer
                </Button>
              </form>
            )}

            {/* Step 2: Delivery Method */}
            {currentStep === 'delivery' && (
              <div>
                <h2 className="font-serif text-2xl font-medium mb-6">
                  Mode de livraison
                </h2>

                {isCalculatingShipping && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Calcul des frais de livraison pour {shippingInfo.city}...</span>
                  </div>
                )}

                <RadioGroup
                  value={selectedShipping}
                  onValueChange={setSelectedShipping}
                  className="space-y-3"
                >
                  {shippingOptions.map(option => {
                    const Icon = option.icon;
                    const displayPrice = option.id === 'pickup' ? 0 : (
                      option.id === selectedShipping && calculatedShippingCost !== null 
                        ? calculatedShippingCost 
                        : option.price
                    );
                    const isFree = displayPrice === 0 || (freeShippingApplied && option.id === selectedShipping);
                    
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
                          selectedShipping === option.id
                            ? "border-rose bg-rose-light"
                            : "border-border hover:border-rose/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={option.id} />
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{option.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {isFree ? (
                            <span className="text-green-600">Gratuit</span>
                          ) : (
                            formatPrice(displayPrice)
                          )}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>

                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep('shipping')}>
                    Retour
                  </Button>
                  <Button variant="rose" onClick={handleDeliverySubmit}>
                    Continuer
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 'payment' && (
              <div>
                <h2 className="font-serif text-2xl font-medium mb-6">
                  Récapitulatif et paiement
                </h2>

                {/* Shipping Summary */}
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Informations de livraison</h3>
                    <button
                      onClick={() => setCurrentStep('shipping')}
                      className="text-sm text-rose hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {shippingInfo.firstName}<br />
                    {shippingInfo.city}, {shippingInfo.country}<br />
                    {shippingInfo.address && <>{shippingInfo.address}<br /></>}
                    {shippingInfo.phone}
                  </p>
                </div>

                {/* Delivery Summary */}
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Mode de livraison</h3>
                    <button
                      onClick={() => setCurrentStep('delivery')}
                      className="text-sm text-rose hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedShippingOption?.name} - {formatPrice(shippingCost)}
                  </p>
                </div>

                {/* CGV */}
                <div className="flex items-start gap-2 mb-6">
                  <Checkbox
                    id="cgv"
                    checked={acceptCGV}
                    onCheckedChange={(checked) => setAcceptCGV(!!checked)}
                  />
                  <Label htmlFor="cgv" className="text-sm cursor-pointer leading-relaxed">
                    J'accepte les{' '}
                    <Link to="/cgv" className="text-rose hover:underline" target="_blank">
                      conditions générales de vente
                    </Link>{' '}
                    et la{' '}
                    <Link to="/politique-confidentialite" className="text-rose hover:underline" target="_blank">
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep('delivery')}>
                    Retour
                  </Button>
                  <Button
                    variant="rose"
                    size="lg"
                    className="flex-1"
                    onClick={handlePayment}
                    disabled={isProcessing || !acceptCGV}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Traitement...
                      </>
                    ) : (
                      `Payer ${formatPrice(total)}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-muted p-6 rounded-lg sticky top-24">
              <h3 className="font-serif text-lg font-medium mb-4">Votre commande</h3>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} • {item.color} {item.cupSize && `• ${item.cupSize}`}
                      </p>
                      <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                {/* Promo Code Input */}
                <div className="space-y-2 pb-2">
                  <Label htmlFor="promo-code" className="text-sm">Code promo</Label>
                  {promoCode ? (
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{promoCode.code}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          clearPromoCode();
                          setPromoCodeInput('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="promo-code"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="SUMMER2024"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyPromoCode}
                        disabled={isValidating || !promoCodeInput.trim()}
                      >
                        {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Appliquer'}
                      </Button>
                    </div>
                  )}
                  {promoError && !promoCode && (
                    <p className="text-xs text-destructive">{promoError}</p>
                  )}
                </div>

                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction ({promoCode?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-green-600">Gratuit</span>
                    ) : shippingCost === 0 ? (
                      'Gratuit'
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-rose">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
