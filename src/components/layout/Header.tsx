import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, Truck, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { languages } from '@/i18n';
import { searchProducts } from '@/data/products';
import type { Product } from '@/types/product';

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const navigate = useNavigate();

  const currentLang = languages.find(l => l.code === language);

  const navLinks = [
    { label: t.navMotorOils, href: '/collections/huiles-moteur' },
    { label: t.navAdditives, href: '/collections/additifs' },
    { label: t.navMaintenance, href: '/collections/entretien' },
    { label: t.navAllProducts, href: '/collections' },
    { label: t.navAdvice, href: '/blog' },
    { label: t.navContact, href: '/contact' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      setSearchResults(searchProducts(query));
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      navigate(`/collections?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleProductClick = (slug: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/produits/${slug}`);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Promo Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container">
          <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold">
            <Truck className="h-4 w-4" />
            <span>{t.freeShipping}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-secondary text-secondary-foreground border-b border-secondary/20">
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-secondary-foreground hover:text-primary">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-secondary text-secondary-foreground border-secondary/20">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <span className="text-primary font-bold text-xl tracking-tight">BARDAHL</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1">
                  {navLinks.map(({ label, href }) => (
                    <Link key={href} to={href} onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide">
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-primary font-extrabold text-2xl md:text-3xl tracking-tight">BARDAHL</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(({ label, href }) => (
                <Link key={href} to={href}
                  className="text-sm font-semibold uppercase tracking-wide text-secondary-foreground/80 hover:text-primary transition-colors">
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Language & Currency Selector */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-secondary-foreground hover:text-primary gap-1 text-xs"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                >
                  <span className="text-base">{currentLang?.flag}</span>
                  <span className="hidden sm:inline">{currency}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {showLangMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
                      {/* Languages */}
                      <p className="text-xs font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                        <Globe className="h-3 w-3 inline mr-1" />
                        Language
                      </p>
                      {languages.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-muted flex items-center gap-2 ${
                            language === lang.code ? 'bg-primary/10 text-primary font-bold' : ''
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}

                      <div className="border-t border-border my-2" />

                      {/* Currency */}
                      <p className="text-xs font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                        {t.currency}
                      </p>
                      {(['EUR', 'FCFA'] as const).map(c => (
                        <button
                          key={c}
                          onClick={() => { setCurrency(c); setShowLangMenu(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-muted ${
                            currency === c ? 'bg-primary/10 text-primary font-bold' : ''
                          }`}
                        >
                          {c === 'EUR' ? '€ Euro' : 'FCFA Franc CFA'}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Search */}
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary">
                    <Search className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto max-h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>{t.search}</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSearchSubmit} className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="search" placeholder={t.searchPlaceholder} value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)} className="pl-10" autoFocus />
                    </div>
                  </form>
                  {searchResults.length > 0 && (
                    <div className="mt-4 max-h-[50vh] overflow-y-auto">
                      <p className="text-sm text-muted-foreground mb-3">{searchResults.length} {t.searchResults}</p>
                      <div className="space-y-2">
                        {searchResults.slice(0, 8).map((product) => (
                          <button key={product.id} onClick={() => handleProductClick(product.slug)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left">
                            <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchQuery.length >= 2 && searchResults.length === 0 && (
                    <p className="mt-4 text-center text-muted-foreground">{t.noResults} "{searchQuery}"</p>
                  )}
                </SheetContent>
              </Sheet>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative text-secondary-foreground hover:text-primary"
                onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
