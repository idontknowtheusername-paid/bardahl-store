import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Home, ShoppingCart, Phone, Package, Sparkles, Grid3X3, Info, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { searchProducts, formatPrice } from '@/data/products';

const menuLinks = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Catégories', href: '/collections', icon: Package },
  { label: 'Sélections', href: '/selections', icon: Sparkles },
  { label: 'Nouveautés', href: '/nouveautes', icon: Sparkles },
  { label: 'Mon Panier', href: '/panier', icon: ShoppingCart },
];

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProducts>>([]);
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
      // Navigate to collections with search param
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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-serif text-xl md:text-2xl font-medium tracking-wide text-foreground"
          >
            Cannesh <span className="text-rose">Lingerie</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search Button */}
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto max-h-[80vh]">
                <SheetHeader>
                  <SheetTitle className="font-serif">Rechercher un produit</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSearchSubmit} className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher par nom, catégorie, couleur..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </form>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 max-h-[50vh] overflow-y-auto">
                    <p className="text-sm text-muted-foreground mb-3">
                      {searchResults.length} résultat(s) trouvé(s)
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
                    {searchResults.length > 8 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={handleSearchSubmit}
                      >
                        Voir tous les résultats ({searchResults.length})
                      </Button>
                    )}
                  </div>
                )}
                
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="mt-4 text-center text-muted-foreground">
                    Aucun produit trouvé pour "{searchQuery}"
                  </p>
                )}
              </SheetContent>
            </Sheet>
            
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose text-primary-foreground text-xs flex items-center justify-center font-medium animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Hamburger Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="font-serif text-left">
                    Cannesh <span className="text-rose">Lingerie</span>
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="mt-8 flex flex-col gap-2">
                  {menuLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Icon className="h-5 w-5 text-rose" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}

                  <Link
                    to="/livraison-retours"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Package className="h-5 w-5 text-rose" />
                    <span className="font-medium">Livraison & Retours</span>
                  </Link>

                  <Link
                    to="/guide-des-tailles"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Ruler className="h-5 w-5 text-rose" />
                    <span className="font-medium">Guide des Tailles</span>
                  </Link>

                  <Link
                    to="/a-propos"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Info className="h-5 w-5 text-rose" />
                    <span className="font-medium">À Propos</span>
                  </Link>
                </nav>

                {/* WhatsApp CTA */}
                <div className="mt-8 px-3">
                  <a
                    href="https://wa.me/22901970000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contactez-nous
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
