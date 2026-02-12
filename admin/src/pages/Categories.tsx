import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateShort } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

// Helper to get full image URL
const getImageUrl = (url: string | null): string => {
  if (!url) return '';
  // If already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If relative path, convert to frontend URL
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'https://cannesh-lingerie-suite.vercel.app';
  return `${frontendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function Categories() {
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (category: any) => {
      if (category.id) {
        const { error } = await supabase
          .from('categories')
          .update({
            title: category.title,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            display_order: category.display_order,
            is_active: category.is_active,
          })
          .eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert({
          title: category.title,
          slug: category.slug,
          description: category.description,
          image_url: category.image_url,
          display_order: category.display_order || 0,
          is_active: category.is_active ?? true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editingCategory?.id ? t.categories.categoryUpdated : t.categories.categoryCreated);
      setIsDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error: any) => {
      toast.error(t.common.error, { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t.categories.categoryDeleted);
    },
    onError: () => {
      toast.error(t.common.deleteError);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingCategory?.id,
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      image_url: formData.get('image_url') as string,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_active: formData.get('is_active') === 'on',
    };
    saveMutation.mutate(data);
  };

  const openNewDialog = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.categories.title}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t.categories.addCategory}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? t.categories.editCategory : t.categories.addCategory}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="category-form-description">
              <p id="category-form-description" className="sr-only">
                {editingCategory ? 'Modifier les informations de la catégorie' : 'Créer une nouvelle catégorie'}
              </p>
              <div className="space-y-2">
                <Label htmlFor="title">{t.categories.categoryName}</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingCategory?.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t.categories.slug}</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={editingCategory?.slug}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.common.description}</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCategory?.description}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">{t.common.image}</Label>
                <div className="space-y-2">
                  {editingCategory?.image_url && (
                    <img
                      src={getImageUrl(editingCategory.image_url)}
                      alt=""
                      className="w-32 h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=200&q=80';
                      }}
                    />
                  )}
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                      const { error } = await supabase.storage
                        .from('products')
                        .upload(fileName, file);

                      if (error) {
                        toast.error(t.media.uploadError);
                        return;
                      }

                      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
                      const input = document.getElementById('image_url') as HTMLInputElement;
                      if (input) input.value = data.publicUrl;
                      toast.success(t.media.uploadSuccess);
                    }}
                  />
                  <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={editingCategory?.image_url}
                    placeholder="URL complète (https://...)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">{t.categories.displayOrder}</Label>
                <Input
                  id="display_order"
                  name="display_order"
                  type="number"
                  defaultValue={editingCategory?.display_order || 0}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingCategory?.is_active ?? true}
                  className="rounded"
                />
                <Label htmlFor="is_active">{t.common.active}</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCategory ? t.common.update : t.common.create}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t.common.image}</TableHead>
              <TableHead>{t.categories.categoryName}</TableHead>
              <TableHead>{t.categories.slug}</TableHead>
              <TableHead>{t.categories.displayOrder}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.common.date}</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t.common.loading}
                </TableCell>
              </TableRow>
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t.categories.noCategories}
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image_url ? (
                      <img
                        src={getImageUrl(category.image_url)}
                        alt={category.title}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          // Fallback to placeholder on error
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=200&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.title}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                      {category.is_active ? t.common.active : t.common.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateShort(category.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(t.categories.confirmDeleteCategory)) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
