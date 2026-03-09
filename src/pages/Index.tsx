import { SEOHead } from '@/components/SEOHead';
import { StructuredData } from '@/components/StructuredData';
import { HeroSection } from '@/components/home/HeroSection';
import { PopularProductsSection } from '@/components/home/PopularProductsSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { CategorySections } from '@/components/home/CategorySections';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { WhatsAppSection } from '@/components/home/WhatsAppSection';
import { TrustSection } from '@/components/home/TrustSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

const Index = () => {
  return (
    <>
      <SEOHead
        title="Autopassion BJ - Huiles moteur & entretien auto au Bénin"
        description="Boutique en ligne de produits automobiles au Bénin. Huiles moteur, additifs moteur, traitement injecteur et produits d'entretien. Livraison rapide à Parakou, Cotonou et tout le Bénin."
        keywords="huile moteur Bénin, additif moteur Bénin, traitement injecteur, entretien moteur, produits automobile Bénin, autopassion, bardahl bénin"
      />
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <HeroSection />
      <PopularProductsSection />
      <CategoriesSection />
      <CategorySections />
      <TestimonialsSection />
      <WhatsAppSection />
      <TrustSection />
      <NewsletterSection />
    </>
  );
};

export default Index;
