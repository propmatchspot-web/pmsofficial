import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { generateSlug, generateFakeUserForReview } from '../lib/services';
import { PropFirm } from '../types';
import { Star, Shield, Search, ArrowRight, MessageSquare, Filter, ChevronDown, CheckCircle, Award } from 'lucide-react';
import Button from '../components/Button';
import FirmLogo from '../components/FirmLogo';

interface FirmStats {
  firm: PropFirm;
  avgRating: number;
  totalReviews: number;
  latestReview: any;
}

const AllReviewsPage: React.FC = () => {
  const [stats, setStats] = useState<FirmStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'most_reviews' | 'highest_rated' | 'alphabetical'>('highest_rated');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch all active firms
        const { data: firmsList } = await supabase
            .from('firms')
            .select('*')
            .eq('status', 'active');
            
        // Fetch all reviews outright
        const { data: allReviews } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (firmsList && allReviews) {
            // Aggregate data
            const aggregated: FirmStats[] = firmsList.map(firm => {
                const firmReviews = allReviews.filter(r => r.firm_id === firm.id);
                const total = firmReviews.length;
                const avg = total > 0 ? firmReviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
                
                return {
                    firm,
                    avgRating: Number(avg.toFixed(1)),
                    totalReviews: total,
                    latestReview: firmReviews[0] || null // since ordered by created_at desc
                };
            });
            
            setStats(aggregated);
        }
      } catch (err) {
        console.error("Error fetching global reviews data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    window.scrollTo(0, 0);
  }, []);

  const filteredAndSortedStats = useMemo(() => {
    let result = [...stats];

    // Search
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(s => s.firm.name.toLowerCase().includes(query));
    }

    // Sort
    result.sort((a, b) => {
        if (sortBy === 'highest_rated') {
            if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
            return b.totalReviews - a.totalReviews; // Tie breaker
        }
        if (sortBy === 'most_reviews') {
            return b.totalReviews - a.totalReviews;
        }
        if (sortBy === 'alphabetical') {
            return a.firm.name.localeCompare(b.firm.name);
        }
        return 0;
    });

    return result;
  }, [stats, searchQuery, sortBy]);

  const totalGlobalReviews = stats.reduce((sum, s) => sum + s.totalReviews, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans pt-16">
      
      {/* Hero Section */}
      <div className="relative bg-[#181611] border-b border-brand-border/50 py-16 md:py-24 overflow-hidden">
         {/* Background Ornaments */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-gold/5 pointer-events-none"></div>
         <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
         
         <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 mt-4">
                Prop Firm <span className="text-brand-gold">Reviews</span> Directory
            </h1>
            <p className="text-brand-muted text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium">
                Compare trusted ratings, verify payouts, and read authentic experiences from our community of funded traders.
            </p>
            <div className="flex justify-center items-center gap-6 text-sm font-bold text-gray-300">
                <div className="flex items-center gap-2"><Shield className="text-green-500" size={18} /> Verified Data</div>
                <div className="flex items-center gap-2 text-brand-gold"><CheckCircle className="text-brand-gold" size={18} /> {totalGlobalReviews.toLocaleString()} Real Reviews</div>
                <div className="flex items-center gap-2 text-white"><Award className="text-brand-muted" size={18} /> {stats.length} Listed Firms</div>
            </div>
         </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 bg-brand-charcoal border border-brand-border p-4 rounded-2xl w-full">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                <input 
                    type="text" 
                    placeholder="Search for a prop firm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-black border border-brand-border/80 focus:border-brand-gold rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all shadow-inner placeholder:text-neutral-500"
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter size={18} className="text-brand-muted hidden sm:block" />
                <div className="w-full md:w-auto relative">
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-brand-black border border-brand-border/80 outline-none focus:border-brand-gold text-white rounded-xl py-3 pl-4 pr-10 appearance-none cursor-pointer"
                    >
                        <option value="highest_rated">Highest Rated</option>
                        <option value="most_reviews">Most Reviewed</option>
                        <option value="alphabetical">A - Z</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                </div>
            </div>
        </div>

        {/* Directory Table */}
        <div className="bg-brand-charcoal border border-brand-border rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap lg:whitespace-normal min-w-[800px]">
                    <thead>
                        <tr className="bg-[#181611]/80 border-b border-brand-border/80 text-brand-muted text-[11px] font-black uppercase tracking-widest">
                            <th className="p-5 pl-8 w-16 text-center">#</th>
                            <th className="p-5 w-2/5">Prop Firm</th>
                            <th className="p-5 w-1/5 whitespace-nowrap">Avg Rating</th>
                            <th className="p-5 w-2/5">Recent Feedback</th>
                            <th className="p-5 pr-8 text-right w-32">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40">
                        {filteredAndSortedStats.map((stat, idx) => {
                            const hasReviews = stat.totalReviews > 0;
                            return (
                                <tr key={stat.firm.id} className="hover:bg-brand-black/50 transition-colors group">
                                    <td className="p-5 pl-8 text-center">
                                        <div className="text-brand-muted font-bold text-sm bg-brand-black border border-brand-border/50 rounded-full w-8 h-8 flex items-center justify-center shadow-inner mx-auto group-hover:border-brand-gold/30 transition-colors">{idx + 1}</div>
                                    </td>
                                    
                                    <td className="p-5">
                                        <Link to={`/firm/${generateSlug(stat.firm.name)}`} className="flex items-center gap-4 w-fit">
                                            <div className="w-12 h-12 shrink-0 rounded-lg border border-brand-border shadow-inner group-hover:border-brand-gold/50 transition-colors overflow-hidden relative">
                                                <img src={stat.firm.favicon || stat.firm.logo} alt={stat.firm.name} className="absolute inset-0 w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg group-hover:text-brand-gold transition-colors">{stat.firm.name}</h3>
                                                <div className="flex items-center gap-1.5 mt-1 opacity-60">
                                                    <span className="text-xs text-brand-muted uppercase tracking-wider font-bold">Details</span>
                                                    <ArrowRight size={12} className="text-brand-muted" />
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    
                                    <td className="p-5">
                                        <div className="flex flex-col gap-1.5 w-fit">
                                            <div className="flex items-center gap-1.5 text-brand-gold bg-brand-black border border-brand-border/50 px-3 py-1.5 rounded-lg shadow-inner">
                                                <Star fill={hasReviews ? "currentColor" : "none"} size={16} className={!hasReviews ? "text-brand-muted" : ""} />
                                                <span className={`font-black tracking-tight ${hasReviews ? "text-white text-lg" : "text-brand-muted text-base"}`}>
                                                    {hasReviews ? stat.avgRating.toFixed(1) : 'NR'}
                                                </span>
                                            </div>
                                            <span className="text-brand-muted text-xs font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 inline-block text-center w-full">
                                                {stat.totalReviews} Reviews
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="p-5 max-w-xs xl:max-w-md w-full">
                                        {hasReviews && stat.latestReview ? (
                                            <div className="flex flex-col gap-2.5">
                                                <p className="text-gray-300 text-[13px] leading-relaxed line-clamp-2 italic pr-4">
                                                    "{stat.latestReview.comment}"
                                                </p>
                                                <div className="flex items-center gap-2 text-[11px] text-brand-muted font-bold tracking-wide">
                                                    <div className="w-4 h-4 rounded-full bg-brand-charcoal border border-brand-border flex items-center justify-center text-brand-gold text-[8px] shadow-sm uppercase shrink-0">
                                                        {generateFakeUserForReview(stat.latestReview.id).initial}
                                                    </div>
                                                    <span className="truncate">{generateFakeUserForReview(stat.latestReview.id).name}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-brand-muted text-sm italic opacity-50">
                                                <MessageSquare size={14} /> No recent feedback
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td className="p-5 pr-8 text-right">
                                        <Link to={`/firm/${generateSlug(stat.firm.name)}/reviews`} className="inline-block">
                                            <button className="bg-brand-black hover:bg-brand-gold hover:text-black border border-brand-border hover:border-brand-gold text-white focus:outline-none transition-all px-5 py-3 rounded-xl text-[13px] font-black tracking-wide shadow-lg flex items-center gap-2 group/btn uppercase">
                                                Read <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
        
        {filteredAndSortedStats.length === 0 && (
            <div className="py-20 text-center">
                <Search className="mx-auto text-brand-border mb-4 opacity-50" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">No firms found</h3>
                <p className="text-brand-muted">Try adjusting your search criteria</p>
                <Button className="mt-6" onClick={() => setSearchQuery('')} variant="secondary">Clear Search</Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AllReviewsPage;
