import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Share2, ShoppingBag, Star, ChevronDown } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function StarRating({ rating, onRate, readonly = false }: { rating: number; onRate?: (r: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={cn("transition-colors", readonly ? "cursor-default" : "cursor-pointer")}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              "h-5 w-5",
              (hover || rating) >= star
                ? "fill-primary text-primary"
                : "fill-muted text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [formData, setFormData] = useState({ author_name: '', rating: 0, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState('');

  const fetchReviews = async () => {
    if (loaded) return;
    setLoading(true);
    const { data } = await supabase
      .from('product_reviews' as any)
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    setReviews((data as unknown as Review[]) || []);
    setLoaded(true);
    setLoading(false);
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author_name.trim() || formData.rating === 0) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('product_reviews' as any)
      .insert({
        product_id: productId,
        author_name: formData.author_name.trim(),
        rating: formData.rating,
        comment: formData.comment.trim() || null,
      });
    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setFormData({ author_name: '', rating: 0, comment: '' });
      // Refresh reviews
      setLoaded(false);
      await fetchReviews();
    }
  };

  const handleToggle = (value: string) => {
    const newVal = open === value ? '' : value;
    setOpen(newVal);
    if (newVal === 'reviews' && !loaded) fetchReviews();
  };

  return (
    <div className="mt-8">
      <Accordion type="single" collapsible value={open} onValueChange={handleToggle}>
        <AccordionItem value="reviews" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-base">Avis clients</span>
              {loaded && reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(avgRating)} readonly />
                  <span className="text-sm text-muted-foreground">
                    {avgRating.toFixed(1)} ({reviews.length} avis)
                  </span>
                </div>
              )}
              {!loaded && (
                <span className="text-sm text-muted-foreground">Cliquez pour voir les avis</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Reviews list */}
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    Aucun avis pour l'instant. Soyez le premier à donner votre avis !
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{review.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <StarRating rating={review.rating} readonly />
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit form */}
                <div className="border-t border-border pt-6">
                  <h4 className="font-semibold mb-4">Laisser un avis</h4>
                  {submitted ? (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                      <p className="text-sm font-medium text-primary">✓ Merci pour votre avis !</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">Votre nom *</label>
                        <input
                          type="text"
                          value={formData.author_name}
                          onChange={e => setFormData(f => ({ ...f, author_name: e.target.value }))}
                          required
                          placeholder="Votre prénom"
                          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Note *</label>
                        <StarRating rating={formData.rating} onRate={r => setFormData(f => ({ ...f, rating: r }))} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Commentaire</label>
                        <textarea
                          value={formData.comment}
                          onChange={e => setFormData(f => ({ ...f, comment: e.target.value }))}
                          rows={3}
                          placeholder="Partagez votre expérience avec ce produit..."
                          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting || !formData.author_name.trim() || formData.rating === 0}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {submitting ? 'Envoi...' : 'Publier l\'avis'}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  
  const { data: apiProduct, isLoading } = useProduct(slug || '');
  const staticProduct = getProductBySlug(slug || '');
  const product = apiProduct || staticProduct;

  const relatedProducts = product ? getRelatedProducts(product) : [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  const hasStock = () => (product?.stock?.['global'] || 0) > 0;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-32" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 flex-1" />
            </div>

            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
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

              {/* Reviews Section */}
              <ReviewsSection productId={product.id} />
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
