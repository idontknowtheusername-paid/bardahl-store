import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { StructuredData } from '@/components/StructuredData';
import { ChevronRight, Minus, Plus, Share2, ShoppingBag, Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { PopularProductsCarousel } from '@/components/product/PopularProductsCarousel';

interface PackItem {
  id: string;
  quantity: number;
  item_type: 'fixed' | 'variable';
  product_id: string;
  products: {
    id: string;
    title: string;
    slug: string;
    price: number;
    product_images: Array<{ image_url: string; display_order: number }>;
  };
  pack_item_options?: Array<{
    id: string;
    product_id: string;
    is_default: boolean;
    products: {
      id: string;
      title: string;
      slug: string;
      price: number;
    };
  }>;
}

interface Pack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  pack_items: PackItem[];
}

export default function PackDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  
  const [pack, setPack] = useState<Pack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isZoomed, setIsZoomed] = useState(false);

  // Fetch pack data
  useEffect(() => {
    const fetchPack = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('product_packs')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          discount_type,
          discount_value,
          is_active,
          pack_items (
            id,
            quantity,
            item_type,
            product_id,
            products (
              id,
              title,
              slug,
              price,
              product_images (image_url, display_order)
            ),
            pack_item_options (
              id,
              product_id,
              is_default,
              products (
                id,
                title,
                slug,
                price
              )
            )
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setPack(data as unknown as Pack);
        
        // Initialize selected options with defaults
        const defaults: Record<string, string> = {};
        (data.pack_items as unknown as PackItem[]).forEach((item: PackItem) => {
          if (item.item_type === 'variable' && item.pack_item_options) {
            const defaultOption = item.pack_item_options.find(opt => opt.is_default);
            if (defaultOption) {
              defaults[item.id] = defaultOption.product_id;
            } else if (item.pack_item_options.length > 0) {
              defaults[item.id] = item.pack_item_options[0].product_id;
            }
          }
        });
        setSelectedOptions(defaults);
      }
      
      setIsLoading(false);
    };

    fetchPack();
  }, [slug]);

  // Calculate pack price
  const calculatePrice = () => {
    if (!pack) return { subtotal: 0, discount: 0, total: 0 };

    let subtotal = 0;
    
    pack.pack_items.forEach(item => {
      if (item.item_type === 'fixed') {
        subtotal += item.products.price * item.quantity;
      } else if (item.item_type === 'variable' && item.pack_item_options) {
        const selectedProductId = selectedOptions[item.id];
        const selectedOption = item.pack_item_options.find(opt => opt.product_id === selectedProductId);
        if (selectedOption) {
          subtotal += selectedOption.products.price * item.quantity;
        }
      }
    });

    const discount = pack.discount_type === 'percentage'
      ? subtotal * (pack.discount_value / 100)
      : pack.discount_value;
    
    const total = Math.max(0, subtotal - discount);

    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculatePrice();
  const discountPercent = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0;

  const handleAddToCart = () => {
    if (!pack) return;
    
    // Add each item in the pack to cart
    pack.pack_items.forEach(item => {
      if (item.item_type === 'fixed') {
        const product = {
          id: item.products.id,
          slug: item.products.slug,
          name: item.products.title,
          price: item.products.price,
          images: item.products.product_images?.length > 0
            ? [item.products.product_images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0].image_url]
            : ['/placeholder.svg'],
          category: 'packs-entretien',
          collection: '',
          colors: [{ name: 'Standard', hex: '#1a1a1a' }],
          sizes: [{ size: 'Standard', available: true }],
          cupSizes: [],
          description: '',
          composition: '',
          care: '',
          style: 'packs-entretien',
          isNew: false,
          isBestseller: false,
          stock: { global: 1 },
        };
        addItem(product, 'Standard', 'Standard', item.quantity * quantity);
      } else if (item.item_type === 'variable' && item.pack_item_options) {
        const selectedProductId = selectedOptions[item.id];
        const selectedOption = item.pack_item_options.find(opt => opt.product_id === selectedProductId);
        if (selectedOption) {
          const product = {
            id: selectedOption.products.id,
            slug: selectedOption.products.slug,
            name: selectedOption.products.title,
            price: selectedOption.products.price,
            images: ['/placeholder.svg'],
            category: 'packs-entretien',
            collection: '',
            colors: [{ name: 'Standard', hex: '#1a1a1a' }],
            sizes: [{ size: 'Standard', available: true }],
            cupSizes: [],
            description: '',
            composition: '',
            care: '',
            style: 'packs-entretien',
            isNew: false,
            isBestseller: false,
            stock: { global: 1 },
          };
          addItem(product, 'Standard', 'Standard', item.quantity * quantity);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-medium mb-4">Pack non trouvé</h1>
        <Button asChild>
          <Link to="/categories/packs-entretien">Retour aux packs</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${pack.name} | Autopassion BJ`}
        description={pack.description || `Pack d'entretien ${pack.name} - Économisez avec nos packs complets`}
        keywords={`${pack.name}, pack entretien, bardahl, bénin, autopassion`}
        image={pack.image_url || '/placeholder.svg'}
        url={`/produits/${pack.slug}`}
        type="product"
      />
      <StructuredData
        type="product"
        data={{
          name: pack.name,
          description: pack.description || '',
          image: pack.image_url || '/placeholder.svg',
          price: total,
          currency: 'XOF',
          sku: pack.id,
          slug: pack.slug,
          availability: 'InStock',
        }}
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: 'Accueil', url: '/' },
            { name: 'Catégories', url: '/categories' },
            { name: 'Packs Entretien', url: '/categories/packs-entretien' },
            { name: pack.name, url: `/produits/${pack.slug}` },
          ],
        }}
      />
      <div className="py-8 md:py-12">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/categories" className="hover:text-foreground transition-colors">Catégories</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/categories/packs-entretien" className="hover:text-foreground transition-colors">Packs Entretien</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate">{pack.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="space-y-4">
              <div
                className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-zoom-in"
                onClick={() => setIsZoomed(true)}
              >
                <img
                  src={pack.image_url || '/placeholder.svg'}
                  alt={pack.name}
                  className="w-full h-full object-contain p-4"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge variant="default" className="bg-primary">
                    <Package className="h-3 w-3 mr-1" />
                    PACK
                  </Badge>
                  {discountPercent > 0 && <Badge variant="sale">-{discountPercent}%</Badge>}
                </div>
              </div>
            </div>

            {/* Pack Info */}
            <div>
              <div className="sticky top-24">
                <p className="text-sm text-muted-foreground mb-2">
                  Réf: {pack.id.toUpperCase().slice(0, 8)}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold mb-4">{pack.name}</h1>

                {/* Description */}
                {pack.description && (
                  <p className="text-muted-foreground mb-6 leading-relaxed">{pack.description}</p>
                )}

                {/* Price */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Prix unitaire</span>
                    <span className="text-sm line-through text-muted-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Réduction</span>
                      <span className="text-sm text-primary font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-semibold">Prix du pack</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Pack Items */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Contenu du pack</h3>
                  <div className="space-y-3">
                    {pack.pack_items.map((item) => (
                      <div key={item.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md overflow-hidden">
                            {item.products.product_images?.length > 0 ? (
                              <img
                                src={item.products.product_images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0].image_url}
                                alt={item.products.title}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {item.item_type === 'fixed' ? (
                              <>
                                <p className="text-sm font-medium truncate">{item.products.title}</p>
                                <p className="text-xs text-muted-foreground">Quantité: {item.quantity}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium mb-2">Choisissez votre produit</p>
                                <Select
                                  value={selectedOptions[item.id] || ''}
                                  onValueChange={(value) => setSelectedOptions(prev => ({ ...prev, [item.id]: value }))}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {item.pack_item_options?.map((option) => (
                                      <SelectItem key={option.id} value={option.product_id}>
                                        {option.products.title} - {formatPrice(option.products.price)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Quantité: {item.quantity}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Quantité de packs</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart & Share */}
                <div className="flex gap-3 mb-4">
                  <Button
                    size="xl"
                    className="flex-1"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: pack.name,
                          text: `Découvrez ${pack.name} sur Autopassion BJ`,
                          url: window.location.href,
                        }).catch(() => { });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Lien copié !');
                      }
                    }}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* WhatsApp Button */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mb-8 gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white border-0"
                  onClick={() => {
                    const msg = encodeURIComponent(`Bonjour, je souhaite commander : ${pack.name} (${formatPrice(total)})\n${window.location.href}`);
                    window.open(`https://wa.me/2290196526472?text=${msg}`, '_blank');
                  }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Commander sur WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Products Carousel */}
          <PopularProductsCarousel 
            title="Produits populaires"
            description="Découvrez les produits les plus appréciés par nos clients"
            className="mt-16"
          />

          {/* Image Zoom Modal */}
          {isZoomed && (
            <div
              className="fixed inset-0 bg-foreground/90 z-50 flex items-center justify-center p-4"
              onClick={() => setIsZoomed(false)}
            >
              <img src={pack.image_url || '/placeholder.svg'} alt={pack.name} className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
