import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Check, Loader2, HelpCircle, Info, Minus, Code2, Zap, BarChart2,
  Award, Layers, Video, GitCompare, Package, Image as ImageIcon, Target, Lock,
  PenLine, TrendingUp, Sparkles, Mail,
} from 'lucide-react';

// ─── enricher (logic unchanged — all original variable names preserved) ────────

const enrichPricingData = (plan) => {
  const lowerName = (plan.name || '').toLowerCase();
  let displayName = plan.name, price = '$0', buttonLabel = 'Get Started', isPro = false;
  let description = 'Perfect for getting started and trying out our AI engine.';
  let tagline = '';
  let features = ['Standard formatting', 'Basic support'];
  let extraCTA = null; // ✅ added (minimal change)

  if (lowerName.includes('free')) {
    displayName = 'Starter'; price = '$0'; buttonLabel = 'Start for free';

    tagline = 'Try the engine';
    description = 'Generate up to 5 fully scored engines. Every run includes LinkedIn, YouTube, Slides, Hooks, Research Brief, and a 5-dimension authority score. No iteration system.';

    features = [
      '5 authority engines / month',
      'LinkedIn post, YouTube script, Slides, Hooks',
      'Research brief & core thesis',
      'Authority score — 5 dimensions (Hook, Clarity, Authority, Retention, Originality)',
      'Grade benchmarking (A–F) on every output',
      'Style Examples — paste posts to guide AI voice',
      'GEO readiness scoring',
    ];

    // ✅ your CTA (clean, no JSX inside array)
    extraCTA = {
      text: 'Score your last post free →',
      link: '/score'
    };

  } else if (lowerName.includes('pro+') || lowerName.includes('pro_plus') || lowerName.includes('growth')) {
    displayName = 'Pro+'; price = '$99'; isPro = false;
    buttonLabel = 'Upgrade to Pro+';

    tagline = 'Scale authority';
    description = '100 high-performing authority posts per month with everything in Pro, plus advanced optimization, priority generation, and API access.';

    features = [
      '100 authority engines / month',
      'Everything in Pro — Voice DNA, DALL-E, iteration, coaching',
      'Priority AI routing on every generation',
      'Advanced AI coaching & dimension-level optimisation',
      'Priority generation — faster + stronger outputs',
      'LinkedIn Direct Publish — 1-click post to your profile',
      'Content Calendar — schedule posts with auto-publish',
      'API access — 50k tokens/month',
      'Early access to new features',
    ];

  } else if (lowerName.includes('pro')) {
    displayName = 'Pro'; price = '$39'; buttonLabel = 'Upgrade to Pro'; isPro = true;

    tagline = 'Build authority';
    description = '30 authority posts per month with full generation, scoring, and iteration. Two variants per run with best version auto-selected. Includes coaching and version history.';

    features = [
      '30 authority engines / month',
      'Batch generation — 2 variants per run, best auto-selected',
      'Comparative scoring — best angle auto-selected before you see it',
      'Version history, iteration engine & Best Version detection',
      'AI coaching per dimension — exact fix, not vague advice',
      '🧬 Voice DNA training — engines that sound like you, not AI',
      'Angle + dimension picker at 40+ plateau',
      'DALL-E 3 image generation for LinkedIn & YouTube',
      'Score History Trending — 30/60/90 day dimension charts',
      'Weekly authority digest email',
    ];

  } else if (lowerName.includes('enterprise') || plan.monthly_limit >= 1000) {
    displayName = 'Enterprise'; price = '$199'; buttonLabel = 'Get Enterprise';

    tagline = 'Scale systems';
    description = 'Run authority at scale with API access, team workflows, and high-volume generation. Built for agencies and professionals publishing consistently.';

    features = [
      'Unlimited authority engines',
      'Everything in Pro+ — Voice DNA, DALL-E, iteration, coaching',
      'Full API access — generate + score programmatically',
      'LinkedIn Direct Publish & Content Calendar',
      'Dedicated support channel',
      'Custom prompt configuration & niche settings',
      'Team workspace (coming soon)',
    ];
  }

  return {
    ...plan,
    displayName,
    price,
    buttonLabel,
    isPro,
    tagline,
    description,
    features,
    extraCTA, // ✅ added
    period: price === '$0' ? '' : '/month'
  };
};

// ─── full comparison matrix (15 rows, unchanged) ──────────────────────────────

