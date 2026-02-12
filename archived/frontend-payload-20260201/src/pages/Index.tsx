import { HeroSection } from '@/components/home/HeroSection';
import { CategorySections } from '@/components/home/CategorySections';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { TrustSection } from '@/components/home/TrustSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

const Index = () => {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <NewArrivalsSection />
      <CategorySections />
      <TestimonialsSection />
      <TrustSection />
      <NewsletterSection />
    </>
  );
};

export default Index;
