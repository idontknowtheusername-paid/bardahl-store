import { HeroSection } from '@/components/home/HeroSection';
import { OilSelector } from '@/components/home/OilSelector';
import { CategorySections } from '@/components/home/CategorySections';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TrustSection } from '@/components/home/TrustSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

const Index = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <OilSelector />
      <CategoriesSection />
      <NewArrivalsSection />
      <CategorySections />
      <TrustSection />
      <NewsletterSection />
    </>
  );
};

export default Index;
