import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Clock, Calendar, ArrowLeft, ArrowRight, Tag, Share2, BookOpen, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  author: string;
  read_time: number;
  meta_title: string;
  meta_description: string;
  status: string;
  is_featured: boolean;
  created_at: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Prop Firm Education': 'bg-brand-gold/20 text-brand-gold border-brand-gold/30',
  'Trading Tips': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Industry News': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'General': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (data) {
          setPost(data);

          // Update document title for SEO
          document.title = data.meta_title || `${data.title} | Prop Match Spot Blog`;

          // Fetch related posts (same category, excluding current)
          const { data: related } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(3);

          if (related) setRelatedPosts(related);
        }
        if (error) console.error('Error fetching post:', error);
      } catch (err) {
        console.error('Post fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, text: post?.excerpt, url });
      } catch { }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center pt-20 text-white">
        <BookOpen size={48} className="text-brand-border mb-4" />
        <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
        <p className="text-brand-muted mb-6">The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="bg-brand-gold text-black font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans pt-16">

      {/* Cover Image Hero */}
      <div className="relative h-[300px] md:h-[450px] overflow-hidden">
        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent"></div>
        
        {/* Breadcrumb */}
        <div className="absolute bottom-6 left-0 right-0 max-w-[800px] mx-auto px-6">
          <div className="flex items-center gap-2 text-brand-muted text-sm font-medium mb-4">
            <Link to="/blog" className="hover:text-brand-gold transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Blog
            </Link>
            <ChevronRight size={14} />
            <span className="text-white truncate">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border inline-block mb-5 ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS['General']}`}>
            {post.category}
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-brand-border/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-black">
                P
              </div>
              <div>
                <div className="text-white font-bold">{post.author}</div>
                <div className="flex items-center gap-3 text-brand-muted text-sm">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(post.created_at)}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {post.read_time} min read</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-brand-muted hover:text-brand-gold bg-brand-charcoal border border-brand-border px-4 py-2 rounded-xl transition-all text-sm font-bold"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        {/* Article Body */}
        <article
          className="prose-blog mb-16"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-8 border-b border-brand-border/30 mb-12">
            <Tag size={14} className="text-brand-muted" />
            {post.tags.map(tag => (
              <span key={tag} className="text-xs font-bold bg-brand-charcoal text-brand-muted border border-brand-border px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-gold/10 to-transparent border border-brand-gold/20 rounded-2xl p-8 mb-16 text-center">
          <h3 className="text-2xl font-black text-white mb-3">Find Your Perfect Prop Firm</h3>
          <p className="text-brand-muted mb-6 max-w-md mx-auto">Compare firms, read verified reviews, and get exclusive discounts. Use code <strong className="text-brand-gold">SPOT</strong> to save!</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/firms">
              <button className="bg-brand-gold text-black font-black px-6 py-3 rounded-xl hover:bg-white transition-colors shadow-lg">
                Browse Firms
              </button>
            </Link>
            <Link to="/reviews">
              <button className="bg-brand-charcoal text-white font-bold border border-brand-border px-6 py-3 rounded-xl hover:border-brand-gold/50 transition-all">
                Read Reviews
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-2xl font-black text-white mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(rp => (
              <Link
                key={rp.id}
                to={`/blog/${rp.slug}`}
                className="group bg-brand-charcoal border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gold/40 transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={rp.cover_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[rp.category] || CATEGORY_COLORS['General']}`}>
                    {rp.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-3 group-hover:text-brand-gold transition-colors line-clamp-2">{rp.title}</h3>
                  <div className="flex items-center gap-3 text-brand-muted text-xs font-medium mt-3">
                    <span>{formatDate(rp.created_at)}</span>
                    <span>{rp.read_time} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostPage;
