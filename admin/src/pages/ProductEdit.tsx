import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, Upload, X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const productSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  slug: z.string().min(1, 'Slug requis'),
  price: z.number().min(0, 'Prix invalide'),
  compare_at_price: z.number().nullable().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  stock: z.number().min(0).optional(),
  viscosity: z.string().optional(),
  api_norm: z.string().optional(),
  acea_norm: z.string().optional(),
  capacity: z.string().optional(),
  is_active: z.boolean(),
  is_new: z.boolean(),
  is_featured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

const VISCOSITIES = ['0W-20', '0W-30', '5W-30', '5W-40', '10W-40', '10W-60', '15W-40', '20W-50', '75W-80', '75W-90', '80W-90'];
const API_NORMS = ['API SN', 'API SN Plus', 'API SP', 'API CJ-4', 'API CK-4', 'API GL-4', 'API GL-5'];
const ACEA_NORMS = ['ACEA A3/B4', 'ACEA A5/B5', 'ACEA C2', 'ACEA C3', 'ACEA C4', 'ACEA C5', 'ACEA E6', 'ACEA E9'];
const CAPACITIES = ['250ml', '400ml', '500ml', '1L', '2L', '4L', '5L', '10L', '20L', '60L', '200L'];
const PRODUCT_TYPES = [
  { value: 'huile-moteur', label: 'Huile Moteur' },
  { value: 'additif', label: 'Additif' },
  { value: 'graisse', label: 'Graisse' },
  { value: 'entretien', label: 'Produit d\'Entretien' },
  { value: 'liquide-refroidissement', label: 'Liquide de Refroidissement' },
  { value: 'huile-transmission', label: 'Huile de Transmission' },
];

// Sortable Image Component
function SortableImage({ url, index, onRemove }: { url: string; index: number; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 bg-white/90 rounded-md hover:bg-white transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-foreground" />
        </button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {index === 0 && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
          Principal
        </div>
      )}
    </div>
  );
}

