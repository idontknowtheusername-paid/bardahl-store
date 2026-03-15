import { useState } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface FilterResult {
  reference: string;
  brand: string;
  filter_type: string;
  equivalent_references: string[];
}

export function FilterEquivalenceModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FilterResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data, error } = await supabase
      .from('filter_equivalences')
      .select('reference, brand, filter_type, equivalent_references')
      .or(`reference.ilike.%${query.trim()}%,brand.ilike.%${query.trim()}%`)
      .limit(10);

    if (!error && data) {
      setResults(data.map(d => ({
        ...d,
        equivalent_references: (d.equivalent_references as any) || [],
      })));
    } else {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5">
          <Filter className="h-4 w-4" />
          Trouver un filtre équivalent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Trouver un filtre équivalent
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Référence filtre (ex: W712/95)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rechercher'}
            </Button>
          </div>
        </form>

        <div className="mt-4 max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun résultat pour "{query}". Essayez une autre référence.
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-sm">{result.reference}</span>
                      <span className="text-xs text-muted-foreground ml-2">{result.brand}</span>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {result.filter_type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Équivalences compatibles :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.equivalent_references.map((ref, j) => (
                      <span key={j} className="text-xs bg-muted px-2 py-1 rounded font-medium">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
