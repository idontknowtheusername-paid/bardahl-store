import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Truck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { searchProducts } from '@/data/products';
import type { Product } from '@/types/product';

const navLinks = [
  { label: 'Huiles Moteur', href: '/collections/huiles-moteur' },
  { label: 'Additifs', href: '/collections/additifs' },
  { label: 'Entretien', href: '/collections/entretien' },
  { label: 'Tous les produits', href: '/collections' },
  { label: 'Conseils', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      const results = searchProducts(query);
      setSearchResults(results);
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
            <span>Livraison gratuite dès 59€ d'achat</span>
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
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2"
            >
              <span className="text-primary font-extrabold text-2xl md:text-3xl tracking-tight">
                BARDAHL
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  className="text-sm font-semibold uppercase tracking-wide text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary">
                    <Search className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto max-h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Rechercher un produit</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSearchSubmit} className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Rechercher par nom, référence..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                        autoFocus
                      />
                    </div>
                  </form>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4 max-h-[50vh] overflow-y-auto">
                      <p className="text-sm text-muted-foreground mb-3">
                        {searchResults.length} résultat(s)
                      </p>
                      <div className="space-y-2">
                        {searchResults.slice(0, 8).map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.slug)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
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
                    <p className="mt-4 text-center text-muted-foreground">
                      Aucun produit trouvé pour "{searchQuery}"
                    </p>
                  )}
                </SheetContent>
              </Sheet>
              
              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-secondary-foreground hover:text-primary"
                onClick={() => setIsCartOpen(true)}
              >
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
