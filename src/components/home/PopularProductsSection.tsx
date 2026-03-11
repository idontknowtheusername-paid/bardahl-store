import { PopularProductsCarousel } from '@/components/product/PopularProductsCarousel';

export function PopularProductsSection() {
  return (
    <PopularProductsCarousel
      title="Produits les plus populaires"
      description="Les produits préférés de nos clients, basés sur les ventes réelles."
      showDescription={true}
      showSeeAll={true}
      limit={6}
    />
  );
}