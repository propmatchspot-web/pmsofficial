-- Run this block in the Supabase SQL Editor to generate random 4 and 5-star reviews for all your existing prop firms!

DO $$
DECLARE
    f_id UUID;
    u_id UUID;
    v_num_reviews INT;
    i INT;
    v_rating INT;
    v_comment TEXT;
    
    -- Array of positive realistic reviews
    review_comments TEXT[] := ARRAY[
        'Fantastic firm with great spreads and reliable payouts. Definitely one of the best.',
        'Customer support is top notch, highly recommended! They answered all my questions.',
        'Been trading with them for 6 months, zero issues with withdrawals. Fast processing too.',
        'Excellent trading conditions and tight spreads. I really love their custom dashboard.',
        'Good firm overall. The evaluation rules are very fair and straightforward.',
        'One of the best prop firms in the industry right now. Highly trustworthy.',
        'Slight slippage during high-impact news, but otherwise a pristine trading experience.',
        'Payouts are fast and the scaling plan is very attractive for consistent traders.',
        'Great platform. The challenge was straightforward, passed it in 2 weeks.',
        'Very transparent and trustworthy. I gladly recommend them to any serious trader.',
        'Spreads are decent, and they always pay out on time. 5 stars from me.',
        'The dashboard metrics and analytics are super helpful for tracking progress.',
        'Legit prop firm. No hidden rules, everything is exactly as stated on their site.',
        'I received my first payout via Deel within 24 hours. Incredible speed!',
        'Slightly strict drawdown rules but it makes you a much better and disciplined trader.'
    ];
BEGIN
    -- We need a reliable user_id to attach the reviews to. 
    -- This selects the first available user in your profiles table.
    -- (If you have multiple users, you can also ORDER BY random() to mix up the reviewer names)
    SELECT id INTO u_id FROM public.profiles LIMIT 1;
    
    IF u_id IS NULL THEN
        RAISE EXCEPTION 'No user found in the profiles table! Please create at least one account in your app first.';
    END IF;

    -- Loop through each firm currently in the database
    FOR f_id IN SELECT id FROM public.firms
    LOOP
        -- Generate a random number of reviews between 6 and 10 for this firm
        v_num_reviews := floor(random() * 5 + 6)::INT;
        
        FOR i IN 1..v_num_reviews
        LOOP
            -- To keep the rating strictly above 4.3, we'll mostly generate 5s (75% chance) and some 4s (25% chance)
            IF random() < 0.75 THEN
                v_rating := 5;
            ELSE
                v_rating := 4;
            END IF;
            
            -- Pick a random comment from our list
            v_comment := review_comments[floor(random() * array_length(review_comments, 1) + 1)::INT];
            
            -- Insert the dummy review
            -- We subtract a random number of days so the reviews look organic and spread out over the last 60 days
            INSERT INTO public.reviews (firm_id, user_id, rating, comment, status, created_at)
            VALUES (
                f_id, 
                (SELECT id FROM public.profiles ORDER BY random() LIMIT 1), -- Mix up the users if you have more than 1
                v_rating, 
                v_comment, 
                'approved', 
                NOW() - (random() * interval '60 days')
            );
        END LOOP;
    END LOOP;
END $$;
