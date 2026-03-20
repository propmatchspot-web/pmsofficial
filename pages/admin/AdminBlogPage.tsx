import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { generateSlug } from '../../lib/services';
import { Plus, Edit2, Trash2, X, Save, FileText, Image, Search, Wand2, RefreshCcw, Loader2, BookOpen, Target, Hash, Type, Layout, Sparkles } from 'lucide-react';

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
  status: 'draft' | 'published';
  is_featured: boolean;
  created_at?: string;
}

const DEFAULT_POST: Partial<BlogPost> = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: 'General',
  tags: [],
  author: 'Prop Match Spot',
  read_time: 5,
  meta_title: '',
  meta_description: '',
  status: 'draft',
  is_featured: false,
};

const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'ai'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // Derived Categories
  const existingCategories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

  // Advanced AI State
  const [firms, setFirms] = useState<any[]>([]);
  const [aiTopic, setAiTopic] = useState('');
  const [aiSelectedFirm, setAiSelectedFirm] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiTone, setAiTone] = useState('Authoritative & Professional');
  const [aiLength, setAiLength] = useState('Standard (1000-1500 words)');
  const [isGenerating, setIsGenerating] = useState(false);

  // Paraphraser State
  const [paraphraserInput, setParaphraserInput] = useState('');
  const [paraphraserOutput, setParaphraserOutput] = useState('');
  const [isParaphrasing, setIsParaphrasing] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchFirms();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    if (error) console.error('Fetch posts error:', error);
    setLoading(false);
  };

  const fetchFirms = async () => {
    const { data } = await supabase.from('firms').select('id, name, profit_split_max, max_daily_drawdown, max_total_drawdown, challenges(price, account_size)').eq('status', 'active');
    if (data) setFirms(data);
  };

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost({ ...post });
      setTagsInput(post.tags?.join(', ') || '');
    } else {
      setEditingPost({ ...DEFAULT_POST });
      setTagsInput('');
    }
    setActiveTab('content');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingPost(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!editingPost?.title || !editingPost?.content) {
      alert('Title and Content are required.');
      return;
    }

    setIsSaving(true);
    
    const finalSlug = editingPost.slug || generateSlug(editingPost.title);
    
    const postData = {
      ...editingPost,
      slug: finalSlug,
      tags: tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
    };

    try {
      if (editingPost.id) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert([postData]);
        if (error) throw error;
      }
      
      await fetchPosts();
      handleCloseModal();
    } catch (err: any) {
      alert(`Error saving post: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (!error) {
      setPosts(posts.filter(p => p.id !== id));
    } else {
      alert('Error deleting post');
    }
  };

  const generateParaphrase = async () => {
    if (!paraphraserInput) return;

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      alert('Groq API Key is missing in .env');
      return;
    }

    setIsParaphrasing(true);

    const prompt = `
      You are an expert SEO copywriter and plagiarism dodger.
      Rewrite the following paragraph to be 100% unique, engaging, and indistinguishable from AI. 
      Do NOT include any introduction, just the rewritten paragraph itself. Keep the same core meaning.

      Original Paragraph:
      "${paraphraserInput}"
    `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            setParaphraserOutput(data.choices[0].message.content.trim());
        } else {
            throw new Error('Invalid response from AI');
        }
    } catch (err: any) {
        console.error('Paraphraser error', err);
        alert('Error paraphrasing. Check console.');
    } finally {
        setIsParaphrasing(false);
    }
  };

  const insertParaphraseIntoContent = () => {
    if (!paraphraserOutput) return;
    setEditingPost(prev => ({
        ...prev,
        content: (prev?.content || '') + `<p>${paraphraserOutput}</p>\n`
    }));
    setParaphraserOutput('');
    setParaphraserInput('');
    alert('Inserted rewritten paragraph into the editor!');
  };

  const generateAIPost = async () => {
    if (!aiTopic) {
      alert('Please provide a Custom Prompt or Topic.');
      return;
    }

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      alert('Groq API Key is missing in .env');
      return;
    }

    setIsGenerating(true);

    let firmContext = 'General Prop Trading Industry. No specific firm numbers should be used.';
    
    if (aiSelectedFirm) {
        const firmData = firms.find(f => f.id === aiSelectedFirm);
        if (firmData) {
            const minPrice = firmData.challenges?.reduce((min: number, c: any) => c.price < min ? c.price : min, Infinity);
            firmContext = `
                FIRM EXACT DATA FOCUS (DO NOT HALLUCINATE):
                - Name: ${firmData.name}
                - Profit Split: up to ${firmData.profit_split_max}%
                - Daily Drawdown: ${firmData.max_daily_drawdown}%
                - Max Drawdown: ${firmData.max_total_drawdown}%
                - Starting Price: $${minPrice !== Infinity ? minPrice : 'N/A'}
            `;
        }
    }

    const prompt = `
      You are the world's leading SEO Content Director for the prop firm review site "Prop Match Spot".
      Your task is to write an ultra-competitive, pillar-length blog post that outranks everything on Google.
      
      CONTENT DIRECTIVES:
      - Core Topic / Inspiration: "${aiTopic}"
      - Target Keywords: "${aiKeywords || 'prop trading, funded accounts, best prop firms 2026'}"
      - Tone of Voice: ${aiTone}
      - Target Length: ${aiLength}
      - Data Grounding: ${firmContext}

      SEO & STRUCTURE RULES:
      1. Use LSI (Latent Semantic Indexing) keywords naturally throughout the text.
      2. Format the post in strict, clean raw HTML. You MUST use <h2>, <h3>, <ul>, <li>, <strong>, <blockquote>.
      3. Do NOT wrap the HTML in markdown \`\`\` blocks. Avoid using an <h1> (the meta title handles this).
      4. Break content into highly readable scannable sections with bullet points, bolded key terms, and short paragraphs.
      5. Include an FAQ section formatted with <h3> at the bottom if applicable.
      6. Include a Call-To-Action (CTA) directing the reader to use the "Prop Match Spot" to compare firms, mentioning the promo code "SPOT" for maximum discounts.
      7. Provide highly optimized exact Meta Data in your JSON response.

      RETURN FORMAT:
      You must return ONLY a JSON object (no outside text) structured exactly like this:
      {
         "title": "A highly clickable, CTR-optimized SEO title containing the main keyword (max 65 chars)",
         "excerpt": "A short, engaging hook for the blog index listing card (2-3 sentences max)",
         "content": "<p>Raw HTML content starting with the intro...</p><h2>...</h2>",
         "meta_title": "The exact Google-optimized Title tag (must include Prop Match Spot)",
         "meta_description": "A compelling Google meta description with keywords (max 155 chars)",
         "suggested_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
      }
    `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6,
                max_completion_tokens: 8000,
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const resultJson = JSON.parse(data.choices[0].message.content);
            
            setEditingPost((prev) => ({
                ...prev,
                title: resultJson.title,
                slug: generateSlug(resultJson.title),
                excerpt: resultJson.excerpt,
                content: resultJson.content,
                meta_title: resultJson.meta_title,
                meta_description: resultJson.meta_description,
            }));
            setTagsInput(resultJson.suggested_tags?.join(', ') || '');
            setActiveTab('content');
            alert('AI SEO Generation Complete! Review your new pillar post in the tabs.');
        } else {
            throw new Error('Invalid response from AI');
        }
    } catch (err: any) {
        console.error('AI Gen error', err);
        alert('Error generating post. Ensure your Groq key is valid and check the console.');
    } finally {
        setIsGenerating(false);
    }
  };

  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-background-dark text-white p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <BookOpen className="text-brand-gold" size={32} /> SEO Blog Manager
          </h1>
          <p className="text-brand-muted text-sm mt-1">Manage articles and generate ultra-optimized AI semantic content</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-gold text-black px-6 py-3 rounded-xl font-black hover:bg-white transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={18} /> Write SEO Post
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center mb-6 bg-surface-dark p-4 rounded-xl border border-border-dark shadow-sm">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
          <input
            type="text"
            placeholder="Search articles & SEO slugs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-brand-gold outline-none text-white transition-all shadow-inner"
          />
        </div>
        <div className="text-sm text-brand-muted font-bold tracking-wider">
          TOTAL: <span className="text-white">{filteredPosts.length}</span> POSTS
        </div>
      </div>

      {/* Blog Table */}
      <div className="flex-1 overflow-auto bg-surface-dark border border-border-dark rounded-xl shadow-lg">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-gold" size={32} /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-dark/80 text-brand-muted text-[10px] font-black uppercase tracking-widest">
                <th className="p-4 border-b border-border-dark">Article</th>
                <th className="p-4 border-b border-border-dark">Category</th>
                <th className="p-4 border-b border-border-dark">Status</th>
                <th className="p-4 border-b border-border-dark">Featured</th>
                <th className="p-4 border-b border-border-dark">Date Published</th>
                <th className="p-4 border-b border-border-dark text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr key={post.id} className="border-b border-border-dark hover:bg-background-light/5 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-white mb-1 line-clamp-1">{post.title}</div>
                    <div className="text-xs text-brand-muted truncate max-w-sm flex items-center gap-1"><Hash size={12}/> {post.slug}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider bg-surface-highlight border border-border-dark rounded-md text-brand-muted inline-block">
                      {post.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${post.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {post.is_featured ? <div className="flex items-center gap-1 text-brand-gold text-xs font-bold"><Wand2 size={12}/> Hero</div> : <span className="text-brand-muted pl-4">-</span>}
                  </td>
                  <td className="p-4 text-brand-muted text-sm font-medium">
                    {new Date(post.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <a href={`/#/blog/${post.slug}`} target="_blank" rel="noreferrer" className="inline-block p-2 text-brand-muted hover:text-white bg-surface-highlight hover:bg-border-dark rounded-lg transition-colors shadow-sm" title="View Live Post">
                      <FileText size={16} />
                    </a>
                    <button onClick={() => handleOpenModal(post)} className="p-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/80 rounded-lg transition-colors shadow-sm" title="Edit Content">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/80 rounded-lg transition-colors shadow-sm" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-brand-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <BookOpen size={48} className="opacity-20"/>
                        <p className="font-bold">No blog posts found.</p>
                    </div>
                 </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Write/Edit Modal (FULL WIDTH) */}
      {isModalOpen && editingPost && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="w-full h-full max-w-[1600px] bg-background-dark border border-border-dark shadow-2xl flex flex-col rounded-2xl animate-fade-in-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="shrink-0 h-16 border-b border-border-dark px-6 flex items-center justify-between bg-surface-dark">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                {editingPost.id ? <Edit2 size={20} className="text-brand-gold" /> : <Plus size={20} className="text-brand-gold" />}
                {editingPost.id ? 'Edit Article & SEO' : 'Compose SEO Article'}
              </h2>
              <button onClick={handleCloseModal} className="text-brand-muted hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="shrink-0 flex border-b border-border-dark px-4 bg-surface-dark/50 pt-2 hide-scrollbar overflow-x-auto">
              <button 
                onClick={() => setActiveTab('content')}
                className={`px-6 py-3 text-sm font-black tracking-wider uppercase border-b-[3px] transition-colors whitespace-nowrap ${activeTab === 'content' ? 'border-brand-gold text-brand-gold bg-brand-gold/5' : 'border-transparent text-brand-muted hover:text-white hover:bg-white/5'}`}
              >
                📝 Content Studio
              </button>
              <button 
                onClick={() => setActiveTab('seo')}
                className={`px-6 py-3 text-sm font-black tracking-wider uppercase border-b-[3px] transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'seo' ? 'border-[#00a854] text-[#00a854] bg-[#00a854]/5' : 'border-transparent text-brand-muted hover:text-white hover:bg-white/5'}`}
              >
                <Search size={16} /> SEO & Indexing (Tags & Categories)
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`px-6 py-3 text-sm font-black tracking-wider uppercase border-b-[3px] transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'ai' ? 'border-[#a855f7] text-[#a855f7] bg-[#a855f7]/5' : 'border-transparent text-brand-muted hover:text-white hover:bg-white/5'}`}
              >
                <Wand2 size={16} className={activeTab === 'ai' ? 'animate-pulse' : ''} /> AI Optimization Engine
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-[#121212] p-6 lg:p-10 hide-scrollbar">
              <div className="max-w-[1400px] mx-auto">
              
              {/* CONTENT TAB */}
              {activeTab === 'content' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* MAIN EDITOR GRID */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: TITLE & CONTENT */}
                    <div className="xl:col-span-8 space-y-8">
                        <div>
                        <label className="block text-xs font-black text-brand-muted mb-2 uppercase tracking-widest flex items-center gap-2"><Type size={14}/> Master Title (H1)</label>
                        <input type="text" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} className="w-full bg-background-dark border border-border-dark rounded-xl px-5 py-4 text-white focus:border-brand-gold outline-none font-black text-2xl shadow-inner placeholder-white/20 transition-all" placeholder="E.g., Top 10 Best Prop Firms of 2026..." />
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <label className="block text-xs font-black text-brand-muted uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> Semantic HTML Document Body</label>
                                <span className="text-[10px] text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded border border-brand-gold/20 font-bold uppercase tracking-widest">Rich HTML Required</span>
                            </div>
                            <textarea value={editingPost.content} onChange={e => setEditingPost({...editingPost, content: e.target.value})} className="w-full h-[60vh] min-h-[600px] bg-background-dark border border-border-dark rounded-xl px-6 py-6 text-[#d1d5db] focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none font-mono text-[15px] leading-relaxed resize-y shadow-inner custom-scrollbar" placeholder="<h2>Start structuring your pillar content here...</h2>&#10;<p>If using the AI Engine, this field will accurately populate with pre-styled content that outranks competitors perfectly...</p>" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PARAPHRASER & OTHER STUFF */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* PARAGRAPH PARAPHRASER WIDGET */}
                        <div className="p-6 bg-gradient-to-b from-[#2a1744] to-background-dark border border-[#a855f7]/30 rounded-2xl shadow-xl">
                            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Sparkles className="text-[#a855f7]" size={20} /> Paragraph Rewriter</h3>
                            <p className="text-xs text-[#d8b4fe] mb-5 font-medium leading-relaxed">Paste a competitor's paragraph here to rewrite it completely unique and plagiarism-free, ready to insert.</p>
                            
                            <textarea 
                                value={paraphraserInput} 
                                onChange={(e) => setParaphraserInput(e.target.value)}
                                className="w-full bg-black/60 border border-[#a855f7]/40 rounded-xl px-4 py-3 text-white text-sm focus:border-[#a855f7] outline-none shadow-inner resize-none mb-3"
                                rows={4}
                                placeholder="Paste paragraph to rewrite..."
                            />

                            <button
                                onClick={generateParaphrase}
                                disabled={isParaphrasing || !paraphraserInput}
                                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                {isParaphrasing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                                {isParaphrasing ? 'Rewriting...' : 'Rewrite Paragraph'}
                            </button>

                            {paraphraserOutput && (
                                <div className="mt-4 p-4 bg-[#a855f7]/10 border border-[#a855f7]/40 rounded-xl relative">
                                    <div className="text-sm text-white font-medium mb-3">{paraphraserOutput}</div>
                                    <button 
                                        onClick={insertParaphraseIntoContent}
                                        className="text-xs bg-white text-black font-bold px-3 py-1.5 rounded w-full hover:bg-gray-200"
                                    >
                                        Insert into Article Body
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-brand-muted mb-2 uppercase tracking-widest flex items-center gap-2"><Image size={14}/> Cover Image CDN Link</label>
                            <div className="flex flex-col gap-4">
                                <input type="text" value={editingPost.cover_image} onChange={e => setEditingPost({...editingPost, cover_image: e.target.value})} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none shadow-inner" placeholder="https://images.unsplash.com/..." />
                                <div className="w-full aspect-[16/9] bg-background-dark border border-border-dark rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-inner">
                                    {editingPost.cover_image ? <img src={editingPost.cover_image} className="w-full h-full object-cover" alt="" /> : <><Image size={32} className="text-brand-muted/30 mb-2" /><span className="text-xs text-brand-muted font-bold tracking-widest">IMAGE PREVIEW</span></>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-brand-muted mb-2 uppercase tracking-widest">Feed Excerpt (Short hook)</label>
                            <textarea value={editingPost.excerpt} onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})} rows={3} className="w-full bg-background-dark border border-border-dark rounded-xl px-5 py-4 text-white focus:border-brand-gold outline-none text-base resize-none shadow-inner placeholder-white/20" placeholder="Capture the reader's attention instantly before they click read more..." />
                        </div>
                    </div>
                  </div>
                </div>
              )}


              {/* SEO TAB & CATEGORIZATION */}
              {activeTab === 'seo' && (
                <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                  
                  {/* CATEGORY & TAGGING ENGINE */}
                  <div className="p-8 bg-[#18181b] border border-[#00a854]/30 rounded-2xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Hash size={120} className="text-[#00a854]" />
                      </div>
                      <h3 className="text-xl font-black text-[#00a854] mb-6 tracking-widest uppercase flex items-center gap-3 relative z-10"><Target size={20} /> Taxonomy & Ranking</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                          <div>
                             <label className="block text-xs font-black text-white mb-2 uppercase tracking-widest">Custom Category Name</label>
                             <div className="text-[10px] text-brand-muted mb-2 font-bold max-w-sm">Type ANY name to create a new category, or select from existing ones below.</div>
                             
                             {/* DYNAMIC DATALIST FOR CATEGORIES */}
                             <input 
                                list="blog-categories" 
                                value={editingPost.category} 
                                onChange={e => setEditingPost({...editingPost, category: e.target.value})} 
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-[#00a854] outline-none shadow-inner font-bold" 
                                placeholder="Type to create new category..." 
                             />
                             <datalist id="blog-categories">
                                {existingCategories.map(c => <option key={c} value={c} />)}
                             </datalist>
                          </div>

                          <div>
                             <label className="block text-xs font-black text-white mb-2 uppercase tracking-widest">Estimated Read Time</label>
                             <div className="text-[10px] text-brand-muted mb-2 font-bold max-w-sm">Dwells time matters. Set an accurate minute estimate.</div>
                             <input type="number" value={editingPost.read_time} onChange={e => setEditingPost({...editingPost, read_time: parseInt(e.target.value) || 5})} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-[#00a854] outline-none shadow-inner font-bold" />
                          </div>

                          <div className="md:col-span-2 mt-2">
                             <label className="block text-xs font-black text-white mb-2 uppercase tracking-widest">Target Keyword SEO Tags</label>
                             <div className="text-[10px] text-brand-muted mb-2 font-bold">Separate your target ranking keywords with commas. These display at the bottom of the post.</div>
                             <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="w-full bg-background-dark border border-border-dark rounded-xl px-5 py-4 text-white focus:border-[#00a854] outline-none shadow-inner" placeholder="forex, funded accounts, top prop firms rules" />
                          </div>
                      </div>
                  </div>

                  {/* SEARCH PREVIEW MODULE */}
                  <div className="p-6 bg-[#000000] border border-border-dark rounded-2xl shadow-xl">
                    <h3 className="text-white font-black mb-4 text-sm tracking-widest uppercase flex items-center gap-2"><Search size={16} /> Live Google SERP Preview</h3>
                    <div className="bg-[#202124] p-5 rounded-xl font-sans border border-white/5">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-7 h-7 bg-brand-gold rounded-full flex items-center justify-center text-black font-bold text-xs">P</div>
                        <div>
                           <div className="text-[#e8eaed] text-sm">Prop Match Spot</div>
                           <div className="text-[#9aa0a6] text-xs">https://propmatchspot.com › blog › {editingPost.slug || 'your-slug'}</div>
                        </div>
                      </div>
                      <div className="text-[#8ab4f8] text-xl font-normal hover:underline cursor-pointer truncate mt-2">{editingPost.meta_title || editingPost.title || 'Enter your highly optimized Meta Title here'}</div>
                      <div className="text-[#bdc1c6] text-sm mt-1 leading-snug break-words">
                        {editingPost.created_at ? new Date(editingPost.created_at).toLocaleDateString() : new Date().toLocaleDateString()} — {editingPost.meta_description || editingPost.excerpt || 'Write a compelling meta description up to 155 characters that contains your primary keyword to maximize organic CTR...'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark space-y-6">
                      <div>
                        <label className="block text-xs font-black text-brand-muted mb-2 uppercase tracking-widest">URL Slug Structure (Auto-syncs)</label>
                        <input type="text" value={editingPost.slug} onChange={e => setEditingPost({...editingPost, slug: e.target.value})} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-[#00a854] outline-none font-mono text-sm shadow-inner" placeholder="best-forex-prop-firms-2026" />
                      </div>

                      <div>
                        <div className="flex justify-between">
                            <label className="block text-xs font-black text-brand-muted mb-2 uppercase tracking-widest">SEO Meta Title</label>
                            <span className={`text-[10px] font-bold ${editingPost.meta_title?.length > 60 ? 'text-red-400' : 'text-brand-muted'}`}>{editingPost.meta_title?.length || 0}/60 chars optimal</span>
                        </div>
                        <input type="text" value={editingPost.meta_title} onChange={e => setEditingPost({...editingPost, meta_title: e.target.value})} maxLength={80} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-[#00a854] outline-none shadow-inner" />
                      </div>

                      <div>
                        <div className="flex justify-between">
                            <label className="block text-xs font-black text-brand-muted mb-2 uppercase tracking-widest">SEO Meta Description</label>
                            <span className={`text-[10px] font-bold ${editingPost.meta_description?.length > 155 ? 'text-red-400' : 'text-brand-muted'}`}>{editingPost.meta_description?.length || 0}/155 chars optimal</span>
                        </div>
                        <textarea value={editingPost.meta_description} onChange={e => setEditingPost({...editingPost, meta_description: e.target.value})} maxLength={200} rows={3} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-[#00a854] outline-none resize-none shadow-inner" />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark">
                      <label className="block text-xs font-black text-brand-muted mb-3 uppercase tracking-widest">Publish Status</label>
                      <select value={editingPost.status} onChange={e => setEditingPost({...editingPost, status: e.target.value as any})} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-4 text-white font-black text-base focus:border-[#00a854] outline-none shadow-inner cursor-pointer">
                        <option value="draft">⏺ DRAFT - Hidden from public</option>
                        <option value="published">🟢 PUBLISHED - Live & Indexed</option>
                      </select>
                    </div>

                    <div className="bg-surface-dark p-6 rounded-2xl border border-brand-gold/20 flex flex-col justify-center">
                      <label className="flex items-center gap-4 cursor-pointer group w-full p-2">
                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${editingPost.is_featured ? 'bg-brand-gold border-brand-gold' : 'border-border-dark bg-background-dark'}`}>
                           {editingPost.is_featured && <Check className="text-black w-4 h-4" strokeWidth={4} />}
                           <input type="checkbox" checked={editingPost.is_featured} onChange={e => setEditingPost({...editingPost, is_featured: e.target.checked})} className="hidden" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-widest group-hover:text-brand-gold transition-colors">Hero Post Feature</span>
                            <span className="text-xs text-brand-muted font-medium mt-0.5">Pins this post to the top of the blog page layout</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* AI GENERATOR TAB - FULLY EXPANDED OPTIONS */}
              {activeTab === 'ai' && (
                <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-20">
                  <div className="bg-gradient-to-br from-[#2a1744] via-[#1a0f2b] to-black border border-[#a855f7]/30 p-8 lg:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Wand2 size={300} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-[#a855f7]/20 rounded-2xl flex items-center justify-center border border-[#a855f7]/30 mb-5 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                            <Wand2 size={28} className="text-[#a855f7]" />
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight">AI SEO Content Director</h3>
                        <p className="text-[#d8b4fe] text-sm lg:text-base max-w-2xl font-medium">Configure advanced generation parameters to produce highly-optimized pillar content grounded in real firm data.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-[#d8b4fe] mb-2 uppercase tracking-widest flex items-center gap-2"><Target size={14}/> Primary Topic or Link</label>
                                <textarea value={aiTopic} onChange={e => setAiTopic(e.target.value)} rows={3} className="w-full bg-black/60 border border-[#a855f7]/30 rounded-xl px-5 py-4 text-white focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] outline-none shadow-inner resize-none text-base" placeholder="Describe exactly what you want or paste a competitor URL to analyze for topic structure..." />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-[#d8b4fe] mb-2 uppercase tracking-widest flex items-center gap-2"><Hash size={14}/> Exact SEO Target Keywords</label>
                                <input type="text" value={aiKeywords} onChange={e => setAiKeywords(e.target.value)} className="w-full bg-black/60 border border-[#a855f7]/30 rounded-xl px-5 py-4 text-white focus:border-[#a855f7] outline-none shadow-inner" placeholder="funded trader, 1-step evaluation, zero spread..." />
                                <div className="text-[10px] text-white/40 mt-1 font-bold">Comma separated LSI targets.</div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-[#d8b4fe] mb-2 uppercase tracking-widest flex items-center gap-2"><Layout size={14}/> Firm Fact-Checking Engine</label>
                                <select value={aiSelectedFirm} onChange={e => setAiSelectedFirm(e.target.value)} className="w-full bg-black/60 border border-[#a855f7]/30 rounded-xl px-5 py-4 text-white focus:border-[#a855f7] outline-none shadow-inner cursor-pointer font-bold">
                                    <option value="">Do Not Ground (General Guide)</option>
                                    {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                <div className="text-[10px] text-white/60 mt-2 bg-[#a855f7]/10 p-2 rounded border border-[#a855f7]/20 font-medium">Forces LLaMA to use verified Supabase numerical values.</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-[#d8b4fe] mb-2 uppercase tracking-widest">Tone of Voice</label>
                                    <select value={aiTone} onChange={e => setAiTone(e.target.value)} className="w-full bg-black/60 border border-[#a855f7]/30 rounded-xl px-4 py-3 text-white focus:border-[#a855f7] outline-none cursor-pointer text-sm">
                                        <option>Authoritative & Professional</option>
                                        <option>Conversational & Direct</option>
                                        <option>Aggressive & High Energy</option>
                                        <option>Objective & Educational</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[#d8b4fe] mb-2 uppercase tracking-widest">Document Length</label>
                                    <select value={aiLength} onChange={e => setAiLength(e.target.value)} className="w-full bg-black/60 border border-[#a855f7]/30 rounded-xl px-4 py-3 text-white focus:border-[#a855f7] outline-none cursor-pointer text-sm">
                                        <option>Standard (1000-1500 words)</option>
                                        <option>Short Read (500-800 words)</option>
                                        <option>Pillar Content (2500+ words)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 relative z-10 flex flex-col items-center border-t border-[#a855f7]/20 pt-10">
                        <button 
                            onClick={generateAIPost}
                            disabled={isGenerating || !aiTopic}
                            className="group relative bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black px-10 py-5 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Synthesizing SEO Semantic Data...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={24} className="group-hover:rotate-12 transition-transform" />
                                    Launch AI Generation Protocol
                                </>
                            )}
                        </button>
                        <span className="text-xs text-brand-muted mt-4 font-bold tracking-widest uppercase">Powered by Groq • LLaMA 3.3 70B</span>
                    </div>

                  </div>
                </div>
              )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 h-24 border-t border-border-dark px-8 flex items-center justify-between bg-surface-dark/90 backdrop-blur-md">
              <div className="flex items-center gap-3 text-brand-muted text-sm font-bold">
                 {!isSaving && <span className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={16}/> Auto-draft ready</span>}
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={handleCloseModal} className="px-6 py-3 rounded-xl font-bold text-white hover:bg-white/10 transition-colors uppercase tracking-widest text-xs">
                    Close Editor
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-brand-gold text-black px-10 py-3.5 rounded-xl font-black hover:bg-white hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(204,171,83,0.2)] disabled:opacity-50 disabled:transform-none text-sm uppercase tracking-widest"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? 'Syncing...' : 'Publish / Save Changes'}
                  </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Helper icon component for checkbox
const Check = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
)

const CheckCircle2 = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinewidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
)

export default AdminBlogPage;
