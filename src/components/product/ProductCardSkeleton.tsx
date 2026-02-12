import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCardSkeleton({ className, style }: ProductCardSkeletonProps) {
  return (
    <div className={cn("bg-card rounded-lg overflow-hidden", className)} style={style}>
      {/* Image skeleton */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
        
        {/* Badge skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* Colors */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-3 h-3 rounded-full" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton 
          key={i} 
          className="animate-pulse"
          style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

interface ProductCarouselSkeletonProps {
  count?: number;
}

export function ProductCarouselSkeleton({ count = 4 }: ProductCarouselSkeletonProps) {
  return (
    <div className="flex gap-4 md:gap-6 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex-shrink-0 w-[45%] sm:w-[40%] md:w-1/3 lg:w-1/4"
        >
          <ProductCardSkeleton 
            className="animate-pulse"
            style={{ animationDelay: `${i * 75}ms` } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}
