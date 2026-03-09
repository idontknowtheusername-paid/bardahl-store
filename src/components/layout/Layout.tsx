import { ReactNode, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartModal } from '@/components/cart/CartModal';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children: ReactNode;
}

// Generate or retrieve session ID for visitor tracking
function getSessionId() {
  let sid = sessionStorage.getItem('_ap_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('_ap_sid', sid);
  }
  return sid;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const hideFooter = pathname.startsWith('/mon-espace');
  const trackedRef = useRef<string | null>(null);

  // Track page views
  useEffect(() => {
    // Avoid tracking same path twice in a row
    if (trackedRef.current === pathname) return;
    trackedRef.current = pathname;

    const sessionId = getSessionId();
    supabase
      .from('page_views' as any)
      .insert({ page_path: pathname, session_id: sessionId } as any)
      .then(() => {/* silent */});
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <CartModal />
    </div>
  );
}
