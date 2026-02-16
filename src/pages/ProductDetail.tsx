import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Share2, ShoppingBag, ChevronLeft } from 'lucide-react';
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

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  
  const { data: apiProduct, isLoading } = useProduct(slug || '');
  const staticProduct = getProductBySlug(slug || '');
  const product = apiProduct || staticProduct;

  // Debug logs
  console.log('🔍 ProductDetail Debug:');
  console.log('slug:', slug);
  console.log('apiProduct:', apiProduct);
  console.log('staticProduct:', staticProduct);
  console.log('product:', product);
  console.log('product category:', product?.category);

  const relatedProducts = product ? getRelatedProducts(product) : [];
  console.log('relatedProducts count:', relatedProducts.length);
  console.log('relatedProducts:', relatedProducts);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  const hasStock = () => (product?.stock?.['global'] || 0) > 0;

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-medium mb-4">Produit non trouvé</h1>
        <Button asChild>
          <Link to="/categories">Retour aux catégories</Link>
        </Button>
      </div>
    );
  }

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!hasStock() || !product) return;
    const defaultSize = product.sizes[0]?.size || 'Standard';
    const defaultColor = product.colors[0]?.name || 'Standard';
    addItem(product, defaultSize, defaultColor, quantity);
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/categories" className="hover:text-foreground transition-colors">Catégories</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge variant="new">Nouveau</Badge>}
                {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
                {product.isBestseller && <Badge variant="bestseller">Bestseller</Badge>}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                      selectedImage === index ? "border-primary" : "border-transparent hover:border-border"
                    )}
                  >
                    <img src={image} alt={`${product.name} - Vue ${index + 1}`} className="w-full h-full object-contain p-1" />
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
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>

              {/* Capacity / Viscosity info */}
              {(product.composition || product.style) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.composition && (
                    <span className="px-3 py-1 bg-muted rounded-md text-sm">{product.composition}</span>
                  )}
                  {product.style && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">{product.style}</span>
                  )}
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
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!hasStock()}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {!hasStock() ? 'Rupture de stock' : 'Ajouter au panier'}
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
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                  </AccordionContent>
                </AccordionItem>
                {product.composition && (
                  <AccordionItem value="specs">
                    <AccordionTrigger>Spécifications</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{product.composition}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {product.care && (
                  <AccordionItem value="usage">
                    <AccordionTrigger>Utilisation</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{product.care}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Vous aimerez aussi</h2>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {relatedProducts.map(p => (
                  <CarouselItem key={p.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard product={p} />
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
            <img src={product.images[selectedImage]} alt={product.name} className="max-w-full max-h-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
