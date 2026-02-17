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
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
}

const DB_COLUMNS = [
  { value: 'title', label: 'Titre (requis)' },
  { value: 'price', label: 'Prix (requis)' },
  { value: 'category', label: 'Catégorie' },
  { value: 'subcategory', label: 'Sous-catégorie' },
  { value: 'capacity', label: 'Contenance' },
  { value: 'image_url', label: 'URL Image' },
  { value: 'stock', label: 'Stock' },
  { value: 'sku', label: 'SKU' },
  { value: 'description', label: 'Description' },
  { value: 'external_id', label: 'ID Externe' },
  { value: 'ignore', label: '-- Ignorer --' },
];

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
  const queryClient = useQueryClient();

  const parseCSV = (text: string): { headers: string[]; rows: CSVRow[] } => {
    // Normaliser les sauts de ligne
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const lines: string[] = [];
    let currentLine = '';
    let inQuotes = false;
    
    // Parser ligne par ligne en gérant les guillemets
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentLine += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === '\n' && !inQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    // Ajouter la dernière ligne
    if (currentLine.trim()) {
      lines.push(currentLine);
    }
    
    if (lines.length === 0) return { headers: [], rows: [] };
    
    // Parser les colonnes avec gestion des guillemets
    const parseRow = (line: string): string[] => {
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            currentValue += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue.trim());
      return values;
    };
    
    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = parseRow(line);
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, rows };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, rows } = parseCSV(text);
      
      setCsvHeaders(headers);
      setCsvData(rows);

      // Auto-mapping intelligent
      const autoMapping: ColumnMapping[] = headers.map(header => {
        const lowerHeader = header.toLowerCase();
        let dbColumn = 'ignore';

        if (lowerHeader.includes('nom') || lowerHeader.includes('title')) dbColumn = 'title';
        else if (lowerHeader.includes('prix') || lowerHeader.includes('price')) dbColumn = 'price';
        else if (lowerHeader.includes('categorie') && !lowerHeader.includes('sous')) dbColumn = 'category';
        else if (lowerHeader.includes('sous') && lowerHeader.includes('categorie')) dbColumn = 'subcategory';
        else if (lowerHeader.includes('contenance') || lowerHeader.includes('capacity')) dbColumn = 'capacity';
        else if (lowerHeader.includes('image')) dbColumn = 'image_url';
        else if (lowerHeader.includes('stock')) dbColumn = 'stock';
        else if (lowerHeader.includes('sku')) dbColumn = 'sku';
        else if (lowerHeader.includes('description')) dbColumn = 'description';
        else if (lowerHeader.includes('id') && !lowerHeader.includes('image')) dbColumn = 'external_id';

        return { csvColumn: header, dbColumn };
      });

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
    const hasTitle = mappedColumns.includes('title');
    const hasPrice = mappedColumns.includes('price');

    if (!hasTitle || !hasPrice) {
      toast.error('Les colonnes "Titre" et "Prix" sont obligatoires');
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
    
    // Chercher la catégorie existante
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) return existing.id;

    // Créer la catégorie
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
          const mappedData: any = {};
          
          columnMapping.forEach(({ csvColumn, dbColumn }) => {
            if (dbColumn !== 'ignore' && row[csvColumn]) {
              mappedData[dbColumn] = row[csvColumn];
            }
          });

          if (!mappedData.title || !mappedData.price) {
            results.errors.push(`Ligne ${i + 2}: Titre ou prix manquant`);
            continue;
          }

          // Générer le slug
          const slug = generateSlug(mappedData.title);

          // Préparer les données du produit
          const productData: any = {
            title: mappedData.title,
            slug,
            price: parseFloat(mappedData.price) || 0,
            stock: parseInt(mappedData.stock) || 0,
            capacity: mappedData.capacity || null,
            sku: mappedData.sku || null,
            description: mappedData.description || null,
            is_active: true,
          };

          // Vérifier si le produit existe déjà (par slug ou external_id)
          let existingProduct = null;
          if (mappedData.external_id) {
            const { data } = await supabase
              .from('products')
              .select('id')
              .eq('sku', mappedData.external_id)
              .single();
            existingProduct = data;
          }

          if (!existingProduct) {
            const { data } = await supabase
              .from('products')
              .select('id')
              .eq('slug', slug)
              .single();
            existingProduct = data;
          }

          let productId: string;

          if (existingProduct) {
            // Mise à jour
            const { data, error } = await supabase
              .from('products')
              .update(productData)
              .eq('id', existingProduct.id)
              .select('id')
              .single();

            if (error) throw error;
            productId = data.id;
          } else {
            // Création
            const { data, error } = await supabase
              .from('products')
              .insert(productData)
              .select('id')
              .single();

            if (error) throw error;
            productId = data.id;
          }

          // Gérer la catégorie
          if (mappedData.category) {
            const categoryId = await findOrCreateCategory(mappedData.category);
            if (categoryId) {
              await supabase
                .from('product_categories')
                .upsert({ product_id: productId, category_id: categoryId }, { onConflict: 'product_id,category_id' });
            }
          }

          // Gérer l'image
          if (mappedData.image_url) {
            await supabase
              .from('product_images')
              .upsert(
                { product_id: productId, image_url: mappedData.image_url, display_order: 0 },
                { onConflict: 'product_id,image_url' }
              );
          }

          results.success++;
        } catch (error: any) {
          results.errors.push(`Ligne ${i + 2}: ${error.message}`);
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
        toast.warning(`${results.success} produits importés, ${results.errors.length} erreurs`);
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
  };

  const handleImport = () => {
    if (!validateMapping()) return;
    setStep('importing');
    importMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des produits (CSV)</DialogTitle>
          <DialogDescription>
            Importez vos produits depuis un fichier CSV avec mapping flexible des colonnes
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
                  Format attendu: CSV avec en-têtes (id, nom, categorie, sous_categorie, contenance, image_url, prix_ttc, stock)
                </div>
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
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
            <div className="text-sm text-muted-foreground">
              {csvData.length} lignes détectées. Mappez les colonnes CSV vers les champs de la base de données :
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colonne CSV</TableHead>
                    <TableHead>Exemple</TableHead>
                    <TableHead>Champ DB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnMapping.map(({ csvColumn, dbColumn }) => (
                    <TableRow key={csvColumn}>
                      <TableCell className="font-medium">{csvColumn}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {csvData[0]?.[csvColumn] || '-'}
                      </TableCell>
                      <TableCell>
                        <Select value={dbColumn} onValueChange={(value) => updateMapping(csvColumn, value)}>
                          <SelectTrigger>
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
              <Button variant="outline" onClick={() => setStep('upload')}>
                Retour
              </Button>
              <Button onClick={() => {
                if (validateMapping()) setStep('preview');
              }}>
                Prévisualiser
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Prévisualisation des {Math.min(5, csvData.length)} premières lignes :
            </div>
            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columnMapping
                      .filter(m => m.dbColumn !== 'ignore')
                      .map(m => (
                        <TableHead key={m.dbColumn}>
                          {DB_COLUMNS.find(c => c.value === m.dbColumn)?.label}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      {columnMapping
                        .filter(m => m.dbColumn !== 'ignore')
                        .map(m => (
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
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Retour
              </Button>
              <Button onClick={handleImport}>
                Importer {csvData.length} produits
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-4">
            {importMutation.isPending ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Import en cours...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{importResults.success} produits importés</span>
                </div>
                {importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">{importResults.errors.length} erreurs</span>
                    </div>
                    <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto bg-muted">
                      {importResults.errors.map((error, i) => (
                        <div key={i} className="text-sm text-muted-foreground mb-1">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={() => {
                    onOpenChange(false);
                    resetDialog();
                  }}>
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
