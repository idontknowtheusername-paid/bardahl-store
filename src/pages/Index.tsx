import { HeroSection } from '@/components/home/HeroSection';
import { PopularProductsSection } from '@/components/home/PopularProductsSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { CategorySections } from '@/components/home/CategorySections';
import { TrustSection } from '@/components/home/TrustSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

const Index = () => {
  return (
    <>
      <HeroSection />
      <PopularProductsSection />
      <CategoriesSection />
      <CategorySections />
      <TrustSection />
      <NewsletterSection />
    </>
  );
};

export default Index;
