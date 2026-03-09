import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Upload, CheckCircle, AlertCircle, FileWarning } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
}

const DB_COLUMNS = [
  { value: 'title', label: 'Titre (requis)', required: true },
  { value: 'price', label: 'Prix (requis)', required: true },
  { value: 'category', label: 'Catégorie' },
  { value: 'description', label: 'Description' },
  { value: 'short_description', label: 'Description courte' },
  { value: 'capacity', label: 'Contenance' },
  { value: 'image_url', label: 'URL Image' },
  { value: 'stock', label: 'Stock' },
  { value: 'sku', label: 'SKU' },
  { value: 'status', label: 'Statut (Actif/Inactif)' },
  { value: 'external_id', label: 'ID Externe' },
  { value: 'ignore', label: '-- Ignorer --' },
];

// Normalize text for flexible matching
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-\s]+/g, ' ')
    .trim();
}

// Smart column auto-detection
function detectColumn(header: string): string {
  const h = normalize(header);

  // Title
  if (['titre', 'title', 'nom', 'name', 'nom du produit', 'product name', 'libelle', 'designation'].some(k => h === k || h.startsWith(k))) return 'title';

  // Price
  if (['prix', 'price', 'prix ttc', 'prix ht', 'tarif', 'prix unitaire', 'montant'].some(k => h === k || h.startsWith(k))) return 'price';

  // Category
  if (h.includes('categorie') || h.includes('category') || h.includes('famille')) return 'category';

  // Description
  if (h === 'description' || h.startsWith('description')) return 'description';

  // Image
  if (h.includes('image') || h.includes('photo') || h.includes('url')) return 'image_url';

  // Stock
  if (h.includes('stock') || h.includes('quantite') || h.includes('qty')) return 'stock';

  // SKU
  if (h.includes('sku') || h.includes('reference') || h.includes('ref') || h.includes('code article')) return 'sku';

  // Status
  if (h.includes('statut') || h.includes('status') || h.includes('etat') || h.includes('actif')) return 'status';

  // Capacity
  if (h.includes('contenance') || h.includes('capacity') || h.includes('volume')) return 'capacity';

  return 'ignore';
}

