import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateShort } from '@/lib/utils';
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

export default function Collections() {
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_collections')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (collection: any) => {
      if (collection.id) {
        const { error } = await supabase
          .from('product_collections')
          .update({
            title: collection.title,
            slug: collection.slug,
            description: collection.description,
            image_url: collection.image_url,
            is_active: collection.is_active,
            is_featured: collection.is_featured,
          })
          .eq('id', collection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('product_collections').insert({
          title: collection.title,
          slug: collection.slug,
          description: collection.description,
          image_url: collection.image_url,
          is_active: collection.is_active ?? true,
          is_featured: collection.is_featured ?? false,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(editingCollection?.id ? 'Collection mise à jour' : 'Collection créée');
      setIsDialogOpen(false);
      setEditingCollection(null);
    },
    onError: (error: any) => {
      toast.error('Erreur', { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_collections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection supprimée');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingCollection?.id,
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      image_url: formData.get('image_url') as string,
      is_active: formData.get('is_active') === 'on',
      is_featured: formData.get('is_featured') === 'on',
    };
    saveMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCollection(null); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCollection ? 'Modifier la collection' : 'Nouvelle collection'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" defaultValue={editingCollection?.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={editingCollection?.slug} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingCollection?.description} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image</Label>
                <div className="space-y-2">
                  {editingCollection?.image_url && (
                    <img src={editingCollection.image_url} alt="" className="w-32 h-32 object-cover rounded" />
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
                        toast.error('Erreur upload');
                        return;
                      }

                      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
                      const input = document.getElementById('image_url') as HTMLInputElement;
                      if (input) input.value = data.publicUrl;
                      toast.success('Image uploadée');
                    }}
                  />
                  <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={editingCollection?.image_url}
                    placeholder="ou URL directe"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" name="is_active" defaultChecked={editingCollection?.is_active ?? true} />
                  <Label htmlFor="is_active">Actif</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_featured" name="is_featured" defaultChecked={editingCollection?.is_featured} />
                  <Label htmlFor="is_featured">En vedette</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCollection ? 'Mettre à jour' : 'Créer'}
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
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell></TableRow>
            ) : collections?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune collection</TableCell></TableRow>
            ) : (
              collections?.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>
                    {collection.image_url ? (
                      <img src={collection.image_url} alt={collection.title} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{collection.title}</TableCell>
                  <TableCell className="text-muted-foreground">{collection.slug}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={collection.is_active ? 'default' : 'secondary'}>{collection.is_active ? 'Actif' : 'Inactif'}</Badge>
                      {collection.is_featured && <Badge variant="outline">Vedette</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDateShort(collection.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCollection(collection); setIsDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Supprimer ?')) deleteMutation.mutate(collection.id); }}>
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
