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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, Upload, X, GripVertical, Eye, Sparkles } from 'lucide-react';
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
  composition: z.string().optional(),
  care_instructions: z.string().optional(),
  style: z.string().optional(),
  is_active: z.boolean(),
  is_new: z.boolean(),
  is_featured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

const COLORS = [
  { name: 'Noir', code: '#000000' },
  { name: 'Blanc', code: '#FFFFFF' },
  { name: 'Rouge', code: '#DC2626' },
  { name: 'Rose', code: '#EC4899' },
  { name: 'Bleu', code: '#3B82F6' },
  { name: 'Vert', code: '#10B981' },
  { name: 'Beige', code: '#D4A574' },
  { name: 'Gris', code: '#6B7280' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CUP_SIZES = ['A', 'B', 'C', 'D', 'E', 'F'];

const COMPOSITIONS = [
  '95% Coton, 5% Élasthanne',
  '85% Polyamide, 15% Élasthanne',
  '90% Polyester, 10% Élasthanne',
  '80% Nylon, 20% Spandex',
];

const CARE_INSTRUCTIONS = [
  'Lavage à la main uniquement à 30°C',
  'Lavage machine délicat à 30°C',
  'Lavage machine à 40°C, pas de sèche-linge',
  'Lavage à froid, séchage à plat',
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
      className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 bg-white/90 rounded-md hover:bg-white transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
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
        <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-1 rounded">
          Principal
        </div>
      )}
    </div>
  );
}