const COMPARISON_ROWS = [
  { label: 'Engine generations / month', starter: '5', pro: '30', pro_plus: '100', enterprise: 'Unlimited' },
  { label: 'LinkedIn post', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'YouTube script (1,400+ words)', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'Slide deck outline', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'Video hooks & CTAs', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'Research brief & core thesis', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'Authority score (5 dims)', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'Version history & iteration', starter: false, pro: true, pro_plus: true, enterprise: true },
  { label: 'AI coaching per dimension', starter: false, pro: true, pro_plus: true, enterprise: true },
  { label: 'Batch generation (2 variants)', starter: false, pro: true, pro_plus: true, enterprise: true },
  { label: 'Comparative scoring (A vs B)', starter: false, pro: true, pro_plus: true, enterprise: true },
  { label: 'Best Version detection', starter: false, pro: true, pro_plus: true, enterprise: true },
  { label: 'Priority AI routing', starter: false, pro: false, pro_plus: true, enterprise: true },
  { label: 'API access', starter: false, pro: false, pro_plus: '50k tokens/mo', enterprise: 'Unlimited' },
  { label: 'GEO readiness scoring', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'Style Examples — basic voice matching', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: '🧬 Voice DNA — writing fingerprint training', starter: false, pro: true, pro_plus: true, enterprise: true },
  { label: 'DALL-E 3 image generation', starter: false, pro: true, pro_plus: true, enterprise: true },
  { label: 'Score History Trending (30/60/90d)', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'Weekly authority digest email', starter: true, pro: true, pro_plus: true, enterprise: true },
  { label: 'Angle + dimension picker (40+ plateau)', starter: false, pro: true, pro_plus: true, enterprise: true },
  { label: 'GEO citation tracking', starter: false, pro: false, pro_plus: 'Soon', enterprise: 'Soon' },
  { label: 'Dedicated support', starter: false, pro: false, pro_plus: false, enterprise: true },
  { label: 'Custom prompt configuration', starter: false, pro: false, pro_plus: false, enterprise: true },
  { label: 'Team workspace', starter: false, pro: false, pro_plus: false, enterprise: 'Soon' },
];

const CellValue = ({ value }) => {
  if (value === true) return <Check className="w-4 h-4 text-blue-600 mx-auto" strokeWidth={3} />;
  if (value === false) return <Minus className="w-4 h-4 text-gray-300 mx-auto" />;
  return <span className="text-xs font-semibold text-gray-700">{value}</span>;
};

// ─── 8-feature "what you get" mini table ─────────────────────────────────────
// Each row corresponds to one of the 8 feature cards from the homepage.

const FEATURE_ROWS = [
  {
    icon: <Award className="w-4 h-4 text-blue-600 shrink-0" />,
    label: 'Authority Scoring Radar (5D)',
    sub: 'Hook, Clarity, Authority Depth, Retention, Originality — scored 1–10',
    starter: true, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <Layers className="w-4 h-4 text-indigo-600 shrink-0" />,
    label: 'AI Coaching Insights',
    sub: 'Dimension-level coaching on what to improve in each iteration',
    starter: 'Basic', pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <Video className="w-4 h-4 text-violet-600 shrink-0" />,
    label: 'Multi-Format Engine',
    sub: 'LinkedIn, YouTube script, Slides, Hooks, Research, Report — per generation',
    starter: true, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <Zap className="w-4 h-4 text-teal-600 shrink-0" />,
    label: 'Batch Generation — Best of 2',
    sub: 'Two variants generated in parallel per run — higher-scoring angle auto-selected',
    starter: false, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <GitCompare className="w-4 h-4 text-emerald-600 shrink-0" />,
    label: 'Version Iteration & Comparison',
    sub: 'Score deltas per dimension, side-by-side radar, full version history',
    starter: false, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <Package className="w-4 h-4 text-orange-600 shrink-0" />,
    label: 'Authority Pack Export',
    sub: 'One-click bundle: linkedin_post.txt, youtube_script.txt, slides, hooks, score',
    starter: true, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <ImageIcon className="w-4 h-4 text-pink-600 shrink-0" />,
    label: 'Media Prompt Generation',
    sub: 'AI-crafted visual briefs for LinkedIn image, YouTube thumbnail, slide visual',
    starter: true, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <Target className="w-4 h-4 text-cyan-600 shrink-0" />,
    label: 'Niche & Audience Tailoring',
    sub: 'AI & Tech, Finance, Marketing, Education, Business, Creator Economy + Custom',
    starter: true, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <Code2 className="w-4 h-4 text-gray-600 shrink-0" />,
    label: 'API Access',
    sub: 'Call the generation + scoring engine from your own tools or CMS',
    starter: false, pro: false, pro_plus: '50k tokens/mo', enterprise: true,
  },
  {
    icon: <PenLine className="w-4 h-4 text-violet-600 shrink-0" />,
    label: '🧬 Voice DNA — Writing Fingerprint',
    sub: 'Paste past posts → AI extracts your vocabulary, rhythm, style → applied to every engine',
    starter: false, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <ImageIcon className="w-4 h-4 text-rose-500 shrink-0" />,
    label: 'DALL-E 3 Image Generation',
    sub: 'AI-generated LinkedIn and YouTube visuals from your content, in your style',
    starter: false, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />,
    label: 'Score History Trending',
    sub: 'Track Hook, Clarity, Authority, Retention, Originality across 30/60/90 days',
    starter: true, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <Mail className="w-4 h-4 text-indigo-500 shrink-0" />,
    label: 'Weekly Authority Digest',
    sub: 'Sunday email: your best engine, dimension highlight, streak, and growth nudge',
    starter: true, pro: true, pro_plus: true, enterprise: true,
  },
  {
    icon: <Zap className="w-4 h-4 text-violet-500 shrink-0" />,
    label: 'GEO Citation Tracking',
    sub: 'See how often AI assistants cite your content — Perplexity, ChatGPT, Gemini',
    starter: false, pro: false, pro_plus: 'Soon', enterprise: 'Soon',
  },
];

