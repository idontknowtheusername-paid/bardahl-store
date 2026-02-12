import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Heart, Share2, ShoppingBag, ChevronLeft } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { getProductBySlug, getRelatedProducts } from '@/data/products';
import { useProduct } from '@/hooks/use-supabase-api';

const sizeGuide = {
  XS: { tour: '80-84', taille: '58-62' },
  S: { tour: '84-88', taille: '62-66' },
  M: { tour: '88-92', taille: '66-70' },
  L: { tour: '92-96', taille: '70-74' },
  XL: { tour: '96-100', taille: '74-78' },
  XXL: { tour: '100-104', taille: '78-82' },
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  
  // Try API first, fallback to static
  const { data: apiProduct, isLoading } = useProduct(slug || '');
  const staticProduct = getProductBySlug(slug || '');
  const product = apiProduct || staticProduct;
  const relatedProducts = product ? getRelatedProducts(product) : [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCupSize, setSelectedCupSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // Initialize selected color when product loads
  useEffect(() => {
    if (product && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]?.name || '');
    }
  }, [product]);

  // Check if product has stock (global stock)
  const hasStock = () => {
    return (product?.stock?.['global'] || 0) > 0;
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-rose border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-medium mb-4">Produit non trouvé</h1>
        <Button asChild>
          <Link to="/collections">Retour aux collections</Link>
        </Button>
      </div>
    );
  }

  const hasCupSizes = (product?.cupSizes?.length || 0) > 0;
  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize || !product) return;
    if (hasCupSizes && !selectedCupSize) return;
    if (!hasStock()) return;

    addItem(product, selectedSize, selectedColor, quantity, selectedCupSize || undefined);
  };

  const isAddToCartDisabled = !selectedSize || (hasCupSizes && !selectedCupSize) || !hasStock();

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/collections" className="hover:text-foreground transition-colors">
            Collections
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            to={`/collections/${product.category}`}
            className="hover:text-foreground transition-colors capitalize"
          >
            {product.category.replace('-', ' ')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge variant="new">Nouveau</Badge>}
                {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
                {product.isBestseller && <Badge variant="bestseller">Bestseller</Badge>}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                      selectedImage === index
                        ? "border-foreground"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Vue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="sticky top-24">
              <p className="text-sm text-muted-foreground mb-2">
                Réf: {product.id.toUpperCase().slice(0, 8)}
              </p>
              <h1 className="font-serif text-2xl md:text-3xl font-medium mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-medium text-rose">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">
                  Couleur: <span className="font-normal">{selectedColor}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all",
                        selectedColor === color.name
                          ? "border-foreground scale-110"
                          : "border-border hover:scale-105"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Taille</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-sm text-rose hover:underline">
                        Guide des tailles
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-serif text-xl">
                          Guide des tailles
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2">Taille</th>
                              <th className="text-left py-2">Tour de poitrine</th>
                              <th className="text-left py-2">Tour de taille</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(sizeGuide).map(([size, measurements]) => (
                              <tr key={size} className="border-b border-border">
                                <td className="py-2 font-medium">{size}</td>
                                <td className="py-2">{measurements.tour} cm</td>
                                <td className="py-2">{measurements.taille} cm</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(sizeObj => (
                    <button
                      key={sizeObj.size}
                      onClick={() => {
                        setSelectedSize(sizeObj.size);
                        if (!hasCupSizes) setSelectedCupSize(''); // Reset cup size if not applicable
                      }}
                      className={cn(
                        "min-w-12 h-12 px-4 text-sm border rounded-md transition-colors",
                        selectedSize === sizeObj.size
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      )}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cup Size Selection (Bras only) */}
              {hasCupSizes && selectedSize && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Bonnet</p>
                  <div className="flex flex-wrap gap-2">
                    {product.cupSizes?.map(cup => (
                      <button
                        key={cup}
                        onClick={() => setSelectedCupSize(cup)}
                        className={cn(
                          "w-12 h-12 text-sm border rounded-md transition-colors",
                          selectedCupSize === cup
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-foreground"
                        )}
                      >
                        {cup}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Quantité</p>
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

              {/* Add to Cart */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="rose"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isAddToCartDisabled}
                >
                  {!selectedSize
                    ? 'Sélectionnez une taille'
                    : hasCupSizes && !selectedCupSize
                      ? 'Sélectionnez un bonnet'
                      : !hasStock()
                        ? 'Rupture de stock'
                    : 'Ajouter au panier'}
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Description & Details */}
              <Accordion type="single" collapsible defaultValue="description">
                <AccordionItem value="description">
                  <AccordionTrigger>Description</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="composition">
                  <AccordionTrigger>Composition</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{product.composition}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care">
                  <AccordionTrigger>Entretien</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{product.care}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="font-serif text-2xl md:text-3xl font-medium mb-8">
              Vous aimerez aussi
            </h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {relatedProducts.map(product => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 bg-background border-border hover:bg-muted" />
              <CarouselNext className="hidden md:flex -right-4 bg-background border-border hover:bg-muted" />
            </Carousel>
          </section>
        )}

        {/* Image Zoom Modal */}
        {isZoomed && (
          <div
            className="fixed inset-0 bg-foreground/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
