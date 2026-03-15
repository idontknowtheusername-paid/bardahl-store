import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export function ProductCard({ product, className, style, compact = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const t = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes[0]?.size || 'Standard';
    const defaultColor = product.colors[0]?.name || 'Standard';
    setIsAdding(true);
    addItem(product, defaultSize, defaultColor, 1);
    setTimeout(() => setIsAdding(false), 300);
  };

  // Determine the correct link path - if slug starts with "packs/", use it as-is, otherwise prepend "/produits/"
  const linkPath = product.slug.startsWith('packs/') ? `/${product.slug}` : `/produits/${product.slug}`;

  return (
    <div className={cn("group block bg-card rounded-lg overflow-hidden hover-lift h-full flex flex-col", className)} style={style}>
      <Link to={linkPath} className="flex-shrink-0">
        <div className={cn("relative overflow-hidden bg-muted", compact ? "aspect-[4/3]" : "aspect-square")}>
          <img src={product.images[0]} alt={product.name}
            className={cn("w-full h-full object-contain transition-transform duration-500 group-hover:scale-105", compact ? "p-1" : "p-2")} loading="lazy" />
          <div className={cn("absolute flex flex-col gap-2", compact ? "top-1.5 left-1.5" : "top-3 left-3")}>
            {product.isNew && <Badge variant="new" className={compact ? "text-[10px] px-1.5 py-0.5" : ""}>{t.new}</Badge>}
            {discount > 0 && <Badge variant="sale" className={compact ? "text-[10px] px-1.5 py-0.5" : ""}>-{discount}%</Badge>}
            {product.isBestseller && <Badge variant="bestseller" className={compact ? "text-[10px] px-1.5 py-0.5" : ""}>{t.bestseller}</Badge>}
          </div>
          <div className={cn("absolute left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300", compact ? "bottom-1.5" : "bottom-3")}>
            <Button variant="default" size={compact ? "sm" : "sm"} className={cn("w-full gap-2 transition-transform", compact && "text-xs h-7", isAdding && "animate-cart-bounce")} onClick={handleAddToCart}>
              <ShoppingBag className={compact ? "h-3 w-3" : "h-4 w-4"} />
              {t.addToCart}
            </Button>
          </div>
        </div>
      </Link>
      <div className={cn("flex-1 flex flex-col justify-between", compact ? "p-2" : "p-4")}>
        <div>
          <Link to={linkPath}>
            <h3 className={cn("font-medium line-clamp-2 group-hover:text-primary transition-colors", compact ? "text-xs" : "text-sm md:text-base")}>{product.name}</h3>
          </Link>
          {product.composition && (
            <p className={cn("text-muted-foreground mt-1 line-clamp-1", compact ? "text-[10px]" : "text-xs")}>{product.composition}</p>
          )}
        </div>
        <div className={cn("flex items-center gap-2", compact ? "mt-1" : "mt-2")}>
          <span className={cn("font-bold text-primary", compact ? "text-xs" : "")}>{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className={cn("text-muted-foreground line-through", compact ? "text-[10px]" : "text-sm")}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