const MiniCellValue = ({ value }) => {
  if (value === true) return <Check className="w-3.5 h-3.5 text-blue-600 mx-auto" strokeWidth={3} />;
  if (value === false) return <Minus className="w-3.5 h-3.5 text-gray-300 mx-auto" />;
  return <span className="text-[10px] font-semibold text-blue-700">{value}</span>;
};

// ─── Why not ChatGPT conviction data ─────────────────────────────────────────
const CHATGPT_VS = [
  { problem: 'ChatGPT generates content', solution: 'Authority Studio scores it then improves your weakest dimension specifically', icon: 'DATA' },
  { problem: 'You guess if it is good', solution: 'You know exactly: Hook 7/10, Retention 6/10 — fix Retention first', icon: 'TARGET' },
  { problem: 'Every output sounds like AI', solution: 'Voice DNA trains your fingerprint — vocabulary, rhythm, signature moves applied to every engine', icon: 'DNA' },
  { problem: 'Every prompt starts from zero', solution: 'Your vault and authority profile make every generation smarter over time', icon: 'BRAIN' },
];

const FAQS = [
  {
    q: 'What counts as one generation?',
    a: 'One generation produces a complete authority content pack: LinkedIn post, YouTube script (1,400+ words), slide outline, hooks, CTAs, and a research brief — plus a 5-dimension authority score.'
  },
  {
    q: 'What is the authority score?',
    a: 'Each post is scored across 5 dimensions: Hook Strength, Clarity, Authority Depth, Retention, and Originality (max 50). Most first runs score 34–44. With iteration, reaching 45+ (Grade A) is typical.'
  },
  {
    q: 'How does iteration work?',
    a: 'On Pro and above, click Iterate on any engine. The system targets your weakest scoring dimension and generates a stronger version. When you have iterated 3+ times and your score reaches 40+, an angle picker appears so you can choose Contrarian, Story, Framework, Mistake, Trend, or Myth to break through with a different approach. Score delta shown per dimension. Best Version identified automatically.'
  },
  {
    q: 'What makes this different from ChatGPT or other AI tools?',
    a: 'ChatGPT gives you content. Authority Studio tells you if it is good and makes it better. Every output gets a 5-dimension score with coaching on exactly what to fix. The iteration engine generates a stronger version targeting your weakest dimension. ChatGPT does not know your hook scored 6/10. Authority Studio does. Try the free scorer at authoritystudioai.com/score to see the difference on your own content.'
  },
  {
    q: 'How many posts do I need per month?',
    a: 'Most professionals post 3–5 times per week. Pro (30 posts/month) supports consistent authority building. Pro+ (100/month) is designed for aggressive growth and experimentation.'
  },
  {
    q: 'What is Voice DNA and how does it work?',
    a: 'Voice DNA is a writing fingerprint trained from your past LinkedIn posts. Paste 3-10 of your best posts in the Voice Studio (dashboard → Voice Studio). The AI extracts your vocabulary, sentence rhythm, opinion density, formatting style, signature moves, and tone profile across 6 dimensions. From that point, every engine you generate applies this fingerprint at the highest prompt priority — so outputs sound like you, not generic AI. Voice DNA is exclusive to Pro and above. No competitor offers per-user voice training at this level.'
  },
  {
    q: 'What do I actually get in each post?',
    a: 'Every generation includes LinkedIn-ready content, YouTube script, slide outline, hooks, CTAs, and a research-backed angle — all aligned to build authority, not just engagement.'
  },
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes. You can upgrade or downgrade anytime. Your content, history, and scores are always preserved.'
  },
  {
    q: 'Is there annual pricing?',
    a: 'Yes — save about 20% with annual billing. Pro becomes $31/mo ($372/yr), Pro+ $79/mo ($948/yr), and Enterprise $159/mo ($1,908/yr). All billed as a single upfront payment. No trial on annual plans.'
  },
  {
    q: 'Do unused posts roll over?',
    a: 'No — monthly limits reset each billing cycle to keep the system simple and predictable.'
  },
  {
    q: 'What is GEO Readiness?',
    a: 'GEO (Generative Engine Optimisation) measures how likely your content is to be cited by AI systems like ChatGPT or Perplexity. Higher scores improve visibility in AI-driven search.'
  },
  {
    q: 'Is my content private?',
    a: 'Yes. Your inputs and generated content are private to your account. We do not use your data publicly or share it with other users.'
  },
  {
    q: 'Is this suitable for teams or agencies?',
    a: 'Yes. Enterprise includes API access, team workflows, and high-volume generation — ideal for agencies and teams managing multiple content streams.'
  },
  {
    q: 'Do you offer a free trial?',
    a: 'Yes — Starter includes 5 free posts. Pro also includes a limited trial so you can test scoring, iteration, and coaching before committing.'
  },
  {
    q: 'How can I improve my LinkedIn posts before publishing?',
    a: 'Use a scoring system before posting. Authority Studio evaluates your content across Hook, Clarity, Authority, Retention, and Originality, then shows exactly what to fix. Instead of guessing, you improve weak dimensions before publishing.'
  },
  {
    q: 'Why do my LinkedIn posts get low engagement?',
    a: 'Most posts fail due to weak hooks, low originality, or shallow authority. Even well-written content gets ignored if it does not stop scrolling or provide depth. Authority Studio identifies these gaps and improves them through iteration.'
  },
  {
    q: 'What is LinkedIn content scoring?',
    a: 'LinkedIn content scoring is a structured way to evaluate how strong a post is before publishing. Authority Studio scores content across five dimensions — Hook Strength, Clarity, Authority Depth, Retention, and Originality — to determine if it is likely to perform.'
  },
  {
    q: 'What makes a LinkedIn post high performing?',
    a: 'High-performing posts combine a strong hook, clear structure, original thinking, and meaningful authority. Authority Studio measures each of these dimensions and helps you improve weak areas before publishing.'
  },
  {
    q: 'How is Authority Studio different from AI writing tools?',
    a: 'Most AI tools generate content. Authority Studio evaluates and improves it. Every post is scored, weaknesses are identified, and iteration targets specific dimensions to create a stronger version.'
  },
  {
    q: 'Can AI improve thought leadership content?',
    a: 'AI can generate content, but improving thought leadership requires structure and evaluation. Authority Studio focuses on authority depth, originality, and clarity to strengthen expert-level content.'
  },
  {
    q: 'What is an authority score for content?',
    a: 'An authority score measures how strong and credible a piece of content is. Authority Studio calculates this using five dimensions and provides a score out of 50, helping you decide if your content is ready to publish.'
  },
  {
    q: 'How do I know if my content is good enough to post?',
    a: 'Instead of relying on intuition, use a scoring system. Authority Studio shows whether your content is strong enough and highlights what needs improvement before publishing.'
  },
  {
    q: 'Does improving content before publishing increase engagement?',
    a: 'Yes. Content that has stronger hooks, clearer messaging, and higher originality performs better. Authority Studio improves these factors before publishing, increasing the likelihood of engagement.'
  },
  {
    q: 'Is there a tool to evaluate LinkedIn posts before posting?',
    a: 'Yes. Authority Studio allows you to score your LinkedIn posts before publishing and provides targeted improvements based on your weakest dimensions.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'If you subscribe and are not satisfied, contact us within 7 days of your first charge and we’ll review your request.'
  }
];

