import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FirmService, generateSlug, generateFakeUserForReview } from '../lib/services';
import { PropFirm } from '../types';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { Star, Shield, ArrowLeft, MessageSquare, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FirmLogo from '../components/FirmLogo';

const FirmReviewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showModal } = useModal();
  
  const [firm, setFirm] = useState<PropFirm | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Sorting state
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const firmData = await FirmService.getFirmDetails(id);
        setFirm(firmData);
        
        if (firmData?.id) {
          const { data } = await supabase
            .from('reviews')
            .select('*')
            .eq('firm_id', firmData.id)
            .order('created_at', { ascending: false });
            
          if (data) setReviews(data);
        }
      } catch (err) {
        console.error("Error loading reviews page:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firm) return;

    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      firm_id: firm.id,
      rating: newReview.rating,
      comment: newReview.comment,
      status: 'pending' // Auto-approve or pending based on policy
    });

    if (error) {
      setSubmitMsg("Failed to post review.");
      showModal({
        type: 'error',
        title: 'Review Failed',
        message: 'Failed to post review. Please try again.'
      });
    } else {
      setSubmitMsg("Review submitted successfully!");
      showModal({
        type: 'success',
        title: 'Review Submitted',
        message: 'Your review has been submitted successfully!'
      });
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      
      // Refresh reviews
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('firm_id', firm.id)
        .order('created_at', { ascending: false });
        
      if (data) setReviews(data);
    }
  };

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];
    
    if (filterRating !== null) {
      result = result.filter(r => r.rating === filterRating);
    }
    
    if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    } else {
      // Newest
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return result;
  }, [reviews, filterRating, sortBy]);

  // Calculate rating distribution
  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (counts[r.rating as keyof typeof counts] !== undefined) {
        counts[r.rating as keyof typeof counts]++;
      }
    });
    return counts;
  }, [reviews]);
  
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Firm Not Found</h2>
          <Link to="/firms"><Button>Back to Browse</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-muted font-sans pt-20">
      
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-4 border-b border-brand-border/50 pb-6">
            <Link to={`/firm/${generateSlug(firm.name)}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-charcoal border border-brand-border text-brand-muted hover:text-white hover:border-brand-gold/50 transition-all">
                <ArrowLeft size={18} />
            </Link>
            <div>
                <Link to={`/firm/${generateSlug(firm.name)}`} className="text-brand-gold text-sm font-bold hover:underline mb-1 block">
                    Back to Firm Profile
                </Link>
                <h1 className="text-3xl text-white font-black leading-tight flex items-center gap-3">
                    {firm.name} Reviews 
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-900/40 border border-green-800 px-2.5 py-1 text-xs font-medium text-green-400 align-middle">
                      <Shield size={12} /> Verified Data
                    </span>
                </h1>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Stats & Distribution */}
            <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
                
                {/* Firm Summary Card */}
                <div className="bg-brand-charcoal border border-brand-border rounded-xl p-5 shadow-lg flex items-center gap-4">
                    <FirmLogo src={firm.logo} alt={firm.name} size="md" className="shadow-2xl" />
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{firm.name}</h3>
                        <div className="flex items-center gap-1.5 text-brand-gold text-sm mt-1">
                            <Star className="fill-current text-brand-gold" size={14} />
                            <span className="font-bold text-white">{avgRating}</span>
                            <span className="text-brand-muted">({totalReviews} reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution Card */}
                <div className="bg-gradient-to-b from-brand-charcoal to-brand-black border border-brand-border rounded-xl p-6 shadow-xl">
                    <div className="text-center mb-6">
                        <div className="text-5xl font-black text-white mb-2 tracking-tighter">{avgRating}</div>
                        <div className="flex justify-center text-brand-gold mb-2">
                           {[1, 2, 3, 4, 5].map(star => (
                               <Star key={star} className={Number(avgRating) >= star ? "fill-current" : "opacity-30"} size={20} />
                           ))}
                        </div>
                        <p className="text-sm text-brand-muted">Based on {totalReviews} global reviews</p>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-brand-border/50 pt-6">
                        {[5, 4, 3, 2, 1].map(stars => {
                            const count = ratingCounts[stars as keyof typeof ratingCounts];
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <button 
                                  key={stars} 
                                  onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                                  className={`flex items-center gap-3 group text-sm w-full transition-all ${filterRating === stars ? 'opacity-100 scale-105 ml-2' : filterRating === null ? 'opacity-100 hover:opacity-80' : 'opacity-40 hover:opacity-100'}`}
                                >
                                    <span className="text-brand-gold font-bold w-12 flex justify-end gap-1">
                                        {stars} <Star className="fill-current" size={14} />
                                    </span>
                                    <div className="flex-1 h-2.5 bg-brand-black rounded-full overflow-hidden border border-brand-border/30">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-1000 ${stars >= 4 ? 'bg-green-500' : stars === 3 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-brand-muted w-8 text-right font-medium">{percentage.toFixed(0)}%</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {filterRating !== null && (
                        <button 
                          onClick={() => setFilterRating(null)}
                          className="w-full mt-6 py-2 rounded-lg bg-white/5 border border-white/10 text-brand-muted hover:text-white transition-colors text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Right Column: Reviews List & Filters */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Actions & Filters Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-charcoal border border-brand-border rounded-xl p-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Filter size={16} className="text-brand-muted hidden sm:block" />
                        <select 
                          className="bg-brand-black border border-brand-border rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-brand-gold w-full sm:w-auto"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </select>
                    </div>
                    
                    {!showReviewForm && (
                        <Button 
                          onClick={() => user ? setShowReviewForm(true) : showModal({ type: 'info', title: 'Login Required', message: 'Please log in to write a review.' })} 
                          className="w-full sm:w-auto shadow-lg shadow-brand-gold/10"
                        >
                            <MessageSquare size={16} className="mr-2" /> Write a Review
                        </Button>
                    )}
                </div>

                {/* Review Submission Form */}
                {showReviewForm && (
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-2xl animate-fade-in-up">
                    <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        <MessageSquare className="text-brand-gold" size={20} /> 
                        Share your experience with {firm.name}
                    </h4>
                    <form onSubmit={submitReview} className="flex flex-col gap-6">
                      <div className="bg-brand-black border border-brand-border rounded-lg p-5 flex flex-col items-center justify-center gap-3">
                        <label className="text-white font-bold block text-center">Overall Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className={`p-2 rounded-full transition-all hover:scale-110 hover:bg-white/5 ${newReview.rating >= star ? 'text-brand-gold' : 'text-gray-600'}`}
                            >
                              <Star fill={newReview.rating >= star ? "currentColor" : "none"} size={32} />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-brand-muted text-sm font-medium mb-2 block">Your Full Review</label>
                        <textarea
                          value={newReview.comment}
                          onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder={`What was your experience trading with ${firm.name}?`}
                          className="w-full bg-brand-black border border-brand-border rounded-lg p-4 text-white focus:border-brand-gold outline-none min-h-[150px] resize-y placeholder:text-neutral-600 shadow-inner"
                          required
                        />
                        <p className="text-xs text-brand-muted mt-2">Please be honest, detailed, and respectful. Reviews are monitored for spam.</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-brand-border/50">
                        <Button type="submit" className="flex-1">Post Public Review</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowReviewForm(false)} className="sm:w-32">Cancel</Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="flex flex-col gap-4">
                  {filteredAndSortedReviews.length > 0 ? filteredAndSortedReviews.map((review) => {
                    const fakeUser = generateFakeUserForReview(review.id);
                    return (
                    <div key={review.id} className="bg-brand-charcoal border border-brand-border rounded-xl p-6 hover:border-brand-border/80 transition-colors">
                      <div className="flex justify-between items-start mb-5 border-b border-brand-border/30 pb-4">
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-charcoal to-brand-black border-2 border-brand-border text-brand-gold flex items-center justify-center font-black text-lg shadow-inner shrink-0 leading-none">
                            {fakeUser.initial}
                          </div>
                          <div>
                            <div className="text-white font-bold flex items-center gap-2 text-[15px]">
                                {fakeUser.name}
                                {review.rating >= 4 && <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded border border-green-800 uppercase tracking-wider font-bold shrink-0">Recommended</span>}
                            </div>
                            <div className="text-brand-muted text-[13px] leading-tight mt-0.5">{fakeUser.email}</div>
                            <div className="text-brand-muted/70 text-xs flex items-center gap-2 mt-1.5 font-medium">
                              <span>{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              <span className="w-1 h-1 rounded-full bg-brand-border/50"></span>
                              <span className="flex items-center gap-1 text-green-500/80"><Shield size={10} className="text-green-500" /> Verified By Spot Sheriff</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 text-brand-gold mb-4 bg-brand-black inline-flex px-2 py-1.5 rounded-md border border-brand-border/50 shadow-inner">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={review.rating >= star ? 'fill-current' : 'opacity-20'} size={14} />
                        ))}
                      </div>
                      
                      <p className="text-gray-200 leading-relaxed text-[15px] whitespace-pre-wrap">{review.comment}</p>
                    </div>
                  )}) : (
                    <div className="bg-brand-charcoal border border-brand-border border-dashed rounded-xl py-20 px-6 flex flex-col items-center justify-center text-center mt-4">
                        <MessageSquare size={48} className="text-brand-border mb-4 opacity-50" />
                        <h3 className="text-xl text-white font-bold mb-2">No reviews found</h3>
                        <p className="text-brand-muted max-w-sm mb-6">
                            {filterRating !== null 
                                ? `There are currently no ${filterRating}-star reviews for this firm.` 
                                : `Be the first to share your proprietary trading experience with ${firm.name}.`
                            }
                        </p>
                        {filterRating !== null && (
                            <Button variant="secondary" onClick={() => setFilterRating(null)}>Clear Filter</Button>
                        )}
                    </div>
                  )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FirmReviewsPage;