// Chunked upload helper to avoid stack overflow
async function uploadFileChunked(
  file: File,
  bucket: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to Blob for upload (more efficient than base64)
  const blob = new Blob([uint8Array], { type: file.type });
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// Compress image client-side
async function compressImage(file: File, maxSizeMB = 1, maxDimension = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      let { width, height } = img;
      
      // Scale down if needed
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
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/webp',
          0.85
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
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
  
  // Use refs to prevent race conditions
  const isSavingRef = useRef(false);
  const uploadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [images, setImages] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCupSizes, setSelectedCupSizes] = useState<string[]>([]);
  const [selectedComposition, setSelectedComposition] = useState<string>('');
  const [selectedCareInstructions, setSelectedCareInstructions] = useState<string>('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      return data;
    },
  });

  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_collections')
        .select('*')
        .eq('is_active', true)
        .order('title');
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

    if (product.available_colors) {
      try {
        const colors = typeof product.available_colors === 'string'
          ? JSON.parse(product.available_colors)
          : product.available_colors;
        if (Array.isArray(colors)) {
          setSelectedColors(colors.map((c: any) => c.name));
        }
      } catch (e) {
        console.error('Error parsing available_colors:', e);
      }
    }

    if (product.available_sizes && Array.isArray(product.available_sizes)) {
      setSelectedSizes(product.available_sizes);
    }

    if (product.available_cup_sizes && Array.isArray(product.available_cup_sizes)) {
      setSelectedCupSizes(product.available_cup_sizes);
    }

    if (product.product_categories && product.product_categories.length > 0) {
      const categoryIds = product.product_categories.map((pc: any) => pc.category_id);
      setSelectedCategories(categoryIds);
    }

    if (product.product_collection_items && product.product_collection_items.length > 0) {
      const collectionIds = product.product_collection_items.map((pci: any) => pci.collection_id);
      setSelectedCollections(collectionIds);
    }

    if (product.composition) {
      setSelectedComposition(product.composition);
    }

    if (product.care_instructions) {
      setSelectedCareInstructions(product.care_instructions);
    }
  }, [product]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      slug: '',
      price: 0,
      compare_at_price: null,
      short_description: '',
      description: '',
      sku: '',
      stock: 100,
      composition: '',
      care_instructions: '',
      style: 'classique',
      is_active: true,
      is_new: false,
      is_featured: false,
    },
    values: product ? {
      title: product.title,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price,
      short_description: product.short_description || '',
      description: typeof product.description === 'object' && product.description 
        ? (product.description as any).text || '' 
        : '',
      sku: product.sku || '',
      stock: product.stock || 0,
      composition: product.composition || '',
      care_instructions: product.care_instructions || '',
      style: product.style || 'classique',
      is_active: product.is_active ?? true,
      is_new: product.is_new ?? false,
      is_featured: product.is_featured ?? false,
    } : undefined,
  });

  // Optimized image upload with timeout and abort support
  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    if (uploadingRef.current) {
      toast.warning('Upload en cours, veuillez patienter');
      return;
    }

    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast.error('Aucune image valide détectée');
      return;
    }

    uploadingRef.current = true;
    setUploading(true);
    setUploadProgress({ current: 0, total: fileArray.length });

    // Create abort controller for timeout
    abortControllerRef.current = new AbortController();
    
    const uploadedUrls: string[] = [];
    let completed = 0;

    try {
      // Upload sequentially to avoid overwhelming the server
      for (const file of fileArray) {
        // Check for abort
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('Upload annulé');
        }

        try {
          // Compress image first
          console.log(`Compressing ${file.name}...`);
          const compressedFile = await compressImage(file, 1, 1920);
          console.log(`Compressed: ${(compressedFile.size / 1024).toFixed(0)}KB`);

          // Generate unique filename
          const fileExt = 'webp';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

          // Upload with timeout (30 seconds per file)
          const uploadPromise = uploadFileChunked(compressedFile, 'products', fileName);
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 30000)
          );

          const publicUrl = await Promise.race([uploadPromise, timeoutPromise]);
          uploadedUrls.push(publicUrl);
          
          completed++;
          setUploadProgress({ current: completed, total: fileArray.length });
          console.log(`Uploaded ${completed}/${fileArray.length}`);
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          // Continue with other files
        }
      }

      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploadée(s)`);
      } else {
        toast.error('Aucune image n\'a pu être uploadée');
      }
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
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

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const generateSKU = (title: string) => {
    const prefix = title
      .split(' ')
      .slice(0, 2)
      .map(word => word.substring(0, 3).toUpperCase())
      .join('-');
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Prevent double submission
      if (isSavingRef.current) {
        throw new Error('Sauvegarde déjà en cours');
      }
      isSavingRef.current = true;

      try {
        // Build available_colors JSONB
        const availableColors = selectedColors.map(name => ({
          name,
          hex: COLORS.find(c => c.name === name)?.code || '#000000'
        }));

        const productData = {
          title: data.title,
          slug: data.slug,
          price: data.price,
          compare_at_price: data.compare_at_price || null,
          short_description: data.short_description || null,
          description: data.description ? { text: data.description } : null,
          sku: data.sku?.trim() || generateSKU(data.title),
          stock: data.stock || 0,
          composition: selectedComposition || null,
          care_instructions: selectedCareInstructions || null,
          style: data.style || 'classique',
          is_active: data.is_active,
          is_new: data.is_new,
          is_featured: data.is_featured,
          available_colors: availableColors,
          available_sizes: selectedSizes.length > 0 ? selectedSizes : null,
          available_cup_sizes: selectedCupSizes.length > 0 ? selectedCupSizes : null,
        };

        let productId = id;

        if (isNew) {
          // Check for duplicate slug first
          const { data: existingSlug } = await supabase
            .from('products')
            .select('id')
            .eq('slug', data.slug)
            .maybeSingle();

          if (existingSlug) {
            // Append timestamp to make unique
            productData.slug = `${data.slug}-${Date.now().toString(36)}`;
          }

          const { data: newProduct, error } = await supabase
            .from('products')
            .insert(productData)
            .select('id')
            .single();
          
          if (error) throw error;
          productId = newProduct.id;
        } else {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id);
          
          if (error) throw error;
        }

        if (!productId) throw new Error('Product ID not found');

        // Handle images - delete existing first, then insert new
        if (!isNew) {
          await supabase
            .from('product_images')
            .delete()
            .eq('product_id', productId);
        }

        if (images.length > 0) {
          const imageRecords = images.map((url, index) => ({
            product_id: productId,
            image_url: url,
            display_order: index,
            alt_text: data.title,
          }));

          const { error: imageError } = await supabase
            .from('product_images')
            .insert(imageRecords);

          if (imageError) {
            console.error('Image insert error:', imageError);
          }
        }

        // Handle categories
        if (!isNew) {
          await supabase
            .from('product_categories')
            .delete()
            .eq('product_id', productId);
        }

        if (selectedCategories.length > 0) {
          const categoryRecords = selectedCategories.map(categoryId => ({
            product_id: productId,
            category_id: categoryId,
          }));

          const { error: categoryError } = await supabase
            .from('product_categories')
            .insert(categoryRecords);

          if (categoryError) {
            console.error('Category insert error:', categoryError);
          }
        }

        // Handle collections
        if (!isNew) {
          await supabase
            .from('product_collection_items')
            .delete()
            .eq('product_id', productId);
        }

        if (selectedCollections.length > 0) {
          const collectionRecords = selectedCollections.map(collectionId => ({
            product_id: productId,
            collection_id: collectionId,
          }));

          const { error: collectionError } = await supabase
            .from('product_collection_items')
            .insert(collectionRecords);

          if (collectionError) {
            console.error('Collection insert error:', collectionError);
          }
        }

        return productId;
      } finally {
        isSavingRef.current = false;
      }
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
    if (selectedCategories.length === 0) {
      toast.error('Veuillez sélectionner au moins une catégorie');
      return;
    }
    
    if (saveMutation.isPending || isSavingRef.current) {
      toast.warning('Sauvegarde en cours...');
      return;
    }
    
    saveMutation.mutate(data);
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border-2 border-dashed transition-colors ${
                  isDraggingOver ? 'border-rose-500 bg-rose-50' : 'border-border'
                }`}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={images} strategy={rectSortingStrategy}>
                    {images.map((url, index) => (
                      <SortableImage
                        key={url}
                        url={url}
                        index={index}
                        onRemove={() => removeImage(index)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {uploadProgress.current}/{uploadProgress.total}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center px-2">
                        Cliquez ou glissez
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {images.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Aucune image. Glissez-déposez des images ou cliquez pour uploader.
                </p>
              )}
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
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    onChange={(e) => {
                      form.setValue('title', e.target.value);
                      if (isNew) {
                        form.setValue('slug', generateSlug(e.target.value));
                      }
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
                <Label htmlFor="short_description">Description courte</Label>
                <Textarea
                  id="short_description"
                  rows={2}
                  {...form.register('short_description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea
                  id="description"
                  rows={5}
                  {...form.register('description')}
                />
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
                  <Label htmlFor="price">Prix (FCFA) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="1"
                    placeholder="Ex: 15000"
                    {...form.register('price', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare_at_price">Ancien prix (barré)</Label>
                  <Input
                    id="compare_at_price"
                    type="number"
                    step="1"
                    placeholder="Optionnel"
                    {...form.register('compare_at_price', {
                      setValueAs: v => {
                        if (v === '' || v === null || v === undefined) return null;
                        const parsed = parseFloat(v);
                        return isNaN(parsed) ? null : parsed;
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="Ex: 50"
                    {...form.register('stock', { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    {...form.register('sku')}
                    placeholder="Auto-généré si vide"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select
                    value={form.watch('style')}
                    onValueChange={(value) => form.setValue('style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classique">Classique</SelectItem>
                      <SelectItem value="sexy">Sexy</SelectItem>
                      <SelectItem value="sport">Sport</SelectItem>
                      <SelectItem value="confort">Confort</SelectItem>
                      <SelectItem value="elegant">Élégant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
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
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(collection.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCollections([...selectedCollections, collection.id]);
                          } else {
                            setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                          }
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

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options disponibles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Couleurs</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <label
                      key={color.name}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                        selectedColors.includes(color.name)
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.code }}
                      />
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColors([...selectedColors, color.name]);
                          } else {
                            setSelectedColors(selectedColors.filter(n => n !== color.name));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm">{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tailles</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <label
                      key={size}
                      className={`px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                        selectedSizes.includes(size)
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes([...selectedSizes, size]);
                          } else {
                            setSelectedSizes(selectedSizes.filter(s => s !== size));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{size}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSizes.length === SIZES.length) {
                        setSelectedSizes([]);
                      } else {
                        setSelectedSizes([...SIZES]);
                      }
                    }}
                    className="px-4 py-2 border-2 border-dashed rounded-md hover:bg-muted transition-colors text-sm font-medium text-muted-foreground"
                  >
                    {selectedSizes.length === SIZES.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Bonnets (optionnel)</Label>
                <div className="flex flex-wrap gap-2">
                  {CUP_SIZES.map(cup => (
                    <label
                      key={cup}
                      className={`px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                        selectedCupSizes.includes(cup)
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCupSizes.includes(cup)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCupSizes([...selectedCupSizes, cup]);
                          } else {
                            setSelectedCupSizes(selectedCupSizes.filter(c => c !== cup));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{cup}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails supplémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Composition</Label>
                <div className="flex flex-wrap gap-2">
                  {COMPOSITIONS.map(comp => (
                    <label
                      key={comp}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${selectedComposition === comp
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'hover:bg-muted'
                        }`}
                    >
                      <input
                        type="radio"
                        name="composition"
                        checked={selectedComposition === comp}
                        onChange={() => setSelectedComposition(comp)}
                        className="sr-only"
                      />
                      <span className="text-sm">{comp}</span>
                    </label>
                  ))}
                </div>
                <Input
                  placeholder="Ou saisir une composition personnalisée"
                  value={selectedComposition && !COMPOSITIONS.includes(selectedComposition) ? selectedComposition : ''}
                  onChange={(e) => setSelectedComposition(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <Label>Instructions d'entretien</Label>
                <div className="flex flex-wrap gap-2">
                  {CARE_INSTRUCTIONS.map(care => (
                    <label
                      key={care}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${selectedCareInstructions === care
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'hover:bg-muted'
                        }`}
                    >
                      <input
                        type="radio"
                        name="care_instructions"
                        checked={selectedCareInstructions === care}
                        onChange={() => setSelectedCareInstructions(care)}
                        className="sr-only"
                      />
                      <span className="text-sm">{care}</span>
                    </label>
                  ))}
                </div>
                <Textarea
                  placeholder="Ou saisir des instructions personnalisées"
                  value={selectedCareInstructions && !CARE_INSTRUCTIONS.includes(selectedCareInstructions) ? selectedCareInstructions : ''}
                  onChange={(e) => setSelectedCareInstructions(e.target.value)}
                  rows={2}
                  className="mt-2"
                />
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
                  <p className="text-sm text-muted-foreground">
                    Le produit sera visible sur le site
                  </p>
                </div>
                <Switch
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Nouveau</Label>
                  <p className="text-sm text-muted-foreground">
                    Affiché avec le badge "Nouveau"
                  </p>
                </div>
                <Switch
                  checked={form.watch('is_new')}
                  onCheckedChange={(checked) => form.setValue('is_new', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mis en avant</Label>
                  <p className="text-sm text-muted-foreground">
                    Affiché sur la page d'accueil
                  </p>
                </div>
                <Switch
                  checked={form.watch('is_featured')}
                  onCheckedChange={(checked) => form.setValue('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending || uploading}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNew ? 'Créer le produit' : 'Enregistrer'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
