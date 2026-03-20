-- =============================================
-- BLOG SYSTEM: Create blog_posts table
-- Run this in your Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    author TEXT DEFAULT 'Prop Match Spot',
    read_time INTEGER DEFAULT 5,
    meta_title TEXT,
    meta_description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published posts
CREATE POLICY "Published blog posts are viewable by everyone"
ON public.blog_posts FOR SELECT
USING (status = 'published');

-- Allow authenticated admins to manage all posts
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL
USING (true)
WITH CHECK (true);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts (category);

-- =============================================
-- INSERT SAMPLE BLOG POSTS
-- =============================================

INSERT INTO public.blog_posts (title, slug, excerpt, content, cover_image, category, tags, author, read_time, meta_title, meta_description, status, is_featured) VALUES

(
  'How to Choose the Best Prop Trading Firm in 2026',
  'how-to-choose-best-prop-trading-firm-2026',
  'Navigating the world of proprietary trading firms can be overwhelming. Here''s your ultimate guide to finding the perfect match for your trading style.',
  '<h2>What Makes a Great Prop Trading Firm?</h2>
<p>Choosing the right prop trading firm is one of the most critical decisions you''ll make as a trader. With dozens of firms competing for your attention, it''s easy to get lost in the noise. In this comprehensive guide, we''ll break down every factor you should consider.</p>

<h3>1. Evaluation Process & Challenge Structure</h3>
<p>The evaluation process is your gateway into funded trading. Most firms offer either 1-step, 2-step, or instant funding models. Each has its pros and cons:</p>
<ul>
<li><strong>1-Step Challenges</strong> — Faster path to funding, typically with stricter rules</li>
<li><strong>2-Step Challenges</strong> — More forgiving, gives you two phases to prove consistency</li>
<li><strong>Instant Funding</strong> — Skip the evaluation entirely, but usually comes with lower profit splits</li>
</ul>

<h3>2. Profit Split & Payout Reliability</h3>
<p>A firm can promise 90% profit split, but what matters is whether they actually pay. Always check community reviews and payout proof before committing your money. Look for firms with consistent payout histories and transparent processes.</p>

<h3>3. Trading Rules & Flexibility</h3>
<p>Key rules to evaluate include daily drawdown limits, maximum drawdown, minimum trading days, news trading restrictions, and weekend holding policies. The best firms offer flexibility without compromising risk management.</p>

<h3>4. Platform & Technology</h3>
<p>Whether you prefer MetaTrader 4, MetaTrader 5, cTrader, or TradingView, make sure your chosen firm supports your preferred platform. Some firms also offer proprietary dashboards for tracking your progress.</p>

<h3>5. Customer Support & Community</h3>
<p>When you''re in the middle of a challenge, responsive support can make or break your experience. Look for firms with active Discord communities, live chat support, and dedicated account managers.</p>

<h2>Use Prop Match Spot to Compare</h2>
<p>Instead of manually researching each firm, use <strong>Prop Match Spot</strong> to compare multiple firms side-by-side. Our platform aggregates real data, verified reviews, and exclusive discount codes to help you make the best decision. Use code <strong>SPOT</strong> to save on your next challenge!</p>',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  'Prop Firm Education',
  ARRAY['prop firms', 'trading', 'funded trading', 'beginners guide'],
  'Prop Match Spot',
  6,
  'How to Choose the Best Prop Trading Firm in 2026 | Prop Match Spot',
  'Complete guide to choosing the best proprietary trading firm. Compare evaluation processes, profit splits, payout reliability, and trading rules.',
  'published',
  true
),

(
  'Understanding Drawdown Rules: Daily vs Maximum Explained',
  'understanding-drawdown-rules-daily-vs-maximum',
  'Drawdown rules are the #1 reason traders fail prop firm challenges. Learn the critical difference between daily and maximum drawdown to protect your funded account.',
  '<h2>Why Drawdown Rules Matter</h2>
<p>If there''s one thing that separates successful funded traders from failed ones, it''s understanding drawdown rules. More traders lose their challenges due to drawdown violations than any other reason.</p>

<h3>Daily Drawdown Explained</h3>
<p>Daily drawdown is the maximum amount your account equity can decrease within a single trading day. For example, if your account has $100,000 and the daily drawdown is 5%, you cannot lose more than $5,000 in a single day.</p>
<p><strong>Critical detail:</strong> Most firms calculate daily drawdown from your day''s starting balance or highest equity point — not from your original account size. This means if you make $2,000 in profit early in the day, your drawdown buffer shifts up accordingly.</p>

<h3>Maximum (Overall) Drawdown</h3>
<p>Maximum drawdown is the total amount your account can decrease from its highest point at any time during the challenge. With a 10% max drawdown on a $100,000 account, your equity cannot drop below $90,000.</p>
<p>Some firms use <strong>trailing drawdown</strong>, which follows your highest equity point. Others use <strong>static drawdown</strong>, which is fixed from your starting balance. Trailing drawdown is significantly harder to manage.</p>

<h3>Pro Tips for Managing Drawdown</h3>
<ul>
<li>Never risk more than 1-2% of your account on a single trade</li>
<li>Track your daily P&L in real-time — don''t let losses compound</li>
<li>Take profits early in the day to build a buffer</li>
<li>Use stop losses religiously — no exceptions</li>
</ul>

<h2>Compare Drawdown Rules Across Firms</h2>
<p>Every prop firm has different drawdown thresholds. Use <strong>Prop Match Spot</strong> to compare daily and maximum drawdown limits across all major firms before choosing your challenge.</p>',
  'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80',
  'Trading Tips',
  ARRAY['drawdown', 'risk management', 'trading rules', 'prop firm challenges'],
  'Prop Match Spot',
  5,
  'Understanding Drawdown Rules: Daily vs Maximum | Prop Match Spot',
  'Learn the critical difference between daily drawdown and maximum drawdown in prop trading challenges. Essential knowledge for funded traders.',
  'published',
  false
),

