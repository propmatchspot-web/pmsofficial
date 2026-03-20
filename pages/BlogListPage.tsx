import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Search, Clock, Calendar, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
  status: string;
  is_featured: boolean;
  created_at: string;
}

const POSTS_PER_PAGE = 9;

const CATEGORY_COLORS: Record<string, string> = {
  'Prop Firm Education': 'bg-brand-gold/20 text-brand-gold border-brand-gold/30',
  'Trading Tips': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Industry News': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'General': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (data) setPosts(data);
        if (error) console.error('Error fetching blog posts:', error);
      } catch (err) {
        console.error('Blog fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, []);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(posts.map(p => p.category))];
    return cats;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = posts.find(p => p.is_featured);
  const gridPosts = filteredPosts.filter(p => !p.is_featured || selectedCategory !== 'All' || searchQuery.trim());

  const totalPages = Math.ceil(gridPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = gridPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans pt-16">

      {/* Hero Section with Featured Post */}
      {featuredPost && selectedCategory === 'All' && !searchQuery.trim() && (
        <div className="relative bg-[#181611] border-b border-brand-border/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 opacity-20">
            <img src={featuredPost.cover_image} alt="" className="w-full h-full object-cover" />
          </div>
          
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Featured Image */}
              <Link to={`/blog/${featuredPost.slug}`} className="block group">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-brand-border/30 aspect-[16/10]">
                  <img
                    src={featuredPost.cover_image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${CATEGORY_COLORS[featuredPost.category] || CATEGORY_COLORS['General']}`}>
                      {featuredPost.category}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Featured Content */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4 text-brand-muted text-sm font-medium">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(featuredPost.created_at)}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {featuredPost.read_time} min read</span>
                </div>

                <Link to={`/blog/${featuredPost.slug}`} className="group">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight group-hover:text-brand-gold transition-colors">
                    {featuredPost.title}
                  </h1>
                </Link>
                
                <p className="text-gray-400 text-lg leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-black text-sm">
                      P
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{featuredPost.author}</div>
                      <div className="text-brand-muted text-xs">Editorial Team</div>
                    </div>
                  </div>
                  <Link to={`/blog/${featuredPost.slug}`} className="group/btn">
                    <button className="bg-brand-gold text-black font-black px-6 py-3 rounded-xl hover:bg-white transition-colors flex items-center gap-2 shadow-lg text-sm">
                      Read Article <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-4">
        <div className="flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`text-sm font-bold px-4 py-2 rounded-full border transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-gold text-black border-brand-gold shadow-glow'
                    : 'bg-brand-charcoal text-brand-muted border-brand-border hover:border-brand-gold/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-brand-charcoal border border-brand-border focus:border-brand-gold rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all placeholder:text-neutral-500"
            />
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {paginatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-brand-charcoal border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gold/40 transition-all hover:shadow-[0_8px_30px_rgba(204,171,83,0.08)] h-full"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={post.cover_image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  {/* Category */}
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border w-fit ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS['General']}`}>
                    {post.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-brand-gold transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-brand-muted text-xs font-medium pt-3 border-t border-brand-border/30 mt-auto">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.created_at)}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.read_time} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto text-brand-border mb-4 opacity-50" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-brand-muted">Try adjusting your search or category filter</p>
            <button
              className="mt-6 bg-brand-charcoal border border-brand-border text-brand-muted px-6 py-2.5 rounded-xl hover:text-white hover:border-brand-gold/50 transition-all font-bold text-sm"
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-brand-border bg-brand-charcoal text-brand-muted hover:text-white hover:border-brand-gold/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                  currentPage === page
                    ? 'bg-brand-gold text-black shadow-glow'
                    : 'border border-brand-border bg-brand-charcoal text-brand-muted hover:text-white hover:border-brand-gold/50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-brand-border bg-brand-charcoal text-brand-muted hover:text-white hover:border-brand-gold/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;
