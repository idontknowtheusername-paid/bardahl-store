import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { categories as staticCategories, getProductsByCategory } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { SortOption, Product } from '@/types/product';
import { useProducts, useCategory } from '@/hooks/use-api';
import { getImageUrl } from '@/lib/api-payload';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = [
  { name: 'Noir', hex: '#1a1a1a' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Rose', hex: '#D4A5A5' },
  { name: 'Nude', hex: '#E8C4A4' },
  { name: 'Rouge', hex: '#8B0000' },
  { name: 'Ivoire', hex: '#FFFFF0' },
];
const cupSizes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const styles = ['Classique', 'Dentelle', 'Sport', 'Sexy'];

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCupSizes, setSelectedCupSizes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  // API data with fallback
  const { data: apiCategory } = useCategory(slug || '');
  const { data: apiProducts, isLoading } = useProducts({ category: slug, pageSize: 50 });

  // Use API data if available, fallback to static
  const collection = useMemo(() => {
    if (apiCategory) {
      return {
        id: apiCategory.id,
        slug: apiCategory.slug,
        name: apiCategory.title,
        description: apiCategory.description || '',
        image: getImageUrl(apiCategory.image),
        productCount: 0,
      };
    }
    return staticCategories.find(c => c.slug === slug);
  }, [apiCategory, slug]);

  const products = useMemo(() => {
    if (apiProducts?.docs && apiProducts.docs.length > 0) {
      return apiProducts.docs; // Already transformed by the hook
    }
    return getProductsByCategory(slug || '');
  }, [apiProducts, slug]);

  const isBraCollection = slug === 'soutiens-gorge';

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by size
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p =>
        p.sizes.some(s => selectedSizes.includes(s.size) && s.available)
      );
    }

    // Filter by color
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors.some(c => selectedColors.includes(c.name))
      );
    }

    // Filter by cup size (bras only)
    if (selectedCupSizes.length > 0 && isBraCollection) {
      filtered = filtered.filter(p =>
        p.cupSizes?.some(c => selectedCupSizes.includes(c))
      );
    }

    // Filter by style
    if (selectedStyles.length > 0) {
      filtered = filtered.filter(p => selectedStyles.includes(p.style));
    }

    // Filter by price
    filtered = filtered.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return filtered;
  }, [products, selectedSizes, selectedColors, selectedCupSizes, selectedStyles, priceRange, sortBy, isBraCollection]);

  const activeFiltersCount = [
    selectedSizes.length > 0,
    selectedColors.length > 0,
    selectedCupSizes.length > 0,
    selectedStyles.length > 0,
    priceRange[0] > 0 || priceRange[1] < 50000,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCupSizes([]);
    setSelectedStyles([]);
    setPriceRange([0, 50000]);
  };

  if (!collection) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-medium mb-4">Collection non trouvée</h1>
        <Button asChild>
          <Link to="/collections">Voir toutes les collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/collections" className="hover:text-foreground transition-colors">
            Collections
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{collection.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-2">
            {collection.name}
          </h1>
          <p className="text-muted-foreground">{collection.description}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filtres</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-rose hover:underline"
                  >
                    Effacer ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Size Filter */}
              <div>
                <h4 className="text-sm font-medium mb-3">Taille</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSizes(prev =>
                          prev.includes(size)
                            ? prev.filter(s => s !== size)
                            : [...prev, size]
                        )
                      }
                      className={cn(
                        "px-3 py-1.5 text-sm border rounded-md transition-colors",
                        selectedSizes.includes(size)
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cup Size Filter (Bras only) */}
              {isBraCollection && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Bonnet</h4>
                  <div className="flex flex-wrap gap-2">
                    {cupSizes.map(cup => (
                      <button
                        key={cup}
                        onClick={() =>
                          setSelectedCupSizes(prev =>
                            prev.includes(cup)
                              ? prev.filter(c => c !== cup)
                              : [...prev, cup]
                          )
                        }
                        className={cn(
                          "w-9 h-9 text-sm border rounded-md transition-colors",
                          selectedCupSizes.includes(cup)
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-foreground"
                        )}
                      >
                        {cup}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              <div>
                <h4 className="text-sm font-medium mb-3">Couleur</h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() =>
                        setSelectedColors(prev =>
                          prev.includes(color.name)
                            ? prev.filter(c => c !== color.name)
                            : [...prev, color.name]
                        )
                      }
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        selectedColors.includes(color.name)
                          ? "border-foreground scale-110"
                          : "border-border hover:scale-105"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Prix: {priceRange[0].toLocaleString('fr-FR')} - {priceRange[1].toLocaleString('fr-FR')} FCFA
                </h4>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={50000}
                  step={1000}
                  className="mt-2"
                />
              </div>

              {/* Style Filter */}
              <div>
                <h4 className="text-sm font-medium mb-3">Style</h4>
                <div className="space-y-2">
                  {styles.map(style => (
                    <label
                      key={style}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedStyles.includes(style)}
                        onCheckedChange={(checked) =>
                          setSelectedStyles(prev =>
                            checked
                              ? [...prev, style]
                              : prev.filter(s => s !== style)
                          )
                        }
                      />
                      <span className="text-sm">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} article{filteredProducts.length !== 1 && 's'}
              </p>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-rose text-primary-foreground rounded-full text-xs">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Nouveautés</SelectItem>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    <SelectItem value="popularity">Popularité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted-foreground mb-4">
                  Aucun produit ne correspond à vos critères.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 bg-foreground/50 z-50 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-background z-50 lg:hidden overflow-y-auto animate-slide-down">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium">Filtres</h3>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Same filter content as desktop */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Taille</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedSizes(prev =>
                            prev.includes(size)
                              ? prev.filter(s => s !== size)
                              : [...prev, size]
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 text-sm border rounded-md transition-colors",
                          selectedSizes.includes(size)
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-foreground"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {isBraCollection && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Bonnet</h4>
                    <div className="flex flex-wrap gap-2">
                      {cupSizes.map(cup => (
                        <button
                          key={cup}
                          onClick={() =>
                            setSelectedCupSizes(prev =>
                              prev.includes(cup)
                                ? prev.filter(c => c !== cup)
                                : [...prev, cup]
                            )
                          }
                          className={cn(
                            "w-9 h-9 text-sm border rounded-md transition-colors",
                            selectedCupSizes.includes(cup)
                              ? "bg-foreground text-background border-foreground"
                              : "border-border hover:border-foreground"
                          )}
                        >
                          {cup}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-3">Couleur</h4>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() =>
                          setSelectedColors(prev =>
                            prev.includes(color.name)
                              ? prev.filter(c => c !== color.name)
                              : [...prev, color.name]
                          )
                        }
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          selectedColors.includes(color.name)
                            ? "border-foreground scale-110"
                            : "border-border hover:scale-105"
                        )}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Prix: {priceRange[0].toLocaleString('fr-FR')} - {priceRange[1].toLocaleString('fr-FR')} FCFA
                  </h4>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    min={0}
                    max={50000}
                    step={1000}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Style</h4>
                  <div className="space-y-2">
                    {styles.map(style => (
                      <label
                        key={style}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedStyles.includes(style)}
                          onCheckedChange={(checked) =>
                            setSelectedStyles(prev =>
                              checked
                                ? [...prev, style]
                                : prev.filter(s => s !== style)
                            )
                          }
                        />
                        <span className="text-sm">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Effacer
                  </Button>
                  <Button variant="rose" className="flex-1" onClick={() => setIsFilterOpen(false)}>
                    Voir {filteredProducts.length} résultat{filteredProducts.length !== 1 && 's'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
