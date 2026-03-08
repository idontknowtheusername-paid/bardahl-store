import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartModal } from '@/components/cart/CartModal';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const hideFooter = pathname.startsWith('/mon-espace');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <CartModal />
    </div>
  );
}
