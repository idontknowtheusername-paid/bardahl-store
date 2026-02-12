import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChatWidget } from '@/components/ChatWidget';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  ShoppingCart,
  Users,
  Percent,
  Image,
  Mail,
  MessageSquare,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  FileText,
  Users as UsersIcon,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/products', label: t.nav.products, icon: Package },
    { href: '/categories', label: t.nav.categories, icon: FolderTree },
    { href: '/collections', label: t.nav.collections, icon: Layers },
    { href: '/orders', label: t.nav.orders, icon: ShoppingCart },
    { href: '/customers', label: t.nav.customers, icon: UsersIcon },
    { href: '/users', label: t.nav.users, icon: UsersIcon },
    { href: '/promo-codes', label: t.nav.promoCodes, icon: Percent },
    { href: '/blog', label: t.nav.blog, icon: FileText },
    { href: '/media', label: t.nav.media, icon: Image },
    { href: '/newsletter', label: t.nav.newsletter, icon: Mail },
    { href: '/messages', label: t.nav.messages, icon: MessageSquare },
    { href: '/shipping', label: t.nav.shipping, icon: Truck },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background flex items-center px-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="ml-3 font-semibold">{t.nav.adminPanel}</span>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-sidebar border-r transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn('h-14 border-b flex items-center px-4', collapsed && 'justify-center')}>
            {!collapsed && <span className="font-bold text-lg">{t.nav.adminPanel}</span>}
            <Button
              variant="ghost"
              size="icon"
              className={cn('hidden lg:flex ml-auto', collapsed && 'ml-0')}
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            {!collapsed && (
              <p className="text-sm text-muted-foreground truncate mb-2">
                {user?.email}
              </p>
            )}
            <Button
              variant="ghost"
              className={cn('w-full justify-start', collapsed && 'justify-center px-2')}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">{t.nav.logout}</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300 pt-14 lg:pt-0',
          collapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        <div className="p-6">{children}</div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