// Parse numeric values with locale awareness (spaces, commas, etc.)
function parseNumericValue(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') return null;
  // Remove currency symbols, spaces used as thousands separator
  let cleaned = value.replace(/[^\d,.\-]/g, '');
  if (!cleaned) return null;

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');

  if (lastComma > lastDot) {
    // European: 1.234,56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // US/standard: 1,234.56
    cleaned = cleaned.replace(/,/g, '');
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductImportDialog({ open, onOpenChange }: ProductImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] }>({ success: 0, errors: [] });
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Detect delimiter: semicolons vs commas
  const detectDelimiter = (text: string): string => {
    // Take first few lines
    const sampleLines = text.split(/\r?\n/).slice(0, 5).join('\n');
    const semicolons = (sampleLines.match(/;/g) || []).length;
    const commas = (sampleLines.match(/,/g) || []).length;
    return semicolons > commas ? ';' : ',';
  };

  const parseCSV = (text: string): { headers: string[]; rows: CSVRow[]; warnings: string[] } => {
    const warnings: string[] = [];
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const delimiter = detectDelimiter(text);
    if (delimiter === ';') {
      warnings.push(`Délimiteur détecté : point-virgule (;)`);
    }

    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return { headers: [], rows: [], warnings };

    const parseRow = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    };

    // Find the header row (first row with enough non-empty columns)
    let headerLineIndex = 0;
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const cols = parseRow(lines[i]);
      const nonEmpty = cols.filter(c => c.trim() !== '').length;
      if (nonEmpty >= 2) {
        headerLineIndex = i;
        break;
      }
    }

    const headers = parseRow(lines[headerLineIndex]).map(h => h.replace(/^"|"$/g, '').trim());
    const rows: CSVRow[] = [];

    for (let i = headerLineIndex + 1; i < lines.length; i++) {
      const values = parseRow(lines[i]);
      // Skip empty rows
      const nonEmpty = values.filter(v => v.trim() !== '').length;
      if (nonEmpty < 2) continue;

      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = (values[index] || '').replace(/^"|"$/g, '').trim();
      });
      rows.push(row);
    }

    if (rows.length === 0) {
      warnings.push('Aucune ligne de données trouvée après les en-têtes.');
    }

    return { headers, rows, warnings };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, rows, warnings } = parseCSV(text);

      if (headers.length === 0) {
        toast.error('Fichier CSV vide ou format non reconnu');
        return;
      }

      setCsvHeaders(headers);
      setCsvData(rows);
      setParseWarnings(warnings);

      // Smart auto-mapping
      const autoMapping: ColumnMapping[] = headers.map(header => ({
        csvColumn: header,
        dbColumn: detectColumn(header),
      }));

      setColumnMapping(autoMapping);
      setStep('mapping');
    };
    reader.readAsText(uploadedFile);
  };

  const updateMapping = (csvColumn: string, dbColumn: string) => {
    setColumnMapping(prev =>
      prev.map(m => (m.csvColumn === csvColumn ? { ...m, dbColumn } : m))
    );
  };

  const validateMapping = (): boolean => {
    const mappedColumns = columnMapping.filter(m => m.dbColumn !== 'ignore').map(m => m.dbColumn);
    const missingRequired: string[] = [];

    if (!mappedColumns.includes('title')) missingRequired.push('Titre');
    if (!mappedColumns.includes('price')) missingRequired.push('Prix');

    if (missingRequired.length > 0) {
      toast.error(`Colonnes obligatoires non mappées : ${missingRequired.join(', ')}. Vérifiez le mapping ci-dessus.`);
      return false;
    }

    return true;
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const findOrCreateCategory = async (categoryName: string): Promise<string | null> => {
    if (!categoryName) return null;
    const slug = generateSlug(categoryName);

    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) return existing.id;

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({ title: categoryName, slug, is_active: true })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return null;
    }

    return newCategory.id;
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      const results = { success: 0, errors: [] as string[] };

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        try {
          const mappedData: Record<string, string> = {};

          columnMapping.forEach(({ csvColumn, dbColumn }) => {
            if (dbColumn !== 'ignore' && row[csvColumn]) {
              mappedData[dbColumn] = row[csvColumn];
            }
          });

          if (!mappedData.title) {
            results.errors.push(`Ligne ${i + 2}: Titre manquant — ignorée`);
            continue;
          }

          const price = parseNumericValue(mappedData.price);
          if (price === null && mappedData.price) {
            results.errors.push(`Ligne ${i + 2} (${mappedData.title}): Prix invalide "${mappedData.price}" — mis à 0`);
          }

          const slug = generateSlug(mappedData.title);
          const isActive = mappedData.status
            ? normalize(mappedData.status) === 'actif' || normalize(mappedData.status) === 'active' || mappedData.status === '1'
            : true;

          const productData: Record<string, unknown> = {
            title: mappedData.title,
            slug,
            price: price ?? 0,
            stock: parseNumericValue(mappedData.stock) ?? 0,
            capacity: mappedData.capacity || null,
            sku: mappedData.sku || null,
            description: mappedData.description || null,
            short_description: mappedData.short_description || null,
            is_active: isActive,
          };

          // Check for existing product
          let existingProduct = null;
          if (mappedData.external_id) {
            const { data } = await supabase.from('products').select('id').eq('sku', mappedData.external_id).single();
            existingProduct = data;
          }
          if (!existingProduct) {
            const { data } = await supabase.from('products').select('id').eq('slug', slug).single();
            existingProduct = data;
          }

          let productId: string;

          if (existingProduct) {
            const { data, error } = await supabase.from('products').update(productData).eq('id', existingProduct.id).select('id').single();
            if (error) throw error;
            productId = data.id;
          } else {
            const { data, error } = await supabase.from('products').insert(productData).select('id').single();
            if (error) throw error;
            productId = data.id;
          }

          // Category
          if (mappedData.category) {
            const categoryId = await findOrCreateCategory(mappedData.category);
            if (categoryId) {
              await supabase
                .from('product_categories')
                .upsert({ product_id: productId, category_id: categoryId }, { onConflict: 'product_id,category_id' });
            }
          }

          // Image
          if (mappedData.image_url && mappedData.image_url.startsWith('http')) {
            await supabase
              .from('product_images')
              .upsert(
                { product_id: productId, image_url: mappedData.image_url, display_order: 0 },
                { onConflict: 'product_id,image_url' }
              );
          }

          results.success++;
        } catch (error: any) {
          results.errors.push(`Ligne ${i + 2} (${row[columnMapping.find(m => m.dbColumn === 'title')?.csvColumn || ''] || '?'}): ${error.message}`);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      setImportResults(results);
      queryClient.invalidateQueries({ queryKey: ['products'] });

      if (results.errors.length === 0) {
        toast.success(`${results.success} produits importés avec succès`);
        setTimeout(() => {
          onOpenChange(false);
          resetDialog();
        }, 2000);
      } else {
        toast.warning(`${results.success} importés, ${results.errors.length} erreurs`);
      }
    },
    onError: (error: any) => {
      toast.error(`Erreur d'import: ${error.message}`);
    },
  });

  const resetDialog = () => {
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping([]);
    setStep('upload');
    setImportResults({ success: 0, errors: [] });
    setParseWarnings([]);
  };

  const handleImport = () => {
    if (!validateMapping()) return;
    setStep('importing');
    importMutation.mutate();
  };

  const mappedRequiredCount = columnMapping.filter(m => ['title', 'price'].includes(m.dbColumn)).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetDialog(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des produits (CSV)</DialogTitle>
          <DialogDescription>
            Supporte CSV avec virgule ou point-virgule. Colonnes requises : Titre et Prix.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-sm font-medium mb-2">
                  Cliquez pour sélectionner un fichier CSV
                </div>
                <div className="text-xs text-muted-foreground">
                  Formats acceptés : CSV séparé par virgule (,) ou point-virgule (;)
                </div>
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-4">
            {parseWarnings.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                <FileWarning className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  {parseWarnings.map((w, i) => <p key={i}>{w}</p>)}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {csvData.length} lignes détectées, {csvHeaders.length} colonnes
              </div>
              <Badge variant={mappedRequiredCount >= 2 ? 'default' : 'destructive'}>
                {mappedRequiredCount}/2 colonnes requises mappées
              </Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colonne CSV</TableHead>
                    <TableHead>Aperçu (1ère ligne)</TableHead>
                    <TableHead>Champ DB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnMapping.map(({ csvColumn, dbColumn }) => (
                    <TableRow key={csvColumn}>
                      <TableCell className="font-medium text-sm">{csvColumn}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {csvData[0]?.[csvColumn] || '-'}
                      </TableCell>
                      <TableCell>
                        <Select value={dbColumn} onValueChange={(value) => updateMapping(csvColumn, value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DB_COLUMNS.map(col => (
                              <SelectItem key={col.value} value={col.value}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('upload')}>Retour</Button>
              <Button onClick={() => { if (validateMapping()) setStep('preview'); }}>
                Prévisualiser
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Aperçu des {Math.min(5, csvData.length)} premières lignes sur {csvData.length} :
            </div>
            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columnMapping.filter(m => m.dbColumn !== 'ignore').map(m => (
                      <TableHead key={m.dbColumn}>
                        {DB_COLUMNS.find(c => c.value === m.dbColumn)?.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      {columnMapping.filter(m => m.dbColumn !== 'ignore').map(m => (
                        <TableCell key={m.csvColumn} className="text-sm">
                          {row[m.csvColumn] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('mapping')}>Retour</Button>
              <Button onClick={handleImport}>
                Importer {csvData.length} produits
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-4 py-4">
            {importMutation.isPending ? (
              <div className="text-center space-y-2">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground">Import en cours...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{importResults.success} produits importés</span>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">{importResults.errors.length} erreurs :</span>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-3 max-h-[200px] overflow-auto">
                      {importResults.errors.map((err, i) => (
                        <p key={i} className="text-xs text-destructive mb-1">{err}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => { onOpenChange(false); resetDialog(); }}>
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
