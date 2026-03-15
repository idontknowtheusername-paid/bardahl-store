import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PacksCarouselProps {
  className?: string;
}

export function PacksCarousel({ className = '' }: PacksCarouselProps) {
  // Fetch packs from product_packs table
  const { data: packs } = useQuery({
    queryKey: ['product-packs-carousel'],
    queryFn: async () => {
      const { data } = await supabase
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
            quantity,
            product_id,
            products (price, title)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Transform packs to Product format for ProductCard
  const transformedPacks = useMemo(() => {
    if (!packs) return [];

    return packs.map(pack => {
      // Calculate pack price from items
      const items = (pack.pack_items as any[]) || [];
      const subtotal = items.reduce((sum, item) => {
        const price = item.products?.price || 0;
        return sum + (price * item.quantity);
      }, 0);

      // Apply discount
      const discount = pack.discount_type === 'percentage'
        ? subtotal * (pack.discount_value / 100)
        : pack.discount_value;
      const finalPrice = Math.max(0, subtotal - discount);

      return {
        id: pack.id,
        slug: `packs/${pack.slug}`, // Use /packs/:slug for pack detail page
        name: pack.name,
        price: finalPrice,
        originalPrice: subtotal > finalPrice ? subtotal : undefined,
        images: [pack.image_url || '/placeholder.svg'],
        category: 'packs-entretien',
        collection: '',
        colors: [{ name: 'Standard', hex: '#1a1a1a' }],
        sizes: [{ size: 'Standard', available: true }],
        cupSizes: [],
        description: pack.description || '',
        composition: '',
        care: '',
        style: 'packs-entretien',
        isNew: false,
        isBestseller: false,
        stock: { global: 1 },
      };
    });
  }, [packs]);

  if (!transformedPacks.length) return null;

  return (
    <section className={`py-10 md:py-16 bg-muted/30 ${className}`}>
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-primary text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Package className="h-4 w-4" /> PACKS
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Packs recommandés</h2>
            <p className="text-muted-foreground text-base mt-2 hidden md:block">
              Économisez avec nos packs d'entretien complets
            </p>
          </div>
          <Button variant="link" className="p-0 text-primary font-semibold shrink-0 ml-4" asChild>
            <Link to="/categories/packs-entretien">Voir tous</Link>
          </Button>
        </div>
        <Carousel opts={{ align: 'start', loop: transformedPacks.length > 3 }} className="w-full">
          <CarouselContent className="-ml-4 md:-ml-6">
            {transformedPacks.map((product, index) => (
              <CarouselItem key={product.id} className="pl-4 md:pl-6 basis-[45%] sm:basis-[40%] md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 md:-left-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
          <CarouselNext className="-right-4 md:-right-6 bg-background/90 backdrop-blur-sm border-border hover:bg-background shadow-md" />
        </Carousel>
      </div>
    </section>
  );
}