// ─── component ────────────────────────────────────────────────────────────────

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [annual, setAnnual] = useState(false); // annual billing toggle — 20% savings
  const [hasUsedTrial, setHasUsedTrial] = useState(false); // true if user has ever had a trial

  // ── MERGED: plans fetch + trial check in one effect, one getSession call ─
  // Previously two separate useEffects. Plans fetch runs unconditionally.
  // Trial check runs in parallel only if a session exists — non-fatal if not.
  useEffect(() => {
    const loadPricingData = async () => {
      console.log('[PricingPage] Fetching plans from Supabase...');
      try {
        // plans fetch — always runs (public data)
        const plansPromise = supabase
          .from('plans')
          .select('id, name, monthly_limit, stripe_price_id, stripe_annual_price_id, is_default')
          .order('monthly_limit', { ascending: true });

        // trial check — runs in parallel, gated on session existence
        const trialPromise = supabase.auth.getSession().then(function (res) {
          var sess = res.data && res.data.session;
          if (!sess) return null;
          return supabase
            .from('user_profiles')
            .select('trial_end_date')
            .eq('user_id', sess.user.id)
            .single()
            .then(function (result) {
              if (result.data && result.data.trial_end_date) setHasUsedTrial(true);
            })
            .catch(function () { /* non-fatal */ });
        }).catch(function () { /* non-fatal */ });

        const [plansResult] = await Promise.all([plansPromise, trialPromise]);
        const { data, error } = plansResult;
        if (error) { console.error('[PricingPage] Supabase error:', error); throw error; }
        console.log('[PricingPage] Raw plans:', data);
        const enrichedPlans = (data || []).map(enrichPricingData);
        console.log('[PricingPage] Enriched plans:', enrichedPlans);
        setPlans(enrichedPlans);
      } catch (err) {
        console.error('[PricingPage] Fetch error:', err);
        setError('Failed to load pricing plans.');
      } finally {
        setLoading(false);
      }
    };
    loadPricingData();
  }, []);

  // ── Auto-trial trigger: fires when ?start_trial=1 is in the URL ──────────
  // New users arrive here from /signup?intent=trial → /pricing?start_trial=1.
  // Skipped entirely if user has already used their trial.
  // useRef pattern replaced with a flag on the effect dependency array — safe
  // because hasUsedTrial is stable after first load.
  useEffect(function () {
    var wantsAutoTrial = typeof window !== 'undefined' && window.location.search.indexOf('start_trial=1') !== -1;
    if (!wantsAutoTrial) return;
    if (loading) return;
    if (hasUsedTrial) {
      console.log('[PricingPage] Auto-trial skipped — user has already used their trial');
      return;
    }
    var proPlan = plans.find(function (p) { return p.isPro; });
    if (!proPlan) return;
    console.log('[PricingPage] Auto-triggering trial checkout for plan:', proPlan.id);
    handleAction(proPlan);
    // handleAction intentionally omitted from deps — stable async function, adding it causes double-fire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, plans, hasUsedTrial]);

  // handleAction — logic unchanged, all original console.log calls preserved
  const handleAction = async (plan) => {
    console.log('[PricingPage] Button clicked for plan:', plan);

    if (plan.price === '$0') {
      navigate('/dashboard');
      return;
    }

    try {
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const user = freshSession?.user;

      if (!freshSession) {
        toast({
          variant: 'destructive',
          title: 'Session expired',
          description: 'Please log in again.',
        });
        return;
      }

      if (!user) {
        console.error('[PricingPage] User not logged in');
        navigate('/login');
        return;
      }

      console.log('[PricingPage] Creating checkout session', {
        plan_id: plan.id,
        user_id: user.id,
      });

      const { data: response, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          headers: {
            Authorization: `Bearer ${freshSession.access_token}`,
          },
          body: {
            plan_id: plan.id,
            user_id: user.id,
            billing_period: annual ? 'annual' : 'monthly',
          },
        }
      );

      if (error) {
        console.error('[PricingPage] Checkout error:', error);
        return;
      }

      console.log('[PricingPage] Stripe checkout URL:', response?.url);

      if (response?.url) {
        window.location.href = response.url;
      } else {
        // No URL returned — log detail and show user-facing error so they know what happened
        console.error('[PricingPage] No checkout URL returned. Response:', response, 'Error:', error);
        toast({
          variant: 'destructive',
          title: 'Checkout unavailable',
          description: 'Could not open checkout. Please try again or contact support if this persists.',
        });
      }

    } catch (err) {
      console.error('[PricingPage] Fatal checkout error:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading plans…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-red-50 text-red-600 p-6 rounded-xl max-w-md text-center font-semibold border border-red-100">{error}</div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Pricing — Authority Studio AI | Generate, Score & Iterate LinkedIn Content</title>
        <meta name="description" content="Start free with 5 authority engines. Upgrade to Pro for batch generation, AI coaching, Voice DNA, and iteration. One engine = LinkedIn + YouTube + Slides + Hooks + Research + 5-dimension Authority Score." />
        <meta name="keywords" content="LinkedIn content pricing, thought leadership AI tool, authority score, content scoring, voice DNA, LinkedIn post generator" />
        <link rel="canonical" href="https://authoritystudioai.com/pricing" />
        <meta property="og:title" content="Pricing — Authority Studio AI" />
        <meta property="og:description" content="Start free. Score, iterate, and publish authority content that performs. Starter, Pro, Pro+, and Enterprise plans available." />
        <meta property="og:url" content="https://authoritystudioai.com/pricing" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 font-sans">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100 py-20 px-4 text-center">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Pricing</span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mt-3 mb-4">Build authority — start free</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Generation + scoring + iteration — from a single topic. Starter gets you in. Pro gives you the full loop: generate, score, improve, and identify your Best Version before you publish.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
            {['No credit card for Starter', annual ? 'Save 20% on annual plans' : '10 engines free · 7-day trial', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" strokeWidth={3} />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Annual billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-semibold transition-colors ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(a => !a)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${annual ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${annual ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
            Annual
            <span className="ml-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Save 20%</span>
          </span>
          {annual && (
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 ml-2 animate-none">
              Best value ✓
            </span>
          )}
        </div>

        {/* ── PROMOTION BANNER ─────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl mb-2">
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl px-5 py-4 shadow-md">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-snug">{annual ? 'Upgrade to Pro — Annual' : hasUsedTrial ? 'Upgrade to Pro' : 'Try Pro free for 7 days'}</p>
              <p className="text-blue-100 text-xs mt-0.5">{annual ? 'Annual billing — billed as $372/yr ($31/mo). No trial on annual plans.' : hasUsedTrial ? 'Full iteration engine, AI coaching, and batch scoring — from $39/mo.' : '10 engines free for 7 days. Score, iterate, find your Grade A. Then $39/mo.'}</p>
            </div>
            <button
              onClick={function () {
                supabase.auth.getSession().then(function (res) {
                  var sess = res.data && res.data.session;
                  if (sess) {
                    // Logged in — launch checkout directly.
                    // handleAction checks applyTrial on the backend so no client-side trial logic needed.
                    var proPlan = plans.find(function (p) { return p.isPro; });
                    if (proPlan) {
                      handleAction(proPlan);
                    } else {
                      navigate('/pricing');
                    }
                  } else {
                    // Not logged in — trial intent only if they haven't used one before.
                    // Backend will enforce it regardless, but this routes them correctly.
                    navigate(hasUsedTrial ? '/signup' : '/signup?intent=trial');
                  }
                }).catch(function () {
                  navigate('/signup?intent=trial');
                });
              }}
              className="shrink-0 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs px-4 py-2 rounded-xl transition-colors whitespace-nowrap shadow-sm"
            >
              {annual ? 'Upgrade to Pro' : hasUsedTrial ? 'Upgrade to Pro' : 'Start free trial'}
            </button>
          </div>
        </div>

        {/* ── PLAN CARDS ───────────────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={
                  'relative flex flex-col bg-white rounded-2xl border transition-all ' +
                  (plan.isPro ? 'border-blue-600 shadow-xl ring-1 ring-blue-600/20 md:scale-[1.03] z-10' :
                    plan.displayName === 'Pro+' ? 'border-violet-300 shadow-md ring-1 ring-violet-200/50' :
                      'border-gray-200 shadow-sm hover:shadow-md')
                }
              >
                {plan.isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}

                <div className="p-6 border-b border-gray-100">

                  {plan.tagline && (
                    <span className={
                      'inline-block text-[10px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full ' +
                      (plan.isPro ? 'bg-blue-100 text-blue-700' :
                        plan.displayName === 'Pro+' ? 'bg-violet-100 text-violet-700' :
                          plan.displayName === 'Enterprise' ? 'bg-gray-800 text-gray-200' :
                            'bg-gray-100 text-gray-500')
                    }>
                      {plan.tagline}
                    </span>
                  )}

                  <h2 className="text-lg font-bold text-gray-900 mb-1">{plan.displayName}</h2>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black text-gray-900">
                      {plan.price === '$0' ? '$0'
                        : annual
                          ? (plan.price === '$39' ? '$31' : plan.price === '$99' ? '$79' : plan.price === '$199' ? '$159' : plan.price)
                          : plan.price}
                    </span>

                    {plan.period && (
                      <span className="text-sm text-gray-400 font-medium">
                        {annual && plan.price !== '$0' ? '/mo · billed yearly' : plan.period}
                      </span>
                    )}

                    {annual && plan.price !== '$0' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full ml-1">
                        {plan.price === '$39' ? 'Save $96/yr' : plan.price === '$99' ? 'Save $240/yr' : 'Save $480/yr'}
                      </span>
                    )}
                  </div>

                  {annual && plan.price !== '$0' && (
                    <p className="text-[11px] text-gray-400 mb-2 -mt-2">
                      Billed as {plan.price === '$39' ? '$372' : plan.price === '$99' ? '$948' : '$1,908'} per year
                    </p>
                  )}

                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                    <BarChart2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-base font-black text-blue-700">
                      {plan.monthly_limit > 1000 ? '∞' : plan.monthly_limit}
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      authority posts / mo
                    </span>
                  </div>

                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <ul className="space-y-3 mb-4 flex-1">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" strokeWidth={3} />{f}
                      </li>
                    ))}
                  </ul>

                  {/* ✅ Smart CTA — only for free plan */}
                  {plan.extraCTA && (
                    <div className="mb-4">
                      <a
                        href={plan.extraCTA.link}
                        className="
        block w-full text-center
        text-sm font-bold
        text-blue-700
        bg-blue-50 hover:bg-blue-100
        border border-blue-200 hover:border-blue-300
        rounded-xl
        px-4 py-2.5
        transition-all
      "
                      >
                        {plan.extraCTA.text}
                      </a>
                    </div>
                  )}

                  {!plan.isPro && plan.price === '$0' && (
                    <p className="text-[11px] text-gray-400 mb-4 leading-snug border-t border-gray-100 pt-3">
                      Batch generation, version history, AI coaching & Best Version detection unlock on Pro.
                    </p>
                  )}

                  <Button
                    onClick={() => handleAction(plan)}
                    className={
                      'w-full font-bold py-5 rounded-xl text-sm transition-colors ' +
                      (plan.isPro ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        plan.displayName === 'Pro+' ? 'bg-violet-600 hover:bg-violet-700 text-white' :
                          'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50')
                    }
                  >
                    {plan.buttonLabel}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            {annual
              ? 'Save 20% on annual · Cancel anytime · No credit card for Starter'
              : '5 authority posts free · 7-day trial on Pro · Cancel anytime'}
          </p>

          <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
            {[
              { icon: '⚡', label: 'Instant setup' },
              { icon: '🔒', label: 'SSL encrypted' },
              { icon: '📊', label: 'Score every post' },
              { icon: '↩️', label: '5 posts free' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* NEW: WHAT YOU GET IN EVERY PLAN — 8-feature mini table    */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="bg-white border-y border-gray-100 py-14 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Feature breakdown</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-2 tracking-tight">What you get in every plan</h2>
              <p className="text-sm text-gray-500 max-w-lg mx-auto">Every Authority Engine capability — which plans include each feature.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* header row */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] sm:grid-cols-[1fr_72px_72px_80px_100px] gap-0 border-b border-gray-100 bg-gray-50/60">
                <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Feature</div>
                <div className="p-4 text-center text-xs font-bold text-gray-500">Starter</div>
                <div className="p-4 text-center text-xs font-bold text-blue-600 bg-blue-50/60">Pro</div>
                <div className="p-4 text-center text-xs font-bold text-violet-600 bg-violet-50/40">Pro+</div>
                <div className="p-4 text-center text-xs font-bold text-gray-500">Enterprise</div>
              </div>

              {FEATURE_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={'grid grid-cols-[1fr_auto_auto_auto_auto] sm:grid-cols-[1fr_72px_72px_80px_100px] gap-0 border-b border-gray-50 last:border-0 ' + (i % 2 === 1 ? 'bg-gray-50/30' : '')}
                >
                  {/* label cell */}
                  <div className="p-3.5 flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">{row.icon}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 leading-snug">{row.label}</p>
                      <p className="text-[10px] text-gray-400 leading-snug mt-0.5 hidden sm:block">{row.sub}</p>
                    </div>
                  </div>
                  {/* value cells */}
                  <div className="p-3.5 flex items-center justify-center"><MiniCellValue value={row.starter} /></div>
                  <div className="p-3.5 flex items-center justify-center bg-blue-50/20"><MiniCellValue value={row.pro} /></div>
                  <div className="p-3.5 flex items-center justify-center bg-violet-50/20"><MiniCellValue value={row.pro_plus !== undefined ? row.pro_plus : row.pro} /></div>
                  <div className="p-3.5 flex items-center justify-center"><MiniCellValue value={row.enterprise} /></div>
                </div>
              ))}
            </div>

            {/* legend */}
            <div className="flex items-center justify-center gap-5 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={3} />Included
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="text-gray-300 mx-auto opacity-50"><Minus className="w-3.5 h-3.5" /></span>Not included
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="text-[10px] font-bold text-blue-700">Basic</span>Limited version
              </div>
            </div>
          </div>
        </div>

        {/* ── ENGINE EXPLAINER ─────────────────────────────────────── */}
        <div className="bg-gray-50 border-b border-gray-100 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">What's inside one engine generation?</h2>
              <p className="text-sm text-gray-500">Every engine run produces all six formats simultaneously — generation + scoring in one pass.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: '💼', label: 'LinkedIn Post', sub: 'Hook, body blocks, bullets, CTA, hashtags' },
                { icon: '🎬', label: 'YouTube Script', sub: '1,400+ word narrative-arc script' },
                { icon: '📊', label: 'Slide Outline', sub: '6–7 slides, executive-ready' },
                { icon: '⚡', label: 'Video Hooks', sub: '4–5 hooks under 12 words each' },
                { icon: '📋', label: 'Research Brief', sub: 'Core thesis + research summary' },
                { icon: '🎯', label: 'Authority Score', sub: '5-dimension scoring out of 50' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{label}</div>
                    <div className="text-[11px] text-gray-500 leading-snug">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── VOICE DNA MOAT SECTION ──────────────────────────────── */}
        <div className="bg-gradient-to-br from-violet-950 via-indigo-950 to-gray-900 py-14 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-widest bg-violet-900/40 border border-violet-700/40 rounded-full px-3 py-1 mb-3">
                <span>🧬</span> Pro exclusive — no competitor has this
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-3 tracking-tight">Voice DNA — content that sounds like you, not AI</h2>
              <p className="text-violet-200 text-sm max-w-xl mx-auto leading-relaxed">
                Paste 3–10 of your best LinkedIn posts. Authority Studio extracts your writing fingerprint across 6 dimensions and injects it into every engine you generate — at the highest prompt priority. Your competitors use generic AI. You won't.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '📝', label: 'Vocabulary', desc: 'Your word choices, jargon level, and favourite phrases — preserved exactly' },
                { icon: '🎵', label: 'Sentence rhythm', desc: 'Sentence length patterns, use of fragments, pacing between paragraphs' },
                { icon: '💬', label: 'Opinion density', desc: 'How often you state positions vs. ask questions vs. present data' },
                { icon: '✏️', label: 'Formatting style', desc: 'Your bullet style, line breaks, emoji usage, hashtag density' },
                { icon: '🎯', label: 'Signature moves', desc: 'How you open posts, how you close, your recurring structural patterns' },
                { icon: '🎭', label: 'Tone profile', desc: 'Direct, warm, provocative, analytical — your natural personality in writing' },
              ].map(function (dim) {
                return (
                  <div key={dim.label} className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{dim.icon}</span>
                      <span className="text-xs font-bold text-white">{dim.label}</span>
                    </div>
                    <p className="text-[11px] text-violet-300 leading-snug">{dim.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-white/5 border border-violet-400/20 rounded-2xl px-6 py-4 text-center max-w-lg">
                <p className="text-sm text-violet-200 leading-relaxed">
                  <span className="font-bold text-white">How it works:</span> Open Voice Studio in your dashboard → paste past posts → click "Train my voice" → every engine you generate from that point sounds unmistakably like you.
                </p>
                <p className="text-xs text-violet-400 mt-2">Available on Pro and above · Settings → Voice Studio</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FULL COMPARISON TABLE ────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Full plan comparison</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* header */}
            <div className="grid grid-cols-5 text-center border-b border-gray-100">
              <div className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Feature</div>
              {[{ name: 'Starter', c: 'text-gray-700', bg: '' }, { name: 'Pro', c: 'text-blue-600', bg: 'bg-blue-50/50' }, { name: 'Pro+', c: 'text-violet-600', bg: 'bg-violet-50/50' }, { name: 'Enterprise', c: 'text-gray-700', bg: '' }].map(function (col) {
                return (<div key={col.name} className={'p-4 text-sm font-bold ' + col.c + ' ' + col.bg}>{col.name}</div>);
              })}
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.label} className={`grid grid-cols-5 text-center border-b border-gray-50 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                <div className="p-3.5 text-left text-xs font-medium text-gray-600">{row.label}</div>
                <div className="p-3.5 flex items-center justify-center"><CellValue value={row.starter} /></div>
                <div className="p-3.5 flex items-center justify-center bg-blue-50/20"><CellValue value={row.pro} /></div>
                <div className="p-3.5 flex items-center justify-center bg-violet-50/20"><CellValue value={row.pro_plus !== undefined ? row.pro_plus : row.pro} /></div>
                <div className="p-3.5 flex items-center justify-center"><CellValue value={row.enterprise} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ENTERPRISE API ───────────────────────────────────────── */}
        <div className="bg-gray-900 py-12 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Enterprise API Access</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-xl mx-auto">
              Enterprise customers get direct API access to the Authority Studio generation and scoring engine. Integrate into your CMS, client workflows, or internal tools.
            </p>
            <div className="bg-gray-800 rounded-xl p-4 text-left font-mono text-xs text-green-400 mb-6 max-w-md mx-auto overflow-x-auto">
              <span className="text-gray-500">POST </span>/functions/v1/generate-script<br />
              <span className="text-gray-500">{"{"}</span><br />
              {'  '}<span className="text-blue-400">"topic"</span>: <span className="text-amber-300">"AI in education"</span>,<br />
              {'  '}<span className="text-blue-400">"niche"</span>: <span className="text-amber-300">"Education"</span><br />
              <span className="text-gray-500">{"}"}</span>
            </div>
            <Button
              onClick={() => window.location.href = '/contact'}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-6 py-3 text-sm"
            >
              <Zap className="w-4 h-4 mr-2" />Contact sales for Enterprise
            </Button>
          </div>
        </div>

        {/* ── FAQs ─────────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl py-14">
          <div className="text-center mb-8">
            <HelpCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently asked questions</h2>
          </div>
          {/* Why not ChatGPT — conviction strip */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-5">Why not just use ChatGPT?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {CHATGPT_VS.map(function (item) {
                var emoji = item.icon === 'DATA' ? 'DATA' : item.icon === 'TARGET' ? 'TARGET' : 'BRAIN';
                var emojis = { DATA: '📊', TARGET: '🎯', DNA: '🧬', BRAIN: '🧠' };
                return (
                  <div key={item.icon} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-2xl">{emojis[emoji]}</span>
                    <p className="text-xs text-red-500 font-semibold line-through leading-snug">{item.problem}</p>
                    <p className="text-xs text-emerald-700 font-bold leading-snug">{item.solution}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <a href="/score" className="text-sm font-bold text-violet-600 hover:text-violet-800 transition-colors">
                Try the free scorer — paste any LinkedIn post, see your score in 10 seconds →
              </a>
            </div>
          </div>

<div className="space-y-2">
  {FAQS.map((faq, i) => (
    <details
      key={i}
      open={i === 0}
      className="bg-white rounded-xl border border-gray-200 shadow-sm group"
    >
      <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3">
        <span className="font-semibold text-sm text-gray-900">
          {faq.q}
        </span>

        <span className="text-gray-400 group-open:rotate-45 transition-transform text-base">
          +
        </span>
      </summary>

      <div className="px-4 pb-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {faq.a}
        </p>
      </div>
    </details>
  ))}
</div>
        </div>

      </div>
    </>
  );
};

export default PricingPage;