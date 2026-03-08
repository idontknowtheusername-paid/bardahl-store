import { useEffect, useState } from 'react'
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
import { Loader2, Pencil, Trash2, Eye, Sparkles, Wand2, Image, RefreshCw } from 'lucide-react'

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
  'Les avantages des huiles synthétiques Bardahl',
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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [customTopic, setCustomTopic] = useState('')
  const [autoPublish, setAutoPublish] = useState(true)

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
    setShowEditDialog(true)
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
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
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
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
              <div>
                <Label>Image de couverture (URL)</Label>
                <Input value={editPost.featured_image || ''} onChange={e => setEditPost({ ...editPost, featured_image: e.target.value })} />
                {editPost.featured_image && (
                  <img src={editPost.featured_image} alt="" className="mt-2 w-full h-40 rounded object-cover" />
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
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
                <Button onClick={handleSave}>Sauvegarder</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
