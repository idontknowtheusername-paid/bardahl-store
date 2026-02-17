import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateShort } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Copy, Upload } from 'lucide-react';
import { ProductImportDialog } from '@/components/ProductImportDialog';

export default function Products() {
  const [search, setSearch] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images (id, image_url, display_order)
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t.products.productDeleted);
    },
    onError: () => {
      toast.error(t.common.deleteError);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (product: any) => {
      const newProduct = {
        ...product,
        id: undefined,
        slug: `${product.slug}-copy-${Date.now()}`,
        title: `${product.title} (copie)`,
        created_at: undefined,
        updated_at: undefined,
      };
      delete newProduct.product_images;
      delete newProduct.product_variants;

      const { data, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t.common.createSuccess);
    },
    onError: () => {
      toast.error(t.common.createError);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.products.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
          <Button asChild>
            <Link to="/products/new">
              <Plus className="h-4 w-4 mr-2" />
              {t.products.newProduct}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.common.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {products && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {products.length} {products.length === 1 ? 'produit' : 'produits'}
          </div>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t.common.image}</TableHead>
              <TableHead>{t.products.productName}</TableHead>
              <TableHead>{t.common.price}</TableHead>
              <TableHead>{t.products.stock}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.common.date}</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t.common.loading}
                </TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t.products.noProducts}
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => {
                const mainImage = product.product_images?.sort(
                  (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
                )[0];

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {mainImage ? (
                        <img
                          src={mainImage.image_url}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">N/A</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-muted-foreground">{product.sku || 'Sans SKU'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.compare_at_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.compare_at_price)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={(product.stock || 0) <= 5 ? 'text-red-500' : ''}>
                        {product.stock || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.is_active ? (
                          <Badge variant="default">{t.common.active}</Badge>
                        ) : (
                          <Badge variant="secondary">{t.common.inactive}</Badge>
                        )}
                        {product.is_new && <Badge variant="outline">{t.products.isNew}</Badge>}
                        {product.is_featured && <Badge variant="outline">{t.products.isFeatured}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateShort(product.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/products/${product.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t.common.edit}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateMutation.mutate(product)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t.common.copy || 'Duplicate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
                              window.open(`${frontendUrl}/produits/${product.slug}`, '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t.common.view || 'View'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm(t.products.confirmDeleteProduct)) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ProductImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>
  );
}
