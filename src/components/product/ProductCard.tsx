import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCard({ product, className, style }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get first available size
    const availableSize = product.sizes.find(s => s.available)?.size || product.sizes[0]?.size || 'M';
    const defaultColor = product.colors[0]?.name || 'Noir';
    const defaultCupSize = product.cupSizes?.[0];
    
    setIsAdding(true);
    addItem(product, availableSize, defaultColor, 1, defaultCupSize);
    
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div
      className={cn(
        "group block bg-card rounded-lg overflow-hidden hover-lift",
        className
      )}
      style={style}
    >
      <Link to={`/produits/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge variant="new">Nouveau</Badge>
            )}
            {discount > 0 && (
              <Badge variant="sale">-{discount}%</Badge>
            )}
            {product.isBestseller && (
              <Badge variant="bestseller">Bestseller</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-label="Ajouter aux favoris"
          >
            <Heart className="h-4 w-4" />
          </button>

          {/* Quick view on hover - secondary image */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} - Vue 2`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
            />
          )}

          {/* Add to cart button on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="rose"
              size="sm"
              className={cn(
                "w-full gap-2 transition-transform",
                isAdding && "animate-cart-bounce"
              )}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              Ajouter au panier
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/produits/${product.slug}`}>
          <h3 className="font-medium text-sm md:text-base truncate group-hover:text-rose transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Colors */}
        <div className="flex items-center gap-1.5 mt-2">
          {product.colors.slice(0, 4).map(color => (
            <span
              key={color.name}
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium text-rose">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