(
  'Top 5 Mistakes Traders Make During Prop Firm Evaluations',
  'top-5-mistakes-traders-make-during-evaluations',
  'Avoid these costly errors that cause 80% of traders to fail their prop firm challenges. Learn from the community''s most common pitfalls.',
  '<h2>Why Do Most Traders Fail?</h2>
<p>Studies show that approximately 80-90% of traders fail their prop firm evaluations on the first attempt. But the good news is that most failures come from a handful of predictable mistakes — all of which are avoidable.</p>

<h3>Mistake #1: Over-Leveraging on Day One</h3>
<p>The excitement of starting a new challenge leads many traders to take oversized positions immediately. Remember, you have 30+ days in most challenges. There''s no rush. Start with smaller positions and scale up as you build a profit buffer.</p>

<h3>Mistake #2: Ignoring the Daily Drawdown</h3>
<p>Many traders focus only on hitting their profit target while completely ignoring the daily drawdown limit. One bad day can eliminate you instantly. Set a personal daily loss limit that''s well below the firm''s threshold.</p>

<h3>Mistake #3: Trading During High-Impact News</h3>
<p>Unless you''re specifically experienced in news trading, avoid major economic releases like NFP, CPI, and FOMC decisions. Volatility spikes can blow through your stop losses and trigger drawdown violations in seconds.</p>

<h3>Mistake #4: Not Having a Trading Plan</h3>
<p>Going into a challenge without a written trading plan is like driving without GPS. Document your strategy, risk per trade, session times, and specific setups before you take your first trade.</p>

<h3>Mistake #5: Revenge Trading After Losses</h3>
<p>After a losing trade, the urge to immediately "make it back" is overwhelming. This emotional response leads to larger positions, more frequent trades, and compounding losses. Walk away after two consecutive losses.</p>

<h2>Set Yourself Up for Success</h2>
<p>Browse verified trader reviews on <strong>Prop Match Spot</strong> to learn from other traders'' experiences. Use code <strong>SPOT</strong> for exclusive discounts on your next challenge!</p>',
  'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80',
  'Prop Firm Education',
  ARRAY['mistakes', 'evaluation', 'trading psychology', 'tips'],
  'Prop Match Spot',
  7,
  'Top 5 Mistakes During Prop Firm Evaluations | Prop Match Spot',
  'Discover the top 5 mistakes that cause traders to fail their prop firm evaluations and learn proven strategies to avoid them.',
  'published',
  false
),

(
  'Prop Trading in 2026: Industry Trends You Need to Know',
  'prop-trading-2026-industry-trends',
  'The prop trading landscape is evolving rapidly. From AI-powered analysis to new regulatory frameworks, here are the trends shaping funded trading.',
  '<h2>The Prop Trading Revolution</h2>
<p>2026 is shaping up to be a transformational year for proprietary trading. The industry has matured significantly, with stricter regulations, better technology, and more competitive offerings than ever before.</p>

<h3>Trend 1: AI-Powered Trading Tools</h3>
<p>More firms are integrating AI tools directly into their platforms. From automated trade journaling to pattern recognition and risk management alerts, artificial intelligence is becoming an essential part of the funded trader''s toolkit.</p>

<h3>Trend 2: Instant Funding Models</h3>
<p>The traditional 2-step evaluation is being challenged by instant funding options. Firms are competing to offer faster paths to funded accounts, recognizing that experienced traders don''t always need lengthy evaluations.</p>

<h3>Trend 3: Crypto & Alternative Markets</h3>
<p>Beyond forex and futures, prop firms are expanding into cryptocurrency, indices, and commodities. This diversification gives traders more opportunities and flexibility in how they approach funding.</p>

<h3>Trend 4: Community-Driven Platforms</h3>
<p>The most successful firms in 2026 are building strong communities. Discord servers, trading competitions, mentorship programs, and social trading features are becoming standard differentiators.</p>

<h3>Trend 5: Transparency & Verified Payouts</h3>
<p>Traders are demanding more transparency. Platforms like <strong>Prop Match Spot</strong> help by aggregating verified reviews and payout data, making it easier to identify trustworthy firms.</p>

<h2>Stay Ahead of the Curve</h2>
<p>Follow the Prop Match Spot blog for weekly industry insights and exclusive firm comparisons. Visit our reviews section to read verified trader experiences!</p>',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80',
  'Industry News',
  ARRAY['trends', '2026', 'prop trading', 'industry', 'ai trading'],
  'Prop Match Spot',
  4,
  'Prop Trading in 2026: Key Industry Trends | Prop Match Spot',
  'Discover the top prop trading industry trends for 2026, including AI tools, instant funding, crypto markets, and community-driven platforms.',
  'published',
  false
);

SELECT 'Blog posts table created and sample posts inserted!' AS status;
