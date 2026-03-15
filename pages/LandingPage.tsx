import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Award, ChevronRight, ChevronLeft, Users, Zap, CheckCircle2, ArrowRight, LineChart, Bookmark, Star, Cpu, Terminal, ChevronDown, HelpCircle, Sparkles, ShieldCheck, BarChart3, GraduationCap, X, Globe, Flame, Trophy, Gift, Copy } from 'lucide-react';
import FirmCard from '../components/FirmCard';
import { supabase } from '../lib/supabaseClient';
import { PropFirm } from '../types';

// FAQ Accordion Item Component
const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'ring-1 ring-brand-gold/20' : ''}`}>
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${isOpen ? 'from-brand-gold/10 via-brand-gold/5 to-transparent' : 'from-white/[0.04] via-white/[0.02] to-white/[0.01]'} transition-all duration-300`}></div>
      <div className="absolute inset-[1px] rounded-2xl bg-[#0c0b09]"></div>
      <button onClick={() => setIsOpen(!isOpen)} className="relative z-[2] w-full flex items-center justify-between p-6 text-left">
        <span className={`font-bold ${isOpen ? 'text-brand-gold' : 'text-white'} transition-colors pr-4`}>{question}</span>
        <ChevronDown size={18} className={`text-neutral-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-gold' : ''}`} />
      </button>
      <div className={`relative z-[2] overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-6 pb-6 text-neutral-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [topFirms, setTopFirms] = useState<PropFirm[]>([]);
  const [activeFirm, setActiveFirm] = useState(0);

  // Dynamically derive showcase firms from topFirms (first 3)
  const showcaseFirms = topFirms.length > 0
    ? topFirms.slice(0, 3).map((firm, i) => ({
        name: firm.name,
        rating: firm.rating,
        profit: firm.profitSplit || '80%',
        maxFunding: firm.maxFunding ? `$${firm.maxFunding / 1000}K` : '$100K',
        drawdown: firm.drawdown || '8%',
        logo: firm.logo,
        tag: firm.show_in_hero ? 'Featured' : i === 0 ? 'Top Choice' : i === 1 ? 'Highly Rated' : 'Popular',
        id: firm.id
      }))
    : [
        { name: 'Loading...', rating: 5.0, profit: '--', maxFunding: '--', drawdown: '--', logo: '', tag: 'Featured', id: 'loading' }
      ];

  // Live payout feed data
  const payoutFeed = [
    { trader: 'M.K.', amount: '$12,400', firm: 'FTMO', time: '2 min ago' },
    { trader: 'S.R.', amount: '$8,200', firm: 'Funding Pips', time: '5 min ago' },
    { trader: 'A.J.', amount: '$22,100', firm: 'The5ers', time: '8 min ago' },
    { trader: 'D.L.', amount: '$5,800', firm: 'E8 Markets', time: '12 min ago' },
  ];

  // Static logos for the infinite ticker - Premium prop firm logos
  const TICKER_LOGOS = [
    { name: 'Goat Funded Trader', logo: 'https://cdn.prod.website-files.com/67b3682cc0f1f956e16efe80/67b3682cc0f1f956e16efe99_Logo%20(76).avif' },
    { name: 'ATS Funded', logo: 'https://atsfunded.com/ats-logo.png' },
    { name: 'Blueberry Funded', logo: 'https://blueberryfunded.com/wp-content/themes/blueberryfunded-xmas/assets/img/logo.svg' },
    { name: 'Funding Pips', logo: 'https://media.propfirmmatch.com/system/b5filxasbwwrg110uhxvgv4v/675854fe6df8f98dc09b6caf_FundingPips-Logotype.svg' },
    { name: 'Alpha Capital', logo: 'https://alphacapitalgroup.uk/static/media/companyLogoInitials.879d8bbc8b528b1fd27761f4e43c34a0.svg' },
    { name: 'The5ers', logo: 'https://the5ers.com/images/menu/logo.svg' },
    { name: 'Funded Firm', logo: 'https://www.fundedfirm.com/_next/static/media/log.fa3e1c39.svg' },
    { name: 'FundedNext', logo: 'https://fundednext.com/_next/image?url=https%3A%2F%2Fdirslur24ie1a.cloudfront.net%2Ffundednext%2FFundednext%20logo_White%20(1).png&w=384&q=75' },
    { name: 'E8 Markets', logo: 'https://e8markets.com/images/logo/logo.svg' },
  ];

  // Duplicate logos for seamless infinite scroll
  const tickerFirms = [...TICKER_LOGOS, ...TICKER_LOGOS, ...TICKER_LOGOS];

  useEffect(() => {
    fetchTopFirms();
  }, []);

  useEffect(() => {
    const len = showcaseFirms.length;
    const interval = setInterval(() => {
      setActiveFirm((prev) => (prev + 1) % len);
    }, 3000);
    return () => clearInterval(interval);
  }, [topFirms.length]);

  const fetchTopFirms = async () => {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .order('show_in_hero', { ascending: false, nullsFirst: false })
        .order('rating', { ascending: false })
        .limit(12);

      if (error) throw error;

      if (data) {
        // Helper function to safely get favicon URL
        const getFaviconUrl = (websiteUrl: string | null | undefined, fallbackLogo: string | null) => {
          if (!websiteUrl) return fallbackLogo || 'https://placehold.co/400x400/181611/F6AE13?text=No+Logo';
          try {
            const hostname = new URL(websiteUrl).hostname;
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
          } catch {
            return fallbackLogo || 'https://placehold.co/400x400/181611/F6AE13?text=No+Logo';
          }
        };

        // Map DB fields to PropFirm type if necessary, or assume direct match
        // Ensure numbers are numbers, etc.
        const mappedFirms: PropFirm[] = data.map(f => ({
          ...f,
          rating: Number(f.rating) || 0,
          maxFunding: Number(f.max_funding) || 0,
          trustScore: Number(f.trust_score) || 95, // Default to 95 if column missing
          reviewCount: Number(f.review_count) || 0,
          profitSplit: f.profit_split || '',
          drawdown: f.drawdown || '',
          tags: f.tags || [],
          // Use Google Favicon Service for consistent high-quality logos
          logo: getFaviconUrl(f.website_url || f.website, f.logo_url),
          name: f.name,
          id: f.id,
          description: f.description || '',
          websiteUrl: f.website_url || f.website,
          affiliateLink: f.affiliate_link,
          promoCode: f.promo_code,
          discountValue: f.discount_value,
          platforms: f.platforms || [],
          paymentMethods: f.payment_methods || [],
          foundedYear: f.founded_year || new Date().getFullYear(),
          minDays: f.min_days || 0,
          maxDays: f.max_days || 0,
          dailyDrawdown: f.daily_drawdown || '',
          profitTarget: f.profit_target || '',
          leverage: f.leverage || '',
          commission: f.commission || '',
          newsTrading: f.news_trading || false,
          weekendHolding: f.weekend_holding || false,
          expertAdvisors: f.expert_advisors || false,
          refundPolicy: f.refund_policy || '',
          payoutFrequency: f.payout_frequency || '',
          trustPilotScore: f.trust_pilot_score ? Number(f.trust_pilot_score) : 0,
          twitterFollowers: f.twitter_followers ? Number(f.twitter_followers) : 0,
          discordMembers: f.discord_members ? Number(f.discord_members) : 0,
          supportEmail: f.support_email || '',
          challenges: [] // Not needed for card display
        }));

        setTopFirms(mappedFirms);
        // Ticker now uses static TICKER_LOGOS defined at component level
      }
    } catch (err) {
      console.error("Error fetching top firms for landing:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-x-hidden">

      {/* --- PREMIUM HERO SECTION (Rebuilt Bottom Cards Design) --- */}
      <section className="relative pt-24 pb-12 lg:pt-32 overflow-hidden min-h-[90vh] flex flex-col justify-start">
        {/* Background Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent"></div>
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-gold/10 rounded-[100%] blur-[120px] mix-blend-screen pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 mix-blend-overlay" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full text-center mt-6 lg:mt-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight mb-6 leading-[1.1] animate-fade-in-up">
            <span className="text-white block">Compare the Best </span>
            <span className="text-brand-gold font-extrabold tracking-tighter" style={{ textShadow: '0 4px 30px rgba(246,174,19,0.3)' }}>Prop Trading Firms of</span><br/>
            <span className="text-white font-black">2026</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-lg lg:text-xl text-neutral-400 mb-10 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Trusted platform to compare prop trading firms using verified data and insights,<br className="hidden md:block"/>including reviews, rules, and rankings.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-16 px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {[
              { icon: Shield, text: '50+ Verified Top Prop Firms' },
              { icon: BarChart3, text: '1000+ Challenges' },
              { icon: Users, text: '9000+ Real Trader Reviews' },
              { icon: Globe, text: '4M+ Monthly Website Views' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-white/10 hover:border-brand-gold/30 transition-colors">
                <stat.icon size={14} className="text-brand-gold shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold text-neutral-300 whitespace-nowrap">{stat.text}</span>
              </div>
            ))}
          </div>

          {/* BOTTOM CARDS CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up relative mx-auto max-w-5xl" style={{ animationDelay: '0.2s' }}>
            
            {/* Notification Toast (Absolute positioned on left) */}
            <div className="absolute -left-10 lg:-left-20 xl:-left-40 top-16 z-30 hidden xl:block pointer-events-none">
               {/* "Top Performers" */}
               <div className="mb-2 w-max bg-black/80 border border-brand-gold/30 rounded-full px-4 py-1.5 flex items-center gap-2 backdrop-blur-md shadow-lg pointer-events-auto">
                 <Star size={14} className="text-brand-gold fill-brand-gold" />
                 <span className="text-xs font-bold text-brand-gold tracking-wider uppercase">Top Performers</span>
               </div>
               <div className="bg-[#0f0e0c]/95 backdrop-blur-xl border border-brand-gold/30 rounded-2xl p-4 w-72 shadow-[0_15px_40px_-5px_rgba(246,174,19,0.25)] flex items-start gap-4 relative pointer-events-auto transition-transform hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 bg-[#0c0a1a] rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 p-1">
                    <img src="https://atsfunded.com/ats-logo.png" alt="ATS Funded" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-white text-sm leading-tight text-left">
                      A trader just received a <span className="text-green-400 font-bold">$104</span> payout from <span className="font-bold">ATS FUNDED</span> with a <span className="text-brand-gold font-bold">$100,000</span> account!
                    </p>
                  </div>
                  <button className="text-neutral-500 absolute top-2 right-2 hover:text-white transition-colors"><X size={14}/></button>
               </div>
            </div>

            {/* Exclusive Offers Card (colspan 7) */}
            <div className="lg:col-span-7 bg-[#110f0a] border border-brand-gold/15 rounded-2xl p-6 relative overflow-hidden group shadow-xl">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent pointer-events-none"></div>
               
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                 <div className="w-full flex-1 flex justify-center items-center">
                   <h3 className="text-white font-bold text-lg flex items-center gap-2">
                     Exclusive March Forex Offers <Flame size={18} className="text-[#f93a74] drop-shadow-[0_0_8px_rgba(249,58,116,0.6)]" />
                   </h3>
                 </div>
                 <div className="flex gap-1.5 self-end sm:self-auto shrink-0 absolute right-0">
                   <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 cursor-pointer transition-colors border border-white/5"><ChevronLeft size={14}/></div>
                   <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 cursor-pointer transition-colors border border-white/5"><ChevronRight size={14}/></div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 relative z-10">
                 {[ 
                   { name: 'Blueberry Funded', discount: '35% OFF', rating: '3.8', icon: 'https://blueberryfunded.com/wp-content/themes/blueberryfunded-xmas/assets/img/logo.svg' },
                   { name: 'Alpha Capital', discount: '15% OFF', rating: '4.4', icon: 'https://alphacapitalgroup.uk/static/media/companyLogoInitials.879d8bbc8b528b1fd27761f4e43c34a0.svg' },
                   { name: 'The5ers', discount: '5% OFF', rating: '4.8', icon: 'https://the5ers.com/wp-content/uploads/2021/08/The5ers-Logo.png' },
                   { name: 'BrightFunded', discount: '15% OFF', rating: '4.5', icon: 'https://app.brightfunded.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo_brightfunded_mark.881aade2.png&w=96&q=75' },
                   { name: 'FundedNext', discount: '7% OFF', rating: '4.4', icon: 'https://fundednext.com/_next/image?url=https%3A%2F%2Fdirslur24ie1a.cloudfront.net%2Ffundednext%2FFundednext%20logo_White%20(1).png&w=384&q=75' },
                   { name: 'ThinkCapital', discount: '20% OFF', rating: '4.2', icon: 'https://trader.thinkcapital.com/assets/images/think-capital-logo.svg' }
                 ].map((firm, i) => (
                   <div key={i} className="bg-[#0a0908] border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-brand-gold/30 hover:bg-[#0f0d0a] transition-all duration-300">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10 p-1 relative">
                          <img src={firm.icon} alt={firm.name} className="w-full h-full object-contain" />
                       </div>
                       <div className="text-left">
                         <h4 className="text-white text-[13px] font-bold tracking-tight">{firm.name}</h4>
                         <div className="flex items-center gap-1 mt-0.5">
                           <span className="text-brand-gold text-xs font-bold">{firm.rating}</span>
                           <div className="flex gap-[1px]">
                             {[1,2,3,4].map(s=><Star key={s} size={8} className="text-brand-gold fill-brand-gold"/>)}
                             <Star size={8} className="text-neutral-600 fill-neutral-600"/>
                           </div>
                         </div>
                       </div>
                     </div>
                     <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                        <span className="border border-white/10 text-white/90 text-[10px] font-bold px-2 py-[3px] rounded flex items-center gap-1 whitespace-nowrap bg-white/5">{firm.discount} <Gift size={10} className="text-brand-gold"/></span>
                        <span className="bg-gradient-to-r from-brand-gold to-yellow-400 text-black text-[10px] font-black px-2 py-[3px] rounded flex items-center gap-1 shadow-[0_2px_8px_-2px_rgba(246,174,19,0.5)] whitespace-nowrap">SPOT <Copy size={10} className="stroke-[2.5]"/></span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Popular Prop Firms (colspan 5) */}
            <div className="lg:col-span-5 bg-[#110f0a] border border-brand-gold/15 rounded-2xl p-6 flex flex-col h-full shadow-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-bl from-brand-gold/5 to-transparent pointer-events-none"></div>
               <div className="flex items-center justify-center mb-6 relative z-10 w-full">
                 <h3 className="text-white font-bold text-lg flex items-center gap-2">
                   Most Popular Futures Prop Firms <Trophy size={16} className="text-[#f65c13] drop-shadow-[0_0_8px_rgba(246,92,19,0.6)]" />
                 </h3>
               </div>
               
               <div className="flex-1 flex flex-col justify-between space-y-3 relative z-10 w-full">
                 {/* Map dynamic showcase firms! Use length to ensure 3 spots */}
                 {showcaseFirms.map((firm, i) => (
                   <div key={i} className="bg-[#0a0908] border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-brand-gold/30 hover:bg-[#0f0d0a] transition-all duration-300 relative overflow-hidden group w-full">
                     <div className="flex items-center gap-3 shrink">
                       <div className="w-8 flex items-center justify-center shrink-0">
                         {i === 0 ? <Trophy size={20} className="text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" /> :
                          i === 1 ? <Trophy size={20} className="text-[#cbd5e1] drop-shadow-[0_0_8px_rgba(203,213,225,0.6)]" /> :
                          i === 2 ? <Trophy size={20} className="text-[#b45309] drop-shadow-[0_0_8px_rgba(180,83,9,0.6)]" /> :
                          <span className="text-neutral-500 font-black text-xs">#{i + 1}</span>}
                       </div>
                       <div className="w-10 h-10 shrink-0 rounded-lg bg-black flex items-center justify-center border border-white/10 p-1">
                          {firm.logo ? <img src={firm.logo} alt={firm.name} className="w-full h-full object-contain" /> : <span className="text-white font-bold text-xs">{firm.name.charAt(0)}</span>}
                       </div>
                       <div className="text-left min-w-0">
                         <h4 className="text-white text-[13px] font-bold tracking-tight truncate pr-2">{firm.name}</h4>
                         <div className="flex items-center gap-1 mt-0.5">
                           <span className="text-brand-gold text-xs font-bold">{firm.rating.toFixed(1)}</span>
                           <div className="flex gap-[1px]">
                             {[1,2,3,4,5].map(s=><Star key={s} size={8} className={s <= Math.floor(firm.rating) ? "text-brand-gold fill-brand-gold" : "text-neutral-700 fill-neutral-700"}/>)}
                           </div>
                         </div>
                       </div>
                     </div>
                     <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                        <span className="border border-white/10 text-white/90 text-[10px] font-bold px-2 py-[3px] rounded flex items-center gap-1 whitespace-nowrap bg-white/5">10% OFF <Gift size={10} className="text-brand-gold"/></span>
                        <span className="bg-gradient-to-r from-brand-gold to-yellow-400 text-black text-[10px] font-black px-2 py-[3px] rounded flex items-center gap-1 shadow-[0_2px_8px_-2px_rgba(246,174,19,0.5)] whitespace-nowrap">SPOT <Copy size={10} className="stroke-[2.5]"/></span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>
          
          <div className="w-full max-w-5xl mx-auto flex justify-end mt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
             <Link to="/firms">
                <button className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors border border-white/5 bg-white/5 rounded-full px-5 py-2 hover:bg-white/10 hover:border-white/10 shadow-lg">
                   View All Firms <ArrowRight size={14} />
                </button>
             </Link>
          </div>
        </div>
      </section>

      {/* Top Rated Section */}
      <section className="py-28 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-black to-[#0a0908]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-gold/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-gold/[0.08] border border-brand-gold/20 rounded-full px-4 py-1.5 mb-5 backdrop-blur-sm">
                <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Top Performers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                Highest Rated <span className="text-gradient-gold">Firms</span>
              </h2>
              <p className="text-neutral-400 max-w-lg text-base leading-relaxed">Firms that have consistently delivered payouts and transparent trading conditions, vetted by our community.</p>
            </div>
            <Link to="/firms" className="shrink-0">
              <button className="group flex items-center gap-2 bg-white/[0.04] border border-white/10 px-6 py-3 rounded-xl text-white font-semibold text-sm hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all duration-300">
                View All Firms <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Firms Grid with Rankings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topFirms.map((firm, index) => (
              <div key={firm.id} className="relative group/rank">
                {/* Rank Badge */}
                <div className={`absolute -top-3 -left-2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-lg ${index === 0
                  ? 'bg-gradient-to-r from-brand-gold to-amber-400 text-black shadow-brand-gold/30'
                  : index === 1
                    ? 'bg-gradient-to-r from-neutral-300 to-neutral-400 text-black shadow-neutral-400/20'
                    : index === 2
                      ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-amber-700/20'
                      : 'bg-white/10 text-neutral-300 border border-white/10'
                  }`}>
                  {index === 0 && <span className="text-sm">👑</span>}
                  #{index + 1}
                </div>

                {/* Gold glow for #1 */}
                {index === 0 && (
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-brand-gold/30 via-brand-gold/10 to-transparent pointer-events-none z-10"></div>
                )}

                <FirmCard firm={firm} className={index === 0 ? 'ring-1 ring-brand-gold/20' : ''} />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-14 text-center">
            <Link to="/firms">
              <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/10 text-white font-bold rounded-2xl hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <span>Explore All Prop Firms</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="text-neutral-600 text-xs mt-4">Updated daily with verified data from 85+ prop trading firms</p>
          </div>
        </div>
      </section>



      {/* --- FEATURE BENTO GRID (PREMIUM V3) --- */}
      <section className="py-28 relative z-20 overflow-hidden">
        <style>{`
          @keyframes gauge-fill { from { stroke-dashoffset: 251; } }
          .bento-v3 { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
          .bento-v3:hover { transform: translateY(-6px); }
          @keyframes pulse-border { 0%, 100% { border-color: rgba(246,174,19,0.15); } 50% { border-color: rgba(246,174,19,0.4); } }
        `}</style>

        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-[#111010] to-[#0a0908]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent"></div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-brand-gold/[0.08] border border-brand-gold/20 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
              <Award className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Why We're Different</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
              Built for <span className="text-gradient-gold">Serious Traders</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Everything you need to find, compare, and get funded by the right prop firm &mdash; backed by real data.
            </p>
          </div>

          {/* ====== ROW 1: Hero Stat Banner (Full Width) ====== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { value: '85+', label: 'Firms Compared', icon: <TrendingUp className="w-5 h-5" /> },
              { value: '$42M+', label: 'Payouts Tracked', icon: <Shield className="w-5 h-5" /> },
              { value: '150K+', label: 'Active Traders', icon: <Users className="w-5 h-5" /> },
              { value: '50+', label: 'Data Points Per Firm', icon: <Cpu className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div key={i} className="bento-v3 group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 text-center hover:border-brand-gold/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mx-auto mb-3 group-hover:bg-brand-gold/20 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight group-hover:text-brand-gold transition-colors">{stat.value}</div>
                  <div className="text-neutral-500 text-xs uppercase tracking-wider font-bold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ====== ROW 2: Main Feature Cards (8+4 split) ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">

            {/* CARD: Deep Data Comparison (8 col — HERO CARD) */}
            <div className="bento-v3 lg:col-span-8 relative rounded-3xl overflow-hidden group">
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.1] via-white/[0.04] to-white/[0.02] group-hover:from-brand-gold/40 group-hover:via-brand-gold/15 group-hover:to-transparent transition-all duration-500"></div>
              <div className="absolute inset-[1px] rounded-3xl bg-[#0c0b09]"></div>
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-[1]"></div>
              <div className="relative z-[2] p-8 md:p-10 flex flex-col md:flex-row gap-8">
                {/* Text Side */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold border border-brand-gold/20 group-hover:bg-brand-gold group-hover:text-black transition-all duration-300 shadow-lg shadow-brand-gold/5">
                        <TrendingUp size={22} />
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-brand-gold/20 to-transparent"></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">Deep Data Comparison</h3>
                    <p className="text-neutral-400 text-base leading-relaxed mb-6">
                      Filter 50+ data points side-by-side. Drawdown rules, news trading, commissions, hidden fees &mdash; we read the fine print so you don't have to.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {['Side-by-Side', 'Real-time', 'Filterable', '85+ Firms'].map((tag, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-white/[0.03] border border-white/[0.08] text-neutral-300 px-3.5 py-1.5 rounded-lg hover:border-brand-gold/30 hover:text-brand-gold hover:bg-brand-gold/5 transition-all cursor-default">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Mini Comparison Table */}
                <div className="w-full md:w-[300px] flex-shrink-0 rounded-2xl overflow-hidden self-start">
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden group-hover:border-brand-gold/15 transition-colors">
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse shadow-sm shadow-brand-gold/50"></div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Live Comparison</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[9px] font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-md border border-brand-gold/20">FTMO</span>
                        <span className="text-[9px] font-bold text-neutral-500 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">Other</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3.5">
                      {[
                        { metric: 'Profit Split', a: '90%', b: '80%', pct: 90 },
                        { metric: 'Max Drawdown', a: '10%', b: '12%', pct: 83 },
                        { metric: 'Payout Speed', a: '24hr', b: '48hr', pct: 100 },
                        { metric: 'News Trading', a: '✓', b: '✗', pct: 100 },
                      ].map((row, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-neutral-500 font-medium">{row.metric}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-brand-gold">{row.a}</span>
                              <span className="text-neutral-600 text-[10px]">vs</span>
                              <span className="font-bold text-neutral-500">{row.b}</span>
                            </div>
                          </div>
                          <div className="w-full bg-white/[0.04] rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-brand-gold to-amber-400 h-1.5 rounded-full" style={{ width: `${row.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD: Exclusive Deals (4 col — Gold Border) */}
            <div className="bento-v3 lg:col-span-4 relative rounded-3xl overflow-hidden group" style={{ animation: 'pulse-border 4s ease-in-out infinite' }}>
              {/* Gold gradient border */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold via-amber-500 to-yellow-600"></div>
              <div className="absolute inset-[1px] bg-[#0d0b07] rounded-3xl"></div>
              <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-brand-gold/15 rounded-2xl flex items-center justify-center text-brand-gold border border-brand-gold/30 shadow-lg shadow-brand-gold/10">
                      <Zap size={22} />
                    </div>
                    <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">Exclusive</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Deal Flow</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                    Up to 20% off challenges + 125% refund offers you won't find anywhere else.
                  </p>
                </div>
                {/* Stacked Discount Badges */}
                <div className="space-y-2.5">
                  {[
                    { firm: 'FTMO', discount: '15% OFF', savings: '$45', hot: false },
                    { firm: 'Funding Pips', discount: '20% OFF', savings: '$80', hot: true },
                    { firm: 'The5ers', discount: '10% OFF', savings: '$30', hot: false },
                  ].map((deal, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all duration-300 ${deal.hot ? 'bg-brand-gold/10 border-brand-gold/30 shadow-sm shadow-brand-gold/10' : 'bg-white/[0.03] border-white/[0.06]'} group-hover:border-brand-gold/20`}>
                      <div>
                        <span className="font-bold text-white text-sm block">{deal.firm}</span>
                        <span className="text-[10px] text-neutral-500">Save {deal.savings}</span>
                      </div>
                      <span className={`text-xs font-black px-3 py-1.5 rounded-lg ${deal.hot ? 'bg-brand-gold text-black shadow-sm shadow-brand-gold/30' : 'bg-white/10 text-brand-gold'}`}>{deal.discount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ====== ROW 3: Bottom Feature Cards (5+7 split) ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* CARD: TrustGuard Score (5 col) */}
            <div className="bento-v3 lg:col-span-5 relative rounded-3xl overflow-hidden group">
              {/* Glassmorphic border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.1] via-white/[0.04] to-white/[0.02] group-hover:from-emerald-500/40 group-hover:via-emerald-500/15 group-hover:to-transparent transition-all duration-500"></div>
              <div className="absolute inset-[1px] rounded-3xl bg-[#0c0b09]"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-[1]"></div>
              <div className="relative z-[2] p-8 md:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-emerald-500/5">
                    <Shield size={22} />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">TrustGuard&trade; Score</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                  Proprietary algorithm that monitors payouts, reviews, and regulation compliance in real-time.
                </p>

                {/* Gauge + Legend */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gaugeGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="26" style={{ animation: 'gauge-fill 2s ease-out' }} />
                      <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white font-black text-2xl leading-none">9.2</span>
                      <span className="text-emerald-400 text-[8px] font-bold uppercase tracking-wider mt-0.5">Excellent</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Payout Verified', pct: 96 },
                      { label: 'Community Trust', pct: 92 },
                      { label: 'Regulation Score', pct: 88 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-400 font-medium">{item.label}</span>
                          <span className="text-emerald-400 font-bold">{item.pct}%</span>
                        </div>
                        <div className="w-full bg-white/[0.04] rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1.5 rounded-full" style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD: Trader Community (7 col) */}
            <div className="bento-v3 lg:col-span-7 relative rounded-3xl overflow-hidden group">
              {/* Glassmorphic border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.1] via-white/[0.04] to-white/[0.02] group-hover:from-violet-500/40 group-hover:via-violet-500/15 group-hover:to-transparent transition-all duration-500"></div>
              <div className="absolute inset-[1px] rounded-3xl bg-[#0c0b09]"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-[1]"></div>
              <div className="relative z-[2] p-8 md:p-10 flex flex-col md:flex-row gap-8">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400 border border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-violet-500/5">
                        <Users size={22} />
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-violet-500/20 to-transparent"></div>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Trader Community</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-5">
                      50,000+ funded traders sharing reviews, strategies, and verified payout proofs.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2.5">
                      {['bg-violet-500', 'bg-purple-600', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-violet-400'].map((bg, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-black flex items-center justify-center text-[9px] font-bold text-white shadow-lg`} style={{ zIndex: 50 - i * 10 }}>
                          {['JT', 'MK', 'AS', 'DL', 'RK'][i]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">50,000+</div>
                      <div className="text-neutral-500 text-[10px] uppercase tracking-wider font-semibold">Active Members</div>
                    </div>
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="w-full md:w-[260px] flex-shrink-0 bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden self-start">
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Live Feed</span>
                    </div>
                    <span className="text-[9px] text-neutral-600 font-medium">Just now</span>
                  </div>
                  <div className="p-3.5 space-y-3">
                    {[
                      { user: 'JT', action: 'verified a $12.4K payout from', firm: 'FTMO', color: 'text-brand-gold' },
                      { user: 'MK', action: 'left a 5-star review on', firm: 'Funding Pips', color: 'text-violet-400' },
                      { user: 'AS', action: 'saved $240 using discount at', firm: 'The5ers', color: 'text-emerald-400' },
                      { user: 'DL', action: 'compared 3 firms and chose', firm: 'E8 Markets', color: 'text-blue-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-violet-500/15 flex items-center justify-center text-[8px] font-bold text-violet-300 flex-shrink-0 mt-0.5 border border-violet-500/20">{item.user}</div>
                        <p className="text-neutral-500 text-[11px] leading-snug">
                          <span className="text-neutral-300 font-semibold">{item.user}</span> {item.action} <span className={`${item.color} font-semibold`}>{item.firm}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-[#0d0c0a] to-[#0a0908]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-brand-gold/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-gold/[0.08] border border-brand-gold/20 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
                <Terminal className="w-4 h-4 text-brand-gold" />
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Simple Process</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                How It <span className="text-gradient-gold">Works</span>
              </h2>
              <p className="text-neutral-400 max-w-lg text-base leading-relaxed">
                From comparison to funded trader in three simple steps. No guesswork, no hidden surprises.
              </p>
            </div>
            <Link to="/firms" className="shrink-0">
              <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-black font-bold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(246,174,19,0.2)]">
                Get Started Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Steps — Horizontal rows */}
          <div className="space-y-5">
            {[
              {
                step: '01',
                title: 'Compare Firms',
                desc: 'Filter and compare 85+ prop firms across 50+ data points including profit splits, drawdown rules, payout speed, commissions, and hidden fees — all in one powerful dashboard.',
                icon: <TrendingUp size={24} />,
                highlight: '85+ Firms',
                highlightSub: 'in our database',
              },
              {
                step: '02',
                title: 'Save with Discounts',
                desc: 'Access exclusive deals up to 20% off challenges and 125% refund offers. We negotiate directly with firms so you save hundreds on every purchase — money back in your pocket.',
                icon: <Zap size={24} />,
                highlight: 'Up to 20%',
                highlightSub: 'off challenges',
              },
              {
                step: '03',
                title: 'Get Funded',
                desc: 'Choose your firm with confidence using our TrustGuard™ algorithm and 50,000+ verified community reviews. Know exactly what you\'re getting before you commit a single dollar.',
                icon: <Shield size={24} />,
                highlight: '50K+',
                highlightSub: 'verified reviews',
              },
            ].map((item, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden">
                {/* Glassmorphic border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-white/[0.01] group-hover:from-brand-gold/25 group-hover:via-brand-gold/10 group-hover:to-transparent transition-all duration-500"></div>
                <div className="absolute inset-[1px] rounded-2xl bg-[#0c0b09]"></div>

                <div className="relative z-[2] p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
                  {/* Left: Number + Icon */}
                  <div className="flex items-center gap-5 md:w-[280px] shrink-0">
                    <div className="text-5xl md:text-6xl font-black text-white/[0.06] leading-none select-none group-hover:text-brand-gold/10 transition-colors">{item.step}</div>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-black transition-all duration-300 shadow-lg shadow-brand-gold/5">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-brand-gold transition-colors">{item.title}</h3>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Step {item.step}</div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Description */}
                  <p className="text-neutral-400 text-sm leading-relaxed flex-1 md:pt-1">{item.desc}</p>

                  {/* Right: Highlight Stat */}
                  <div className="md:w-[140px] shrink-0 text-right hidden md:block">
                    <div className="text-2xl font-black text-brand-gold">{item.highlight}</div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">{item.highlightSub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-black to-[#0a0908]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent"></div>
        <div className="absolute top-1/3 left-0 w-[500px] h-[400px] bg-brand-gold/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[300px] bg-violet-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-gold/[0.08] border border-brand-gold/20 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Trader Stories</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
              What Traders <span className="text-gradient-gold">Say</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Real traders, real results. Hear from our community of 50,000+ funded traders.
            </p>
          </div>

          {/* Featured Testimonial */}
          <div className="mb-5">
            <div className="group relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-gold/20 via-brand-gold/10 to-white/[0.02]"></div>
              <div className="absolute inset-[1px] rounded-2xl bg-[#0c0b09]"></div>
              <div className="relative z-[2] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex flex-col items-center md:items-start gap-4 md:w-[200px] shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-brand-gold flex items-center justify-center text-xl font-black text-black shadow-lg shadow-brand-gold/20">JT</div>
                  <div className="text-center md:text-left">
                    <div className="text-white font-bold text-lg">James T.</div>
                    <div className="text-neutral-500 text-sm">Funded Trader</div>
                    <div className="flex items-center gap-0.5 mt-2 justify-center md:justify-start">
                      {[1, 2, 3, 4, 5].map(s => (<Star key={s} className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />))}
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
                    <div className="text-emerald-400 font-black text-lg">$12,400</div>
                    <div className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-wider">Payout via FTMO</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-brand-gold/20 text-6xl font-serif leading-none mb-4">"</div>
                  <p className="text-neutral-200 text-lg md:text-xl leading-relaxed font-medium -mt-8">
                    PropMatchSpot saved me $380 on my FTMO challenge and helped me find a firm with same-day payouts. The comparison tool is a game-changer — I compared 12 firms in 5 minutes and found the perfect one for my trading style. The TrustGuard score gave me confidence I wasn't throwing money away. Every funded trader needs this platform.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="text-[11px] font-semibold bg-brand-gold/10 text-brand-gold px-3 py-1.5 rounded-lg border border-brand-gold/20">Saved $380</span>
                    <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">Same-day payout</span>
                    <span className="text-[11px] font-semibold bg-violet-500/10 text-violet-400 px-3 py-1.5 rounded-lg border border-violet-500/20">Compared 12 firms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two smaller testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {[
              {
                name: 'Sarah K.', role: 'Prop Trader',
                quote: "I was about to sign up with a firm that had terrible payout records — 3+ week delays and hidden conditions. The TrustGuard score warned me at 4.2/10 and I switched to a 9.2-rated firm instead. Best decision I ever made.",
                payout: '$8,200', firm: 'Funding Pips', avatar: 'SK', avatarColor: 'bg-violet-500',
                tag: 'Avoided scam firm', tagColor: 'bg-red-500/10 text-red-400 border-red-500/20',
              },
              {
                name: 'David R.', role: 'Full-time Trader',
                quote: "The exclusive discounts alone have saved me over $1,200 across three challenges. Plus the community reviews are incredibly detailed — real traders sharing payout proofs and honest experiences. Can't trade without it now.",
                payout: '$24,800', firm: 'The5ers', avatar: 'DR', avatarColor: 'bg-emerald-500',
                tag: 'Saved $1,200+', tagColor: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
              },
            ].map((item, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-white/[0.02] group-hover:from-brand-gold/25 group-hover:via-brand-gold/10 group-hover:to-transparent transition-all duration-500"></div>
                <div className="absolute inset-[1px] rounded-2xl bg-[#0c0b09]"></div>
                <div className="relative z-[2] p-7">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${item.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>{item.avatar}</div>
                      <div>
                        <div className="text-white font-bold text-sm">{item.name}</div>
                        <div className="text-neutral-500 text-xs">{item.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (<Star key={s} className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />))}
                    </div>
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-5">"{item.quote}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border ${item.tagColor}`}>{item.tag}</span>
                    <div className="text-right">
                      <div className="text-emerald-400 font-black text-sm">{item.payout}</div>
                      <div className="text-neutral-600 text-[10px] uppercase tracking-wider">via {item.firm}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badge Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (<Star key={s} className="w-5 h-5 text-brand-gold fill-brand-gold" />))}
              </div>
              <span className="text-white font-black text-xl ml-2">4.9</span>
              <span className="text-neutral-500 text-sm">/5</span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
            <div className="text-neutral-400 text-sm">Based on <span className="text-white font-bold">2,400+</span> verified trader reviews</div>
            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">TrustGuard™ Verified</span>
            </div>
          </div>
        </div>
      </section>
      {/* ====== PLATFORM COMPARISON ====== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-[#0d0c0a] to-[#0a0908]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[400px] bg-brand-gold/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-emerald-500/[0.015] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-gold/[0.08] border border-brand-gold/20 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
              <LineChart className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">The Difference</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">
              PropMatchSpot vs <span className="text-neutral-500">Going Solo</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Stop wasting hours researching. See why thousands of traders trust us over the old way.
            </p>
          </div>

          {/* Two-Column Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

            {/* LEFT: PropMatchSpot Card (Gold Highlighted) */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-gold/30 via-brand-gold/15 to-brand-gold/5"></div>
              <div className="absolute inset-[1px] rounded-2xl bg-[#0c0b09]"></div>
              <div className="relative z-[2]">
                {/* Card Header */}
                <div className="px-7 py-5 border-b border-brand-gold/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center shadow-lg shadow-brand-gold/20">
                      <CheckCircle2 className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-white font-black text-sm">PropMatchSpot</div>
                      <div className="text-brand-gold/60 text-[10px] font-bold uppercase tracking-wider">Recommended</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-black bg-brand-gold px-3 py-1 rounded-full uppercase tracking-wider">Free</span>
                </div>

                {/* Feature Rows */}
                <div className="p-5 space-y-0">
                  {[
                    { icon: <TrendingUp size={16} />, title: 'Firm Comparison', value: '85+ firms, side-by-side', desc: 'Filter by 50+ data points instantly' },
                    { icon: <Zap size={16} />, title: 'Exclusive Discounts', value: 'Up to 20% off', desc: 'Plus 125% refund offers' },
                    { icon: <Shield size={16} />, title: 'Trust Verification', value: 'TrustGuard™ algorithm', desc: 'Real-time payout & review monitoring' },
                    { icon: <Users size={16} />, title: 'Community Reviews', value: '50K+ verified traders', desc: 'Honest reviews & payout proofs' },
                    { icon: <Cpu size={16} />, title: 'Research Time', value: '5 minutes', desc: 'Everything in one dashboard' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-brand-gold/[0.03] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                        {row.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-white font-bold text-sm">{row.title}</span>
                          <span className="text-emerald-400 text-xs font-bold shrink-0">{row.value}</span>
                        </div>
                        <p className="text-neutral-500 text-xs">{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
                <div className="px-7 py-4 border-t border-brand-gold/10 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">✓ Save $200-400</span>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">✓ 5 min research</span>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">✓ Verified data</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Going Solo Card (Dim/Neutral) */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-white/[0.01]"></div>
              <div className="absolute inset-[1px] rounded-2xl bg-[#0c0b09]"></div>
              <div className="relative z-[2]">
                {/* Card Header */}
                <div className="px-7 py-5 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                      <span className="text-neutral-500 text-lg">🔍</span>
                    </div>
                    <div>
                      <div className="text-neutral-400 font-bold text-sm">Manual Research</div>
                      <div className="text-neutral-600 text-[10px] font-bold uppercase tracking-wider">The old way</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 bg-white/[0.04] px-3 py-1 rounded-full uppercase tracking-wider border border-white/[0.06]">Risky</span>
                </div>

                {/* Feature Rows */}
                <div className="p-5 space-y-0">
                  {[
                    { title: 'Firm Comparison', value: 'Visit each site individually', desc: 'No side-by-side, easy to miss details' },
                    { title: 'Discounts', value: 'No access', desc: 'Pay full price every time' },
                    { title: 'Trust Verification', value: 'Guesswork & hope', desc: 'No payout or review verification' },
                    { title: 'Community', value: 'Random forum posts', desc: 'Unverified, often biased reviews' },
                    { title: 'Research Time', value: '10+ hours', desc: 'Spread across dozens of sites' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400/60 flex-shrink-0 mt-0.5">
                        <span className="text-xs">✗</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-neutral-400 font-bold text-sm">{row.title}</span>
                          <span className="text-neutral-600 text-xs font-medium shrink-0">{row.value}</span>
                        </div>
                        <p className="text-neutral-600 text-xs">{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
                <div className="px-7 py-4 border-t border-white/[0.04] flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold bg-red-500/5 text-red-400/60 px-3 py-1.5 rounded-lg border border-red-500/10">✗ Full price</span>
                  <span className="text-[10px] font-bold bg-red-500/5 text-red-400/60 px-3 py-1.5 rounded-lg border border-red-500/10">✗ 10+ hours</span>
                  <span className="text-[10px] font-bold bg-red-500/5 text-red-400/60 px-3 py-1.5 rounded-lg border border-red-500/10">✗ Unverified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-gold/15 via-brand-gold/10 to-brand-gold/15"></div>
            <div className="absolute inset-[1px] rounded-2xl bg-[#0c0b09]"></div>
            <div className="relative z-[2] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Ready to trade smarter?</h3>
                <p className="text-neutral-400 text-sm">Join 50,000+ traders who found their perfect firm — in under 5 minutes.</p>
              </div>
              <Link to="/firms" className="shrink-0">
                <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-black font-bold rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(246,174,19,0.25)] hover:shadow-[0_4px_30px_rgba(246,174,19,0.4)]">
                  <span>Start Comparing Now — It's Free</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FAQ SECTION ====== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-[#0d0c0a] to-[#0a0908]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-brand-gold/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-gold/[0.08] border border-brand-gold/20 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
              <HelpCircle className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
              Frequently Asked <span className="text-gradient-gold">Questions</span>
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto text-base leading-relaxed">
              Got questions? We've got answers. Here's everything you need to know about PropMatchSpot.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Is PropMatchSpot really free?',
                a: 'Yes, 100% free — forever. We make money through affiliate partnerships with prop firms, which means you never pay a cent to use our comparison tools, reviews, or data. We also earn commissions from exclusive discount codes, which actually saves YOU money.',
              },
              {
                q: 'How does the TrustGuard™ score work?',
                a: 'TrustGuard™ is our proprietary algorithm that analyzes multiple factors including: verified payout records, payout speed consistency, community review sentiment, firm age and track record, rule transparency, and customer support quality. Scores are updated in real-time and range from 1-10.',
              },
              {
                q: 'Are the reviews on PropMatchSpot genuine?',
                a: 'Absolutely. Every review goes through our verification process. We require proof of purchase (challenge receipt) and prioritize reviews with payout screenshots. Fake reviews are detected by our AI system and removed. We have over 50,000 verified trader reviews.',
              },
              {
                q: 'How do I find the best prop firm for me?',
                a: 'Use our comparison tool to filter firms by what matters most to you — profit split, drawdown rules, payout speed, account size, challenge price, and more. You can compare up to 4 firms side-by-side. Our AI matching tool can also recommend firms based on your trading style and preferences.',
              },
              {
                q: 'Do the discount codes actually work?',
                a: 'Yes! We negotiate exclusive deals directly with prop firms. Our discounts range from 10-20% off challenge fees, and some firms offer 125% refund offers exclusively through PropMatchSpot. We verify every code regularly and remove expired ones immediately.',
              },
              {
                q: 'How often is the data updated?',
                a: 'Our core firm data (rules, pricing, profit splits) is verified weekly. TrustGuard™ scores update in real-time based on new reviews and payout reports. Discount codes are checked daily. If a firm changes its rules, we typically update within 24 hours.',
              },
              {
                q: 'Can I submit a firm to be listed?',
                a: 'Yes! If you know of a prop firm that isn\'t listed on PropMatchSpot, you can submit it through our contact page. Our team will verify the firm, collect data, and add it to the platform — usually within 1-2 weeks.',
              },
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="py-32 md:py-40 relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-black to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(246,174,19,0.08),transparent)]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent"></div>
        {/* Ambient glows */}
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-brand-gold/[0.03] rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[200px] bg-amber-500/[0.02] rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-gold/[0.08] border border-brand-gold/20 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-brand-gold" />
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Your Journey Starts Here</span>
          </div>

          {/* Heading */}
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Stop <span className="text-gradient-gold">Overpaying</span> for Challenges.
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Compare 85+ prop firms, access exclusive discounts, and find your perfect match — all in one place, completely free.
          </p>

          {/* Mini Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10">
            {[
              { val: '85+', label: 'Firms' },
              { val: '$42M+', label: 'Verified' },
              { val: '50K+', label: 'Traders' },
            ].map((stat, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-px h-5 bg-white/10 hidden sm:block"></div>}
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-lg">{stat.val}</span>
                  <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Link to="/firms">
              <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-black font-bold text-lg rounded-2xl transition-all duration-300 shadow-[0_4px_25px_rgba(246,174,19,0.3)] hover:shadow-[0_4px_40px_rgba(246,174,19,0.5)] hover:scale-[1.02]">
                <span>Start Comparing Free</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/offers">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-5 bg-transparent border border-white/10 hover:border-brand-gold/30 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:bg-white/[0.02]">
                <Bookmark size={18} className="text-brand-gold" />
                <span>View Exclusive Deals</span>
              </button>
            </Link>
          </div>

          {/* Trust message */}
          <div className="flex items-center justify-center gap-2 text-neutral-500 text-sm">
            <Shield className="w-4 h-4 text-emerald-400/60" />
            <span>No sign-up required · 100% free · Trusted by 50,000+ traders</span>
          </div>
        </div>
      </section>

      {/* Marquee Animation Style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
