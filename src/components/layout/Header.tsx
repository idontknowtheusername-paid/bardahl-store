import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, ChevronDown, Stethoscope, User, Wrench, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProductSearch } from '@/hooks/use-product-search';
import { SeasonalBanner } from './SeasonalBanner';

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState('');
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use intelligent search hook
  const { data: searchResults = [], isLoading: isSearching } = useProductSearch(
    debouncedQuery,
    isSearchOpen && debouncedQuery.length >= 2
  );

  const productCategories = [
    { label: 'Huile moteur', href: '/categories/huiles-moteur' },
    {
      label: 'Filtres voiture',
      href: '/categories/filtres',
      subcategories: [
        { label: 'Filtres à huile', href: '/categories/filtres-a-huile' },
        { label: 'Filtres à air', href: '/categories/filtres-a-air' },
        { label: 'Filtres gasoil', href: '/categories/filtres-gasoil' },
        { label: 'Filtres hydrauliques', href: '/categories/filtres-hydrauliques' },
      ],
    },
    {
      label: 'Additifs & Traitements',
      href: '/categories/additifs',
      subcategories: [
        { label: 'Additifs carburant', href: '/categories/additifs-carburant' },
        { label: 'Additifs moteur', href: '/categories/additifs-moteur' },
        { label: 'Autres additifs & traitements', href: '/categories/autres-additifs' },
      ],
    },
    { label: 'Liquide de refroidissement radiateur', href: '/categories/liquides' },
    { label: 'Liquide de frein', href: '/categories/liquide-de-frein' },
    { label: 'Huile boîte de vitesse & transmission', href: '/categories/transmission' },
    { label: 'Entretien & Nettoyage auto', href: '/categories/entretien' },
    { label: 'Purifiant & désodorisant', href: '/categories/purifiant-desodorisant' },
    { label: 'Packs entretien voiture', href: '/categories/packs-entretien' },
    { label: 'Produits professionnels garage & atelier', href: '/categories/special-atelier' },
    { label: 'Équipements de protection (EPI)', href: '/categories/epi' },
    { label: 'Accessoires & électronique', href: '/categories/accessoires-electronique' },
  ];

  const navLinks = [
    { label: 'Produits', href: '/categories', hasSubmenu: true },
    { label: 'Diagnostic moteur', href: '/diagnostic', icon: Stethoscope },
    { label: 'Entretien véhicule', href: '/entretien', icon: Wrench },
    { label: 'Mon espace', href: '/mon-espace', icon: Car },
  ];

  const secondaryLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Conseils auto', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'À propos', href: '/a-propos' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      const queryToUse = searchQuery;
      setSearchQuery('');
      navigate(`/categories?search=${encodeURIComponent(queryToUse)}`);
    }
  };

  const handleProductClick = (slug: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/produits/${slug}`);
  };

  return (
    <header className="sticky top-0 z-50">
      <SeasonalBanner />

      <div className="bg-secondary text-secondary-foreground border-b border-secondary/20">
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left side: Menu + Search (mobile only) */}
            <div className="flex items-center gap-1">
              {/* Mobile Menu */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-secondary-foreground hover:text-accent">
                    <Menu className="h-7 w-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-secondary text-secondary-foreground border-secondary/20 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-left">
                      <span className="text-accent font-extrabold text-2xl tracking-tight">AUTO</span>
                      <span className="text-primary font-extrabold text-2xl tracking-tight">PASSION</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-8 flex flex-col gap-1">
                    {navLinks.map(({ label, href, hasSubmenu, icon: Icon }) => (
                      <div key={href}>
                        {hasSubmenu ? (
                          <>
                            <div className="flex items-center">
                              <Link to={href} onClick={() => setIsMenuOpen(false)}
                                className="flex-1 px-3 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                                {label}
                              </Link>
                              <button onClick={() => setMobileSubOpen(mobileSubOpen === 'products' ? '' : 'products')}
                                className="p-3 hover:bg-primary/10 rounded-lg transition-colors">
                                <ChevronDown className={`h-4 w-4 transition-transform ${mobileSubOpen === 'products' ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                            {(mobileSubOpen === 'products' || productCategories.some(cat => mobileSubOpen === cat.label)) && (
                              <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-2">
                                {productCategories.map((cat, idx) => (
                                  <div key={`cat-${idx}-${cat.label}`}>
                                    {cat.subcategories ? (
                                      <>
                                        <div className="flex items-center">
                                          <Link to={cat.href} onClick={() => setIsMenuOpen(false)}
                                            className="flex-1 block px-3 py-2 rounded text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                                            {cat.label}
                                          </Link>
                                          <button
                                            onClick={() => setMobileSubOpen(mobileSubOpen === cat.label ? 'products' : cat.label)}
                                            className="p-2 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
                                          >
                                            <ChevronDown className={`h-3 w-3 transition-transform ${mobileSubOpen === cat.label ? 'rotate-180' : ''}`} />
                                          </button>
                                        </div>
                                        {mobileSubOpen === cat.label && (
                                          <div className="pl-3 flex flex-col gap-0.5">
                                            {cat.subcategories.map((sub, subIdx) => (
                                              <Link key={`sub-${idx}-${subIdx}`} to={sub.href} onClick={() => setIsMenuOpen(false)}
                                                className="px-3 py-1.5 rounded text-xs text-secondary-foreground/60 hover:text-primary transition-colors">
                                                {sub.label}
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <Link to={cat.href} onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 rounded text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                                        {cat.label}
                                      </Link>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <Link to={href} onClick={() => setIsMenuOpen(false)}
                            className="px-3 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                            {Icon && <Icon className="h-5 w-5" />}
                            {label}
                          </Link>
                        )}
                      </div>
                    ))}
                    <div className="border-t border-secondary-foreground/10 my-3" />
                    {secondaryLinks.map(({ label, href }) => (
                      <Link key={href} to={href} onClick={() => setIsMenuOpen(false)}
                        className="px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm text-secondary-foreground/60">
                        {label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Search - mobile only, next to menu */}
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-secondary-foreground hover:text-accent">
                    <Search className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto max-h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>{t.search}</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSearchSubmit} className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="search" placeholder={t.searchPlaceholder} value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)} className="pl-10 text-base" autoFocus />
                    </div>
                  </form>

                  {/* Loading state */}
                  {isSearching && debouncedQuery.length >= 2 && (
                    <div className="mt-4 flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Recherche en cours...</span>
                    </div>
                  )}

                  {/* Results */}
                  {!isSearching && searchResults.length > 0 && (
                    <div className="mt-4 max-h-[50vh] overflow-y-auto">
                      <p className="text-sm text-muted-foreground mb-3">
                        {searchResults.length} {t.searchResults}
                        {searchResults.length >= 20 && ' (affichage limité à 20)'}
                      </p>
                      <div className="space-y-2">
                        {searchResults.map((product) => (
                          <button key={product.id} onClick={() => handleProductClick(product.slug)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left">
                            <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                              {product.stock?.global === 0 && (
                                <span className="text-xs text-red-500">Rupture de stock</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {!isSearching && debouncedQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="mt-4 text-center py-8">
                      <p className="text-muted-foreground">{t.noResults} "{debouncedQuery}"</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Essayez avec un autre terme (nom, référence, viscosité...)
                      </p>
                    </div>
                  )}

                  {/* Search hint */}
                  {searchQuery.length > 0 && searchQuery.length < 2 && (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Tapez au moins 2 caractères pour rechercher
                    </p>
                  )}
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2 pointer-events-auto lg:static lg:translate-x-0">
              <span className="text-accent font-extrabold text-2xl md:text-3xl tracking-tight">AUTO</span>
              <span className="text-primary font-extrabold text-2xl md:text-3xl tracking-tight">PASSION</span>
              <span className="text-secondary-foreground/50 text-xs font-bold ml-1 hidden sm:inline">BJ</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-3 xl:gap-5">
              {navLinks.map(({ label, href, hasSubmenu }) => (
                <div key={href} className="relative"
                  onMouseEnter={() => hasSubmenu && setShowProductsMenu(true)}
                  onMouseLeave={() => hasSubmenu && setShowProductsMenu(false)}
                >
                  <Link to={href}
                    className="text-sm xl:text-base font-semibold uppercase tracking-wide text-secondary-foreground/80 hover:text-accent transition-colors whitespace-nowrap flex items-center gap-1">
                    {label}
                    {hasSubmenu && <ChevronDown className="h-3.5 w-3.5" />}
                  </Link>
                  {hasSubmenu && showProductsMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[280px] z-50 max-h-[70vh] overflow-y-auto">
                      {productCategories.map(cat => (
                        <div key={cat.href + cat.label}>
                          <Link to={cat.href}
                            onClick={() => setShowProductsMenu(false)}
                            className="block px-3 py-2 rounded text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors font-medium">
                            {cat.label}
                          </Link>
                          {cat.subcategories && (
                            <div className="pl-5">
                              {cat.subcategories.map(sub => (
                                <Link key={sub.href} to={sub.href}
                                  onClick={() => setShowProductsMenu(false)}
                                  className="block px-3 py-1.5 rounded text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0 ml-auto">
              {/* Search - desktop only */}
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden lg:flex text-secondary-foreground hover:text-accent">
                    <Search className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto max-h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>{t.search}</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSearchSubmit} className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="search" placeholder={t.searchPlaceholder} value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)} className="pl-10 text-base" autoFocus />
                    </div>
                  </form>

                  {/* Loading state */}
                  {isSearching && debouncedQuery.length >= 2 && (
                    <div className="mt-4 flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Recherche en cours...</span>
                    </div>
                  )}

                  {/* Results */}
                  {!isSearching && searchResults.length > 0 && (
                    <div className="mt-4 max-h-[50vh] overflow-y-auto">
                      <p className="text-sm text-muted-foreground mb-3">
                        {searchResults.length} {t.searchResults}
                        {searchResults.length >= 20 && ' (affichage limité à 20)'}
                      </p>
                      <div className="space-y-2">
                        {searchResults.map((product) => (
                          <button key={product.id} onClick={() => handleProductClick(product.slug)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left">
                            <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                              {product.stock?.global === 0 && (
                                <span className="text-xs text-red-500">Rupture de stock</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {!isSearching && debouncedQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="mt-4 text-center py-8">
                      <p className="text-muted-foreground">{t.noResults} "{debouncedQuery}"</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Essayez avec un autre terme (nom, référence, viscosité...)
                      </p>
                    </div>
                  )}

                  {/* Search hint */}
                  {searchQuery.length > 0 && searchQuery.length < 2 && (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Tapez au moins 2 caractères pour rechercher
                    </p>
                  )}
                </SheetContent>
              </Sheet>

              {/* Cart with label on desktop */}
              <Button variant="ghost" size="icon" className="relative text-secondary-foreground hover:text-accent h-auto w-auto px-2 py-1"
                onClick={() => setIsCartOpen(true)}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="relative">
                    <ShoppingBag className="h-6 w-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold animate-scale-in">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-secondary-foreground/70">Panier</span>
                </div>
              </Button>

              {/* Profile with label on desktop */}
              <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-accent h-auto w-auto px-2 py-1" asChild>
                <Link to="/mon-espace">
                  <div className="flex flex-col items-center gap-0.5">
                    <User className="h-6 w-6" />
                    <span className="text-[10px] font-medium text-secondary-foreground/70">Mon espace</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
