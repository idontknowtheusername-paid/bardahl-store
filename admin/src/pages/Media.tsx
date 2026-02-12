import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, SUPABASE_PROJECT_URL } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, Search, Trash2, Copy, Image as ImageIcon, X, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

type MediaFile = {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
};

export default function Media() {
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('products')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      return data as MediaFile[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from('products')
        .remove([fileName]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast.success('Image supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('products')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast.success(`${files.length} image(s) uploadée(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      toast.error('Aucune image valide');
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('products')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast.success(`${files.length} image(s) uploadée(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const copyUrl = (fileName: string) => {
    const url = getPublicUrl(fileName);
    navigator.clipboard.writeText(url);
    toast.success('URL copiée');
  };

  const handleDelete = (fileName: string) => {
    if (confirm('Supprimer cette image ?')) {
      deleteMutation.mutate(fileName);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Supprimer ${selectedFiles.size} image(s) ?`)) return;

    try {
      const { error } = await supabase.storage
        .from('products')
        .remove(Array.from(selectedFiles));

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast.success(`${selectedFiles.size} image(s) supprimée(s)`);
      setSelectedFiles(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleFileSelection = (fileName: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileName)) {
      newSelection.delete(fileName);
    } else {
      newSelection.add(fileName);
    }
    setSelectedFiles(newSelection);
  };

  const selectAll = () => {
    if (filteredFiles) {
      setSelectedFiles(new Set(filteredFiles.map(f => f.name)));
    }
  };

  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  const filteredFiles = files?.filter(file =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Médiathèque</h1>
        <div className="flex items-center gap-2">
          {isSelectionMode && (
            <>
              <Badge variant="secondary">
                {selectedFiles.size} sélectionné(s)
              </Badge>
              {selectedFiles.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={selectedFiles.size === filteredFiles?.length ? deselectAll : selectAll}
              >
                {selectedFiles.size === filteredFiles?.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedFiles(new Set());
                }}
              >
                Annuler
              </Button>
            </>
          )}
          {!isSelectionMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(true)}
                disabled={!filteredFiles?.length}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Sélectionner
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button disabled={uploading} asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Upload...' : 'Upload'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </Button>
            </>
          )}
        </div>
      </div>

      <Card
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={isDragging ? 'border-primary border-2 bg-primary/5' : ''}
      >
        <CardContent className="pt-6">
          {isDragging && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto text-primary mb-2" />
                <p className="text-lg font-medium">Déposez vos images ici</p>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : !filteredFiles?.length ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {search ? 'Aucune image trouvée' : 'Aucune image'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Uploadez vos premières images
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredFiles.map((file) => {
                      const isSelected = selectedFiles.has(file.name);
                      return (
                        <div
                          key={file.id}
                          className={`group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all ${isSelected ? 'ring-2 ring-primary' : ''
                            }`}
                          onClick={() => {
                            if (isSelectionMode) {
                              toggleFileSelection(file.name);
                            } else {
                              setSelectedImage(file.name);
                            }
                          }}
                        >
                          {isSelectionMode && (
                            <div className="absolute top-2 left-2 z-10">
                              {isSelected ? (
                                <CheckSquare className="h-6 w-6 text-primary bg-white rounded" />
                              ) : (
                                <Square className="h-6 w-6 text-white bg-black/50 rounded" />
                              )}
                            </div>
                          )}
                          <img
                            src={getPublicUrl(file.name)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          {!isSelectionMode && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyUrl(file.name);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(file.name);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-xs text-white truncate">{file.name}</p>
                            <p className="text-xs text-white/70">
                              {formatFileSize(file.metadata.size)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                {filteredFiles.length} image(s)
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{selectedImage}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={getPublicUrl(selectedImage)}
                alt={selectedImage}
                className="w-full rounded-lg"
              />
              <div className="flex items-center gap-2">
                <Input
                  value={getPublicUrl(selectedImage)}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={() => copyUrl(selectedImage)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
