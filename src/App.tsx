import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from "@/context/CartContext";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";

// Pages
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Selections from "./pages/Selections";
import SelectionDetail from "./pages/SelectionDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutCallback from "./pages/CheckoutCallback";
import Confirmation from "./pages/Confirmation";
import NewArrivals from "./pages/NewArrivals";
import Contact from "./pages/Contact";
import About from "./pages/About";
import SizeGuide from "./pages/SizeGuide";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Unsubscribe from "./pages/Unsubscribe";
import MentionsLegales from "./pages/legal/MentionsLegales";
import CGV from "./pages/legal/CGV";
import PolitiqueConfidentialite from "./pages/legal/PolitiqueConfidentialite";
import LivraisonRetours from "./pages/legal/LivraisonRetours";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="bottom-right" />
        <BrowserRouter>
          <ScrollToTop />
          <CartProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/collections" element={<Categories />} />
                <Route path="/collections/:slug" element={<CategoryDetail />} />
                <Route path="/selections" element={<Selections />} />
                <Route path="/selections/:slug" element={<SelectionDetail />} />
                <Route path="/produits/:slug" element={<ProductDetail />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/callback" element={<CheckoutCallback />} />
                <Route path="/confirmation/:orderId" element={<Confirmation />} />
                <Route path="/nouveautes" element={<NewArrivals />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/guide-des-tailles" element={<SizeGuide />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/cgv" element={<CGV />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                <Route path="/livraison-retours" element={<LivraisonRetours />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <WhatsAppButton />
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
