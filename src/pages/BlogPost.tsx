import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

const db = supabase as any;

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author: string | null;
  tags: string[] | null;
  read_time: number | null;
  views: number | null;
  published_at: string | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([])

  useEffect(() => {
    if (slug) fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const { data, error } = await db
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) throw error
      setPost(data)

      if (data) {
        await db
          .from('blog_posts')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', data.id)

        if (data.tags && data.tags.length > 0) {
          const { data: related } = await db
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .neq('id', data.id)
            .limit(3)

          setRelatedPosts(related || [])
        }
      }
    } catch (error) {
      console.error('Error fetching blog post:', error)
      toast.error('Article introuvable')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papier')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Article introuvable</h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au blog
              </Button>
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at)}
              </span>
              {post.read_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.read_time} min de lecture
                </span>
              )}
              {post.author && <span>Par {post.author}</span>}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap gap-2">
                {post.tags?.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      {post.featured_image && (
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-lg max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </article>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Articles similaires</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(related => (
                  <Link key={related.id} to={`/blog/${related.slug}`}>
                    <div className="bg-background rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {related.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
