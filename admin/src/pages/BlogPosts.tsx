import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { generateBlogPost } from '@/lib/mistral'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Loader2, Pencil, Trash2, Eye, Sparkles, Wand2, Image, RefreshCw, Upload, X } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  featured_image: string | null
  author: string | null
  tags: string[] | null
  read_time: number | null
  views: number | null
  status: string | null
  published_at: string | null
  created_at: string | null
}

const SUGGESTED_TOPICS = [
  'Comment choisir la bonne huile moteur pour votre véhicule',
  'Les avantages des huiles synthétiques pour votre moteur',
  'Guide complet des additifs moteur',
  'Entretien de la boîte de vitesses',
  'Viscosité des huiles moteur : normes SAE et ACEA',
  'Changement d\'huile : fréquence recommandée',
  'Entretien préventif automobile',
  'Comment protéger votre moteur pendant les fortes chaleurs',
  'Vidange moteur : guide pour les débutants',
  'Guide de maintenance pour véhicules à fort kilométrage',
  'Entretien automobile au Bénin',
  'Comment prolonger la durée de vie de votre moteur diesel',
]

export default function BlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [editPost, setEditPost] = useState<BlogPost | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [customTopic, setCustomTopic] = useState('')
  const [autoPublish, setAutoPublish] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur lors du chargement des articles')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickGenerate = async () => {
    setGenerating(true)
    toast.info('🤖 Génération en cours... (30-60 secondes)')
    try {
      const result = await generateBlogPost(undefined, true)
      if (result.success) {
        toast.success('✅ Article généré et publié avec succès !')
        fetchPosts()
      } else {
        toast.error(`Erreur : ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Erreur : ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleCustomGenerate = async () => {
    if (!customTopic.trim()) {
      toast.error('Veuillez entrer un sujet')
      return
    }
    setGenerating(true)
    setShowGenerateDialog(false)
    toast.info('🤖 Génération en cours avec votre sujet personnalisé...')
    try {
      const result = await generateBlogPost(customTopic.trim(), autoPublish)
      if (result.success) {
        toast.success('✅ Article généré avec succès !')
        setCustomTopic('')
        fetchPosts()
      } else {
        toast.error(`Erreur : ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Erreur : ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditPost({ ...post })
    setOriginalImage(post.featured_image)
    setShowEditDialog(true)
  }

  const handleCloseEditDialog = (open: boolean) => {
    if (!open && editPost && originalImage !== editPost.featured_image) {
      // Restore original image if dialog is closed without saving
      setEditPost(prev => prev ? { ...prev, featured_image: originalImage } : null)
    }
    setShowEditDialog(open)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editPost) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${editPost.id}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('blog_images')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('blog_images')
        .getPublicUrl(path)

      setEditPost({ ...editPost, featured_image: publicUrl })
      toast.success('Image uploadée !')
    } catch (error: any) {
      toast.error(`Erreur upload : ${error.message}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    if (!editPost) return
    setEditPost({ ...editPost, featured_image: null })
  }

  const handleSave = async () => {
    if (!editPost) return
    try {
      const wordCount = (editPost.content || '').split(/\s+/).length
      const readTime = Math.ceil(wordCount / 200)

      const updateData: any = {
        title: editPost.title,
        excerpt: editPost.excerpt,
        content: editPost.content,
        status: editPost.status,
        tags: editPost.tags,
        featured_image: editPost.featured_image,
        read_time: readTime,
      }

      if (editPost.status === 'published' && !editPost.published_at) {
        updateData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', editPost.id)

      if (error) throw error

      setOriginalImage(editPost.featured_image)
      toast.success('Article mis à jour')
      setShowEditDialog(false)
      fetchPosts()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
      toast.success('Article supprimé')
      fetchPosts()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'published': return <Badge className="bg-green-600">Publié</Badge>
      case 'draft': return <Badge variant="secondary">Brouillon</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground">{posts.length} article(s) • Génération automatique hebdomadaire active</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPosts} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleQuickGenerate} disabled={generating} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {generating ? 'Génération...' : 'Générer auto'}
          </Button>
          <Button variant="outline" onClick={() => setShowGenerateDialog(true)} disabled={generating} className="gap-2">
            <Wand2 className="w-4 h-4" />
            Sujet personnalisé
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total articles</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{posts.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Publiés</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{posts.filter(p => p.status === 'published').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Brouillons</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{posts.filter(p => p.status === 'draft').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Vues totales</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{posts.reduce((s, p) => s + (p.views || 0), 0)}</div></CardContent>
        </Card>
      </div>

      {/* Posts table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Vues</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post.id}>
                <TableCell>
                  {post.featured_image ? (
                    <img src={post.featured_image} alt="" className="w-16 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-16 h-10 rounded bg-muted flex items-center justify-center">
                      <Image className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <div className="font-medium truncate">{post.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{post.excerpt}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(post.status)}</TableCell>
                <TableCell>{post.views || 0}</TableCell>
                <TableCell className="text-sm">{formatDate(post.published_at || post.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {post.status === 'published' && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`https://autopassionbj.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun article. Cliquez sur "Générer auto" pour créer votre premier article !
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Generate with custom topic dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Générer un article avec sujet personnalisé</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Votre sujet / thème</Label>
              <Textarea
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="Ex: Comment entretenir son moteur diesel en climat tropical"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Suggestions de sujets :</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTED_TOPICS.slice(0, 6).map(topic => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setCustomTopic(topic)}
                  >
                    {topic.length > 40 ? topic.substring(0, 40) + '...' : topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoPublish"
                checked={autoPublish}
                onChange={e => setAutoPublish(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="autoPublish">Publier automatiquement</Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Annuler</Button>
              <Button onClick={handleCustomGenerate} disabled={generating || !customTopic.trim()} className="gap-2">
                <Wand2 className="w-4 h-4" />
                Générer l'article
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
          </DialogHeader>
          {editPost && (
            <div className="space-y-4">
              <div>
                <Label>Titre</Label>
                <Input value={editPost.title} onChange={e => setEditPost({ ...editPost, title: e.target.value })} />
              </div>
              <div>
                <Label>Extrait</Label>
                <Textarea value={editPost.excerpt || ''} onChange={e => setEditPost({ ...editPost, excerpt: e.target.value })} rows={2} />
              </div>

              {/* Image upload section */}
              <div>
                <Label>Image de couverture</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {editPost.featured_image ? (
                  <div className="mt-2 relative group">
                    <img src={editPost.featured_image} alt="" className="w-full h-48 rounded-lg object-cover border border-border" />
                    {uploading && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Changer l'image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" /> Supprimer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-2 w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Cliquez pour uploader une image</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <Label>Contenu (Markdown)</Label>
                <Textarea value={editPost.content || ''} onChange={e => setEditPost({ ...editPost, content: e.target.value })} rows={15} className="font-mono text-sm" />
              </div>
              <div>
                <Label>Tags (séparés par virgule)</Label>
                <Input
                  value={(editPost.tags || []).join(', ')}
                  onChange={e => setEditPost({ ...editPost, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                />
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={editPost.status || 'draft'} onValueChange={v => setEditPost({ ...editPost, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handleCloseEditDialog(false)}>Annuler</Button>
                <Button onClick={handleSave}>Sauvegarder</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}