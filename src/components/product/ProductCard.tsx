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
}

export function ProductCard({ product, className, style }: ProductCardProps) {
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

  return (
    <div className={cn("group block bg-card rounded-lg overflow-hidden hover-lift", className)} style={style}>
      <Link to={`/produits/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && <Badge variant="new">{t.new}</Badge>}
            {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
            {product.isBestseller && <Badge variant="bestseller">{t.bestseller}</Badge>}
          </div>
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button variant="default" size="sm" className={cn("w-full gap-2 transition-transform", isAdding && "animate-cart-bounce")} onClick={handleAddToCart}>
              <ShoppingBag className="h-4 w-4" />
              {t.addToCart}
            </Button>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/produits/${product.slug}`}>
          <h3 className="font-medium text-sm md:text-base truncate group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        {product.composition && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{product.composition}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