// Chunked upload helper
async function uploadFileChunked(
  file: File,
  bucket: string,
  fileName: string,
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const blob = new Blob([uint8Array], { type: file.type });
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// Compress image
async function compressImage(file: File, maxSizeMB = 1, maxDimension = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }
      canvas.width = width;
      canvas.height = height;
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              }));
            } else reject(new Error('Failed to compress image'));
          },
          'image/webp',
          0.85
        );
      } else reject(new Error('Canvas context not available'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === 'new';
  
  const isSavingRef = useRef(false);
  const uploadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [images, setImages] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [productType, setProductType] = useState('huile-moteur');

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('title');
      if (error) throw error;
      return data;
    },
  });

  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase.from('product_collections').select('*').eq('is_active', true).order('title');
      if (error) throw error;
      return data;
    },
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_categories(category_id), product_collection_items(collection_id)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (!product) return;
    if (product.product_images && product.product_images.length > 0) {
      const imageUrls = product.product_images
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => img.image_url);
      setImages(imageUrls);
    }
    if (product.product_categories && product.product_categories.length > 0) {
      setSelectedCategories(product.product_categories.map((pc: any) => pc.category_id));
    }
    if (product.product_collection_items && product.product_collection_items.length > 0) {
      setSelectedCollections(product.product_collection_items.map((pci: any) => pci.collection_id));
    }
  }, [product]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '', slug: '', price: 0, compare_at_price: null,
      short_description: '', description: '', sku: '', stock: 100,
      viscosity: '', api_norm: '', acea_norm: '', capacity: '',
      is_active: true, is_new: false, is_featured: false,
    },
    values: product ? {
      title: product.title,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price,
      short_description: product.short_description || '',
      description: typeof product.description === 'object' && product.description
        ? (product.description as any).text || ''
        : (product.description || ''),
      sku: product.sku || '',
      stock: product.stock || 0,
      viscosity: product.viscosity || '',
      api_norm: product.api_norm || '',
      acea_norm: product.acea_norm || '',
      capacity: product.capacity || '',
      is_active: product.is_active ?? true,
      is_new: product.is_new ?? false,
      is_featured: product.is_featured ?? false,
    } : undefined,
  });

  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    if (uploadingRef.current) { toast.warning('Upload en cours'); return; }
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (fileArray.length === 0) { toast.error('Aucune image valide'); return; }

    uploadingRef.current = true;
    setUploading(true);
    setUploadProgress({ current: 0, total: fileArray.length });
    abortControllerRef.current = new AbortController();
    
    const uploadedUrls: string[] = [];
    let completed = 0;

    try {
      for (const file of fileArray) {
        if (abortControllerRef.current.signal.aborted) throw new Error('Upload annulé');
        try {
          const compressedFile = await compressImage(file, 1, 1920);
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
          const uploadPromise = uploadFileChunked(compressedFile, 'products', fileName);
          const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000));
          const publicUrl = await Promise.race([uploadPromise, timeoutPromise]);
          uploadedUrls.push(publicUrl);
          completed++;
          setUploadProgress({ current: completed, total: fileArray.length });
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
        }
      }
      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploadée(s)`);
      } else toast.error('Aucune image n\'a pu être uploadée');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      abortControllerRef.current = null;
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleImageUpload(e.dataTransfer.files);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const generateSlug = (title: string) => {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const generateSKU = (title: string) => {
    const prefix = title.split(' ').slice(0, 2).map(word => word.substring(0, 3).toUpperCase()).join('-');
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  };

  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (isSavingRef.current) throw new Error('Sauvegarde déjà en cours');
      isSavingRef.current = true;

      try {
        const productData = {
          title: data.title,
          slug: data.slug,
          price: data.price,
          compare_at_price: data.compare_at_price || null,
          short_description: data.short_description || null,
          description: data.description || null,
          sku: data.sku?.trim() || generateSKU(data.title),
          stock: data.stock || 0,
          viscosity: data.viscosity || null,
          api_norm: data.api_norm || null,
          acea_norm: data.acea_norm || null,
          capacity: data.capacity || null,
          style: productType,
          is_active: data.is_active,
          is_new: data.is_new,
          is_featured: data.is_featured,
          available_colors: [],
          available_sizes: null,
          available_cup_sizes: null,
          composition: null,
          care_instructions: null,
        };

        let productId = id;

        if (isNew) {
          const { data: existingSlug } = await supabase.from('products').select('id').eq('slug', data.slug).maybeSingle();
          if (existingSlug) productData.slug = `${data.slug}-${Date.now().toString(36)}`;

          const { data: newProduct, error } = await supabase.from('products').insert(productData).select('id').single();
          if (error) throw error;
          productId = newProduct.id;
        } else {
          const { error } = await supabase.from('products').update(productData).eq('id', id);
          if (error) throw error;
        }

        if (!productId) throw new Error('Product ID not found');

        // Images
        if (!isNew) await supabase.from('product_images').delete().eq('product_id', productId);
        if (images.length > 0) {
          await supabase.from('product_images').insert(
            images.map((url, index) => ({ product_id: productId, image_url: url, display_order: index, alt_text: data.title }))
          );
        }

        // Categories
        if (!isNew) await supabase.from('product_categories').delete().eq('product_id', productId);
        if (selectedCategories.length > 0) {
          await supabase.from('product_categories').insert(
            selectedCategories.map(categoryId => ({ product_id: productId, category_id: categoryId }))
          );
        }

        // Collections
        if (!isNew) await supabase.from('product_collection_items').delete().eq('product_id', productId);
        if (selectedCollections.length > 0) {
          await supabase.from('product_collection_items').insert(
            selectedCollections.map(collectionId => ({ product_id: productId, collection_id: collectionId }))
          );
        }

        return productId;
      } finally { isSavingRef.current = false; }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(isNew ? 'Produit créé avec succès' : 'Produit mis à jour');
      navigate('/products');
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast.error('Erreur lors de la sauvegarde', { description: error.message });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (selectedCategories.length === 0) { toast.error('Veuillez sélectionner au moins une catégorie'); return; }
    if (saveMutation.isPending || isSavingRef.current) { toast.warning('Sauvegarde en cours...'); return; }
    saveMutation.mutate(data);
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isNew ? 'Nouveau produit' : 'Modifier le produit'}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Glissez-déposez pour réorganiser. La première image est l'image principale.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
                className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border-2 border-dashed transition-colors ${
                  isDraggingOver ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={images} strategy={rectSortingStrategy}>
                    {images.map((url, index) => (
                      <SortableImage key={url} url={url} index={index} onRemove={() => removeImage(index)} />
                    ))}
                  </SortableContext>
                </DndContext>

                <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">{uploadProgress.current}/{uploadProgress.total}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center px-2">Cliquez ou glissez</span>
                    </>
                  )}
                  <input type="file" multiple accept="image/*" onChange={handleFileInputChange} className="hidden" disabled={uploading} />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Nom du produit *</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    onChange={(e) => {
                      form.setValue('title', e.target.value);
                      if (isNew) form.setValue('slug', generateSlug(e.target.value));
                    }}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" {...form.register('slug')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type de produit</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Description courte</Label>
                <Textarea id="short_description" rows={2} {...form.register('short_description')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea id="description" rows={5} {...form.register('description')} />
              </div>
            </CardContent>
          </Card>

          {/* Technical Specs */}
          <Card>
            <CardHeader>
              <CardTitle>Spécifications techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Viscosité</Label>
                  <Select value={form.watch('viscosity') || ''} onValueChange={(v) => form.setValue('viscosity', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {VISCOSITIES.map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contenance</Label>
                  <Select value={form.watch('capacity') || ''} onValueChange={(v) => form.setValue('capacity', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CAPACITIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Norme API</Label>
                  <Select value={form.watch('api_norm') || ''} onValueChange={(v) => form.setValue('api_norm', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {API_NORMS.map(n => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Norme ACEA</Label>
                  <Select value={form.watch('acea_norm') || ''} onValueChange={(v) => form.setValue('acea_norm', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {ACEA_NORMS.map(n => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Prix et Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (€) *</Label>
                  <Input id="price" type="number" step="0.01" placeholder="Ex: 29.90" {...form.register('price', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare_at_price">Ancien prix (barré)</Label>
                  <Input
                    id="compare_at_price" type="number" step="0.01" placeholder="Optionnel"
                    {...form.register('compare_at_price', {
                      setValueAs: v => { if (v === '' || v === null || v === undefined) return null; const p = parseFloat(v); return isNaN(p) ? null : p; }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" placeholder="Ex: 50" {...form.register('stock', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Référence</Label>
                <Input id="sku" {...form.register('sku')} placeholder="Auto-généré si vide" />
              </div>
            </CardContent>
          </Card>

          {/* Categories & Collections */}
          <Card>
            <CardHeader>
              <CardTitle>Catégories et Collections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Catégories *</Label>
                <div className="flex flex-wrap gap-2">
                  {categories?.map(category => (
                    <label
                      key={category.id}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                        selectedCategories.includes(category.id)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCategories([...selectedCategories, category.id]);
                          else setSelectedCategories(selectedCategories.filter(cid => cid !== category.id));
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm">{category.title}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-sm text-destructive">Au moins une catégorie requise</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Collections</Label>
                <div className="flex flex-wrap gap-2">
                  {collections?.map(collection => (
                    <label
                      key={collection.id}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                        selectedCollections.includes(collection.id)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(collection.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCollections([...selectedCollections, collection.id]);
                          else setSelectedCollections(selectedCollections.filter(cid => cid !== collection.id));
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm">{collection.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Actif</Label>
                  <p className="text-sm text-muted-foreground">Le produit sera visible sur le site</p>
                </div>
                <Switch checked={form.watch('is_active')} onCheckedChange={(checked) => form.setValue('is_active', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Nouveau</Label>
                  <p className="text-sm text-muted-foreground">Affiché avec le badge "Nouveau"</p>
                </div>
                <Switch checked={form.watch('is_new')} onCheckedChange={(checked) => form.setValue('is_new', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mis en avant</Label>
                  <p className="text-sm text-muted-foreground">Affiché sur la page d'accueil</p>
                </div>
                <Switch checked={form.watch('is_featured')} onCheckedChange={(checked) => form.setValue('is_featured', checked)} />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/products')}>Annuler</Button>
            <Button type="submit" disabled={saveMutation.isPending || uploading}>
              {saveMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{isNew ? 'Créer le produit' : 'Enregistrer'}</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
