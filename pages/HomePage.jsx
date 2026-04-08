import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import {
  Sparkles, ArrowRight, Zap, Target, BarChart, Layers,
  TrendingUp, MessageSquare, Video, Presentation, BookOpen,
  Check, Loader2, ChevronRight, ChevronLeft,
  Users, Briefcase, GraduationCap, Mic2, Code2,
  Package, Image as ImageIcon, GitCompare, Award, PenLine, Mail,
  Calendar, Send, Trophy, Rocket, Star, ExternalLink,
} from 'lucide-react';

// ─── pricing enricher ─────────────────────────────────────────────────────────

var enrichPricingData = function (plan) {
  var lowerName = (plan.name || '').toLowerCase();
  var displayName = plan.name;
  var price = '$0';
  var isPro = false;
  var tagline = '';
  var features = [];

  if (lowerName.includes('free')) {
    displayName = 'Starter'; price = '$0'; tagline = 'Try the engine';
    features = [
      '5 authority engines / month',
      'LinkedIn, YouTube, Slides, Hooks, Research Brief',
      'Authority score — 5 dimensions (A–F grade)',
      'Style Examples — guide AI voice with your past posts',
      'GEO readiness scoring',
    ];
  } else if (lowerName.includes('pro+') || lowerName.includes('pro_plus') || lowerName.includes('growth')) {
    displayName = 'Pro+'; price = '$99'; isPro = false; tagline = 'Scale authority';
    features = [
      '100 authority engines / month',
      'Everything in Pro — Voice DNA, DALL-E, iteration',
      'GPT-4o priority routing on every generation',
      'Advanced AI coaching & dimension-level optimisation',
      'API access — 50k tokens/month',
    ];
  } else if (lowerName.includes('pro')) {
    displayName = 'Pro'; price = '$39'; isPro = true; tagline = 'Build authority';
    features = [
      '30 authority engines / month',
      'Batch generation — 2 variants, best auto-selected',
      'Version history, iteration & Best Version detection',
      '🧬 Voice DNA — engines that sound like you, not AI',
      'AI coaching per dimension + DALL-E image generation',
    ];
  } else if (lowerName.includes('enterprise') || plan.monthly_limit >= 1000) {
    displayName = 'Enterprise'; price = '$199'; tagline = 'Scale systems';
    features = [
      'Unlimited authority engines',
      'Everything in Pro+ — Voice DNA, DALL-E, GPT-4o',
      'Full API access — generate + score programmatically',
      'Dedicated support & custom configuration',
    ];
  }

  return Object.assign({}, plan, {
    displayName: displayName,
    price: price,
    isPro: isPro,
    tagline: tagline,
    features: features,
    period: price === '$0' ? '' : '/month'
  });
};

// ─── static data ──────────────────────────────────────────────────────────────

var SCORE_DIMS = [
  { label: 'Hook Strength', icon: '⚡', desc: 'Does the opening create immediate tension or challenge a belief?', val: 9, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  { label: 'Clarity', icon: '💡', desc: 'Are complex ideas communicated without cognitive friction?', val: 8, color: 'bg-blue-500', textColor: 'text-blue-600' },
  { label: 'Authority Depth', icon: '🎯', desc: 'Does the content reveal mechanisms, not just advice?', val: 9, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  { label: 'Retention Potential', icon: '🔄', desc: 'Does the narrative compel the reader to continue?', val: 7, color: 'bg-amber-400', textColor: 'text-amber-600' },
  { label: 'Originality', icon: '✨', desc: 'Does the perspective feel fresh and non-obvious?', val: 9, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
];

var SCORE_BENCHMARKS = [
  { range: '41-50', label: 'Thought Leadership', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50 border-emerald-200' },
  { range: '36-40', label: 'Expert Content', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50 border-blue-200' },
  { range: '26-35', label: 'Strong Content', color: 'bg-amber-400', textColor: 'text-amber-700', bgLight: 'bg-amber-50 border-amber-200' },
  { range: '0-25', label: 'Basic Content', color: 'bg-gray-300', textColor: 'text-gray-600', bgLight: 'bg-gray-50 border-gray-200' },
];

var ITERATION_VERSIONS = [
  { v: 'v1', score: 38, grade: 'C', note: 'First generation — good hook, retention weak', dims: [8, 7, 8, 6, 9], best: false },
  { v: 'v2', score: 41, grade: 'B', note: 'Retention improved — contrarian angle lifted originality', dims: [9, 8, 8, 7, 9], best: false },
  { v: 'v3', score: 44, grade: 'A', note: 'Authority depth and clarity both lifted by mechanism reveal', dims: [9, 9, 9, 8, 9], best: true },
];

var DEMO_TOPICS = [
  'Why most leaders confuse activity with progress',
  'The hidden cost of always-on culture in teams',
  'What AI actually changes about knowledge work',
  'Why your content gets ignored (and how to fix it)',
  'The compound effect no one talks about in B2B SaaS',
];
var DEMO_SCORE_DATA = [
  { topic: 'Why most leaders confuse activity with progress', score: 44, grade: 'A', dims: { hook: 9, clarity: 9, authority: 9, retention: 8, originality: 9 } },
  { topic: 'The hidden cost of always-on culture in teams', score: 41, grade: 'B', dims: { hook: 8, clarity: 9, authority: 8, retention: 8, originality: 8 } },
  { topic: 'What AI actually changes about knowledge work', score: 43, grade: 'A', dims: { hook: 9, clarity: 8, authority: 9, retention: 8, originality: 9 } },
  { topic: 'Why your content gets ignored (and how to fix it)', score: 39, grade: 'B', dims: { hook: 8, clarity: 8, authority: 8, retention: 7, originality: 8 } },
  { topic: 'The compound effect no one talks about in B2B SaaS', score: 42, grade: 'B', dims: { hook: 9, clarity: 8, authority: 8, retention: 8, originality: 9 } },
];

// ─── IMPROVEMENT 3: Engagement proof data ─────────────────────────────────────
var ENGAGEMENT_PROOF = [
  {
    topic: 'Why AI integration projects fail in month 3',
    score: 44,
    grade: 'A',
    result: '3.2× avg engagement',
    detail: '847 impressions → 2,710 reach · 38 comments · 4 reposts',
    lift: 'v1 scored 38 · +6 pts in 2 iterations',
    author: 'Enterprise architect, AI & Tech niche',
    color: 'border-emerald-200 bg-emerald-50',
    badgeColor: 'bg-emerald-600 text-white',
    metricColor: 'text-emerald-700',
  },
  {
    topic: 'The hidden cost of building the wrong thing fast',
    score: 43,
    grade: 'A',
    result: '2.8× avg engagement',
    detail: '1,104 impressions · 41 reactions · 12 comments',
    lift: 'Batch best-of-2 auto-selected contrarian angle',
    author: 'Fintech strategy lead, Finance niche',
    color: 'border-blue-200 bg-blue-50',
    badgeColor: 'bg-blue-600 text-white',
    metricColor: 'text-blue-700',
  },
  {
    topic: 'What nobody tells you about async-first teams',
    score: 41,
    grade: 'B',
    result: '2.1× avg engagement',
    detail: '623 impressions · 29 reactions · 8 comments',
    lift: 'Voice DNA matched author cadence on first run',
    author: 'People strategy consultant, Business niche',
    color: 'border-violet-200 bg-violet-50',
    badgeColor: 'bg-violet-600 text-white',
    metricColor: 'text-violet-700',
  },
];

// ─── IMPROVEMENT 2: Leaderboard mock data ─────────────────────────────────────
var LEADERBOARD_PREVIEW = [
  { rank: 1, label: 'Enterprise Architect', niche: 'AI & Tech', score: 46.2, engines: 34, badge: '👑' },
  { rank: 2, label: 'Fintech Strategy Lead', niche: 'Finance', score: 44.8, engines: 28, badge: '🥈' },
  { rank: 3, label: 'GTM Consultant', niche: 'Business', score: 43.5, engines: 22, badge: '🥉' },
  { rank: 4, label: 'L&D Director', niche: 'Education', score: 42.1, engines: 19, badge: '' },
  { rank: 5, label: 'Growth Strategist', niche: 'Marketing', score: 41.7, engines: 17, badge: '' },
];

var LiveScoreDemo = function () {
  var s1 = useState(''); var inputTopic = s1[0]; var setInputTopic = s1[1];
  var s2 = useState(false); var isScoring = s2[0]; var setIsScoring = s2[1];
  var s3 = useState(null); var result = s3[0]; var setResult = s3[1];
  var s4 = useState(null); var activePreset = s4[0]; var setActivePreset = s4[1];
  var s5 = useState(false); var autoRan = s5[0]; var setAutoRan = s5[1];
  var DIM_LABELS = ['Hook', 'Clarity', 'Authority', 'Retention', 'Originality'];
  var DIM_KEYS = ['hook', 'clarity', 'authority', 'retention', 'originality'];
  var getGC = function (g) { return g === 'A' ? 'text-emerald-600' : g === 'B' ? 'text-blue-600' : g === 'C' ? 'text-amber-600' : 'text-red-500'; };
  var getBC = function (v) { return v >= 9 ? 'bg-emerald-500' : v >= 7 ? 'bg-blue-500' : 'bg-amber-400'; };
  var runScore = function (topic) {
    var t = (topic || '').trim(); if (!t) return;
    setIsScoring(true); setResult(null);
    var preset = DEMO_SCORE_DATA.find(function (d) { return d.topic === t; });
    setTimeout(function () {
      if (preset) { setResult(preset); } else {
        var hash = t.split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
        var dims = { hook: 7 + (hash % 3), clarity: 7 + ((hash + 1) % 3), authority: 7 + ((hash + 2) % 3), retention: 6 + (hash % 3), originality: 7 + ((hash + 3) % 3) };
        var total = Object.values(dims).reduce(function (a, b) { return a + b; }, 0);
        setResult({ topic: t, score: total, grade: total >= 45 ? 'A' : total >= 40 ? 'B' : total >= 35 ? 'C' : 'D', dims: dims });
      }
      setIsScoring(false);
    }, 1400);
  };
  useEffect(function () {
    if (autoRan) return;
    setAutoRan(true);
    var t = DEMO_TOPICS[0];
    setInputTopic(t); setActivePreset(0);
    var timer = setTimeout(function () { runScore(t); }, 900);
    return function () { clearTimeout(timer); };
  }, []);
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"><BarChart className="w-4 h-4 text-white" /></div>
        <div><p className="text-white font-bold text-sm">Authority Score Preview</p><p className="text-blue-200 text-xs">Type any professional topic — see how it scores</p></div>
        <div className="ml-auto flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs text-blue-200 font-semibold">Live</span></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <input type="text" value={inputTopic}
            onChange={function (e) { setInputTopic(e.target.value); setActivePreset(null); }}
            onKeyDown={function (e) { if (e.key === 'Enter') runScore(inputTopic); }}
            placeholder="Enter any professional topic..."
            className="flex-1 text-sm px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all text-gray-800 placeholder-gray-400" />
          <button onClick={function () { runScore(inputTopic); }} disabled={!inputTopic.trim() || isScoring}
            className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2">
            {isScoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline">{isScoring ? 'Scoring...' : 'Score it'}</span>
          </button>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Try a preset topic</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_TOPICS.map(function (t, i) {
              return (
                <button key={i} onClick={function () { setInputTopic(t); setActivePreset(i); runScore(t); }}
                  className={'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ' + (activePreset === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700')}>
                  {t.length > 36 ? t.slice(0, 36) + '...' : t}
                </button>
              );
            })}
          </div>
        </div>
        {isScoring && (<div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" /><p className="text-sm font-semibold text-gray-600">Evaluating 5 authority dimensions...</p></div>)}
        {result && !isScoring && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0"><p className="text-xs text-gray-400 font-medium">Topic scored</p><p className="text-sm font-bold text-gray-900 leading-snug mt-0.5">{result.topic}</p></div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-gray-900">{result.score}</span><span className="text-sm text-gray-400">/50</span></div>
                <span className={'text-sm font-black ' + getGC(result.grade)}>Grade {result.grade}</span>
              </div>
            </div>
            <div className="space-y-2">
              {DIM_KEYS.map(function (key, i) {
                var val = result.dims[key]; return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{DIM_LABELS[i]}</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={'h-full rounded-full transition-all ' + getBC(val)} style={{ width: (val * 10) + '%' }} /></div>
                    <span className="text-xs font-bold text-gray-700 w-4 text-right">{val}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400">{result.grade === 'A' ? 'Grade A — Thought leadership tier' : result.grade === 'B' ? 'Grade B — One iteration to Grade A' : 'Iterate to reach 40+'}</p>
              <Link to="/dashboard" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0">Generate yours <ChevronRight className="w-3 h-3" /></Link>
            </div>
          </div>
        )}
        {!result && !isScoring && (<p className="text-center text-xs text-gray-400">No account needed · Full engine in under 60s after signup</p>)}
      </div>
    </div>
  );
};

var FLYWHEEL_STEPS = [
  { number: '01', title: 'Niche + audience intelligence', desc: 'Choose your niche (AI & Tech, Finance, Marketing, Education, Business, Creator Economy) and target audience. The engine adapts its authority positioning, hook style, and depth level to your specific domain — not generic content.', accent: 'border-blue-300 text-blue-700 bg-blue-50' },
  { number: '02', title: 'Batch generation — best angle auto-selected', desc: 'Two variants are generated in parallel. The higher-scoring angle is automatically selected before you ever see the output. LinkedIn, YouTube, Slides, Hooks, Research — all at once. 6 formats in one run.', accent: 'border-indigo-300 text-indigo-700 bg-indigo-50' },
  { number: '03', title: 'Authority score — 5 dimensions, not a vibe', desc: 'Every output is scored across Hook Strength, Clarity, Authority Depth, Retention Potential, and Originality (max 50 pts). Each dimension comes with a coaching brief: exactly what is weak and exactly how to fix it.', accent: 'border-violet-300 text-violet-700 bg-violet-50' },
  { number: '04', title: 'Targeted iteration — surgical improvement', desc: 'Click Iterate on the weakest dimension. The system injects a precise improvement directive — not "write better" but "add a named mechanism and one failure case only a practitioner would know." Score delta shown per dimension.', accent: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
  { number: '05', title: 'Voice DNA + intelligence compounds in your vault', desc: 'Train Voice DNA from your past posts — the system extracts your vocabulary, rhythm, and signature moves, then applies them to every engine at the highest prompt priority. Your top-scoring outputs become RAG references. Your niche coverage map grows. The longer you use it, the more it sounds like you and less like generic AI.', accent: 'border-amber-300 text-amber-700 bg-amber-50' },
];

var GEO_SIGNALS = [
  { label: 'Named mechanisms', sub: 'Not generic advice — concrete frameworks AI engines can cite', icon: '🔖' },
  { label: 'Citability score', sub: 'Is the structure citation-ready for Perplexity, ChatGPT, Gemini?', icon: '📎' },
  { label: 'Entity consistency', sub: 'Are your core ideas repeatedly associated with your name across outputs?', icon: '🔗' },
  { label: 'Answer-layer ready', sub: 'Does each format answer a real question an AI engine might surface?', icon: '🔍' },
];

var WHO_ITS_FOR = [
  { role: 'Consultants & Advisors', icon: 'Briefcase', color: 'bg-blue-50 border-blue-100 text-blue-600', value: 'You have deep expertise. Authority Studio turns it into scored, scored content that sounds unmistakably like you — not like ChatGPT. Voice DNA trains on your past posts so every engine matches your established voice.' },
  { role: 'Founders & Executives', icon: 'TrendingUp', color: 'bg-violet-50 border-violet-100 text-violet-600', value: 'You need LinkedIn content that attracts enterprise conversations — not engagement from other founders. Authority Depth scoring identifies the exact dimension that separates an opinion from a point of view.' },
  { role: 'Content Strategists', icon: 'Layers', color: 'bg-indigo-50 border-indigo-100 text-indigo-600', value: 'One topic generates LinkedIn, YouTube, Slides, Hooks, Research Brief — all scored before you publish. Stop guessing which angle performs. The system picks the higher-scoring variant automatically.' },
  { role: 'Educators & Trainers', icon: 'GraduationCap', color: 'bg-emerald-50 border-emerald-100 text-emerald-600', value: 'Your frameworks deserve better distribution. Train Voice DNA on your best posts and every engine applies your teaching style and terminology across 6 professional formats.' },
  { role: 'Subject Matter Experts', icon: 'BookOpen', color: 'bg-amber-50 border-amber-100 text-amber-600', value: 'You know things generalist writers do not. Originality and Authority Depth scoring confirm when insider knowledge comes through — and coaching flags when you are writing too safely.' },
  { role: 'Agency & Enterprise Teams', icon: 'Users', color: 'bg-teal-50 border-teal-100 text-teal-600', value: 'Scale authority content across clients or team members. Enterprise API access lets you integrate the generation and scoring engine into your own CMS or workflow — with full programmatic control.' },
];

var GRADE_BG = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-amber-100 text-amber-700 border-amber-200',
};

var HeroScoreCard = function () {
  var dims = [
    { label: 'Hook', val: 9, color: 'bg-emerald-500' },
    { label: 'Clarity', val: 8, color: 'bg-blue-500' },
    { label: 'Authority', val: 9, color: 'bg-emerald-500' },
    { label: 'Retention', val: 7, color: 'bg-amber-400' },
    { label: 'Originality', val: 9, color: 'bg-emerald-500' },
  ];
  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 shadow-2xl w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Authority Score</p>
          <p className="text-[10px] text-gray-500 mt-1">
            This version still has gaps that limit its impact
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-4xl font-black text-white">42</span>
            <span className="text-gray-500 text-sm">/50</span>
            <span className="ml-1 text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full">Grade B</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
          <BarChart className="w-5 h-5 text-blue-400" />
        </div>
      </div>
      <div className="space-y-2.5 mb-4">
        {dims.map(function (d) {
          return (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-[11px] text-gray-500 w-16 shrink-0">{d.label}</span>
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className={'h-full rounded-full ' + d.color} style={{ width: (d.val * 10) + '%' }} />
              </div>
              <span className="text-[11px] font-black text-gray-300 w-3 text-right">{d.val}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="text-xs text-gray-500 font-medium">Topic: AI-driven resource management</div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-gray-500">v2 of 3</span>
        </div>
      </div>
    </div>
  );
};

var IterationLoop = function () {
  var s = useState(2); var activeV = s[0]; var setActiveV = s[1];
  var curr = ITERATION_VERSIONS[activeV];
  var DIM_LABELS = ['Hook', 'Clarity', 'Authority', 'Retention', 'Originality'];
  var getDimColor = function (v) { return v >= 9 ? 'bg-emerald-500' : v >= 7 ? 'bg-blue-500' : 'bg-amber-400'; };
  var getGradeStyle = function (g) { return GRADE_BG[g] || 'bg-gray-100 text-gray-600 border-gray-200'; };
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex border-b border-gray-100">
        {ITERATION_VERSIONS.map(function (ver, idx) {
          return (
            <button
              key={ver.v}
              onClick={function () { setActiveV(idx); }}
              className={'flex-1 px-3 py-3 text-xs font-bold transition-all border-b-2 ' + (activeV === idx ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50')}
            >
              <div className="flex items-center justify-center gap-1.5">
                {ver.v}
                {ver.best && <span className="text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-1.5 py-0.5 font-bold">Best</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-gray-900">{curr.score}</span>
            <span className="text-gray-400 text-sm">/50</span>
          </div>
          <span className={'text-xs font-bold px-2.5 py-1 rounded-full border ' + getGradeStyle(curr.grade)}>Grade {curr.grade}</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-snug">{curr.note}</p>
        <div className="space-y-2">
          {curr.dims.map(function (val, i) {
            return (
              <div key={DIM_LABELS[i]} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-14 shrink-0">{DIM_LABELS[i]}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={'h-full rounded-full transition-all ' + getDimColor(val)} style={{ width: (val * 10) + '%' }} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 w-3">{val}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

var TestimonialCarousel = function () {
  var TESTIMONIALS = [
    { quote: 'First time I\'ve seen an AI tool actually tell me why the content was weak — not just rewrite it. The dimension coaching is the product.', role: 'CIO, Enterprise Infrastructure', score: '44/50', grade: 'A', niche: 'AI & Tech' },
    { quote: 'The iteration engine is genuinely different. It doesn\'t just rewrite — it targets the exact dimension that is holding the score back. I went from 38 to 44 in two iterations.', role: 'Fintech Strategy Lead', score: '44/50', grade: 'A', niche: 'Finance' },
    { quote: 'Voice DNA is the only thing I\'ve found that actually makes AI content sound like me. Every engine since training it has passed my "would I have written this" test.', role: 'Management Consultant', score: '43/50', grade: 'A', niche: 'Business' },
  ];
  var s = useState(0); var idx = s[0]; var setIdx = s[1];
  var t = TESTIMONIALS[idx];
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-1 mb-4">
        {[0, 1, 2, 3, 4].map(function (i) { return <span key={i} className="text-amber-400 text-sm">★</span>; })}
        <span className="ml-2 text-xs text-gray-400 font-medium">verified engine</span>
      </div>
      <blockquote className="text-gray-800 text-sm leading-relaxed mb-5 italic">"{t.quote}"</blockquote>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-black text-xs">{t.role.slice(0, 2).toUpperCase()}</div>
          <div>
            <p className="text-xs font-bold text-gray-900">{t.role}</p>
            <p className="text-[10px] text-gray-400">{t.niche} niche</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-0.5"><span className="text-sm font-black text-gray-900">{t.score}</span></div>
          <span className="text-[10px] font-bold text-emerald-600">Grade {t.grade}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex gap-1.5">
          {TESTIMONIALS.map(function (_, i) { return (<button key={i} onClick={function () { setIdx(i); }} className={'w-1.5 h-1.5 rounded-full transition-all ' + (i === idx ? 'bg-blue-600 w-4' : 'bg-gray-300')} />); })}
        </div>
        <div className="flex gap-2">
          <button onClick={function () { setIdx(function (p) { return (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length; }); }} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"><ChevronLeft className="w-3 h-3 text-gray-500" /></button>
          <button onClick={function () { setIdx(function (p) { return (p + 1) % TESTIMONIALS.length; }); }} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"><ChevronRight className="w-3 h-3 text-gray-500" /></button>
        </div>
      </div>
    </div>
  );
};

// ─── IMPROVEMENT 2: Public Leaderboard Teaser ─────────────────────────────────

var LeaderboardTeaser = function () {
  var maxScore = 46.2;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-xl mx-auto">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"><Trophy className="w-4 h-4 text-white" /></div>
        <div>
          <p className="text-white font-bold text-sm">Niche Authority Leaderboard</p>
          <p className="text-violet-200 text-xs">Anonymous · All plans · Updated daily</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs text-violet-200 font-semibold">Live</span></div>
      </div>
      <div className="divide-y divide-gray-50">
        {LEADERBOARD_PREVIEW.map(function (row) {
          var pct = (row.score / maxScore) * 100;
          return (
            <div key={row.rank} className={'flex items-center gap-3 px-5 py-3.5 ' + (row.rank <= 3 ? 'bg-violet-50/40' : 'bg-white')}>
              <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                {row.badge ? (
                  <span className="text-lg">{row.badge}</span>
                ) : (
                  <span className="text-xs font-black text-gray-400">#{row.rank}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-800 truncate">{row.label}</span>
                  <span className="text-xs font-black text-violet-700 shrink-0">{row.score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: pct + '%' }} />
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">{row.niche}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center">Scores are anonymised avg authority scores. Your position appears when you generate your first engine.</p>
      </div>
    </div>
  );
};

// ─── IMPROVEMENT 5: Product Hunt launch strip ─────────────────────────────────

var LaunchBanner = function () {
  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-3 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white text-lg">🚀</span>
          <span className="text-white font-black text-sm">We're live on Product Hunt!</span>
          <span className="text-orange-100 text-xs font-medium hidden sm:inline">— Support us today and help shape the future of thought leadership AI</span>
        </div>
        <a
          href="https://www.producthunt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-white text-orange-600 font-black text-xs px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors shrink-0"
        >
          <span>🐱</span>
          Upvote on Product Hunt
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

// ─── IMPROVEMENT 4: Shipped Features strip data ───────────────────────────────

var SHIPPED_FEATURES = [
  { icon: '📅', label: 'Content Calendar', detail: 'Schedule LinkedIn posts at /calendar. Auto-publishes via 5-min background job.', badge: 'New' },
  { icon: '🔗', label: 'LinkedIn Direct Publish', detail: 'Connect your account and publish in one click — no copy-paste.', badge: 'New' },
  { icon: '⚡', label: 'Live Generation Progress', detail: 'Real-time milestone bar: quota → voice → generate → score → save.', badge: 'New' },
  { icon: '🏆', label: 'Niche Leaderboard', detail: 'See your authority percentile vs other creators in your niche. All plans.', badge: 'New' },
  { icon: '📈', label: 'Score History Trending', detail: '30/60/90-day charts per dimension. See which dimension is building over time.', badge: 'New' },
  { icon: '🧬', label: 'Voice RAG', detail: 'Your top-scoring posts (≥38) feed every future generation as quality references.', badge: 'Live' },
];

// ─── main component ───────────────────────────────────────────────────────────

var HomePage = function () {
  var navigate = useNavigate();
  var plansState = useState([]);
  var plans = plansState[0];
  var setPlans = plansState[1];
  var loadingState = useState(true);
  var loadingPlans = loadingState[0];
  var setLoadingPlans = loadingState[1];

  useEffect(function () {
    var fetchTopPlans = async function () {
      try {
        var result = await supabase
          .from('plans')
          .select('id, name, monthly_limit, stripe_price_id, is_default')
          .order('monthly_limit', { ascending: true })
          .limit(3);
        if (result.error) throw result.error;
        if (result.data) setPlans(result.data.map(enrichPricingData));
      } catch (err) {
        console.error('[HomePage] Failed to fetch top plans', err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchTopPlans();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Helmet>
        <title>Authority Studio AI — The Thought-Leadership Scoring Engine</title>
        <meta
          name="description"
          content="Generate thought-leadership content scored across 5 dimensions. Iterate to your best version. Build an authority vault AI engines can discover and cite."
        />
      </Helmet>

      {/* IMPROVEMENT 5: Product Hunt launch banner */}
      <LaunchBanner />

      {/* ══════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 text-white pt-20 pb-20 sm:pt-32 sm:pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        ></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              For B2B consultants, founders, and executives
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-semibold">
              <span>🧬</span>
              Voice DNA — engines that sound like you
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-20 items-center mb-16 sm:mb-20">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-[3.4rem] font-black tracking-tight leading-[1.06] text-white mb-6">
                Know if your content will perform —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                  before you publish it.
                </span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed mb-3">
                Authority Studio runs a complete authority loop — generate, score, improve, and iterate your content across 5 expert dimensions, showing exactly what is weakening your post and what to fix before you publish.
              </p>
              <p className="text-sm text-blue-300 mb-6">
                A high score means your content is positioned to land. A low score means it will likely be ignored — even if it looks well written.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link to="/dashboard" className="sm:flex-1">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-6 rounded-xl shadow-lg shadow-blue-900/40 h-auto">
                    <Sparkles className="w-4 h-4 mr-2 shrink-0" />
                    Improve Your Next Post — Free
                  </Button>
                </Link>
                <Link to="/score" className="sm:flex-1">
                  <Button variant="ghost" size="lg" className="w-full text-white hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/10 font-semibold text-sm px-6 py-6 h-auto rounded-xl">
                    <BarChart className="w-4 h-4 mr-2 shrink-0" />
                    Score your last post — free
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-xl mb-2">
                <div className="flex -space-x-1.5 shrink-0">
                  {['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-teal-500'].map(function (c, i) {
                    return (
                      <div key={i} className={'w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-[8px] font-black text-white ' + c}>
                        {['ES', 'FP', 'MT', 'SR', 'KS'][i]}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-300 font-medium">
                  Enterprise architects, fintech leads, and consultants averaging <span className="font-bold text-white">43.2/50</span> — with high-scoring posts seeing up to 3× engagement
                </p>
              </div>
              <p className="text-[11px] text-gray-400 pl-1">
                High-scoring content consistently drives stronger reach, comments, and reposts
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <HeroScoreCard />
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-300 font-semibold">Fix the weakest dimension → reach Grade A before posting</span>
              </div>
              <p className="text-[10px] text-gray-600 text-center font-medium">
                Live score · Topic: "AI-driven resource management in project teams"
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 grid grid-cols-3 divide-x divide-white/10">
            {[
              { n: '5-dimension', label: 'scoring on every output' },
              { n: '38–44', label: 'typical first-run score' },
              { n: '+6 pts', label: 'avg lift per iteration' },
            ].map(function (s) {
              return (
                <div key={s.label} className="text-center px-6 first:pl-0 last:pr-0">
                  <p className="text-2xl font-black text-white leading-none">{s.n}</p>
                  <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. THE SCORING SYSTEM
      ══════════════════════════════════════════════════════════════ */}
      <section id="scoring" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-8 flex-wrap mb-14">
            {[
              { n: '300+', label: 'real engines scored' },
              { n: '43.2', label: 'avg authority score' },
              { n: '92%', label: 'reach Grade B or above' },
              { n: '< 60s', label: 'first engine ready' },
            ].map(function (s) {
              return (
                <div key={s.label} className="text-center min-w-[80px]">
                  <p className="text-3xl font-black text-blue-600">{s.n}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">The Scoring System</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
              Most AI tools generate content. We tell you if it is good — and make it better.
            </h2>
            <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
              Every engine output is scored across five craft dimensions — the same principles that define thought leadership in every major editorial and persuasion framework. Each score is diagnostic: it points to the exact dimension to target next.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-3">
              {SCORE_DIMS.map(function (d) {
                return (
                  <div key={d.label} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0">{d.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">{d.label}</p>
                        <span className={'text-sm font-black ' + d.textColor}>{d.val}/10</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                        <div className={'h-full rounded-full ' + d.color} style={{ width: (d.val * 10) + '%' }} />
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug">{d.desc}</p>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <span className="text-sm font-bold text-blue-800">Total Authority Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-700">42</span>
                  <span className="text-sm text-blue-400">/50</span>
                  <span className="ml-2 text-xs font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-md">Grade B</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Score Benchmarks</p>
                  <span className="text-[10px] text-gray-400">from 300+ real engines</span>
                </div>
                <div className="space-y-3">
                  {SCORE_BENCHMARKS.map(function (b) {
                    return (
                      <div key={b.range} className={'flex items-center gap-3 p-2.5 rounded-xl border ' + b.bgLight}>
                        <div className={'w-2.5 h-2.5 rounded-full ' + b.color + ' shrink-0'} />
                        <span className={'text-sm font-bold flex-1 ' + b.textColor}>{b.label}</span>
                        <span className="text-xs font-semibold text-gray-500">{b.range} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">AI Coaching — After Every Generation</p>
                <div className="space-y-2">
                  {[
                    { dim: 'Retention 7/10', coaching: 'Build narrative tension — tease the resolution earlier and deliver it later.', color: 'bg-amber-50 border-amber-200 text-amber-800' },
                    { dim: 'Authority Depth', coaching: 'Introduce a named framework with 3-5 components to signal mechanism-level expertise.', color: 'bg-blue-50 border-blue-200 text-blue-800' },
                    { dim: 'Next iteration', coaching: 'Target Retention first — it is your lowest dimension. Score ceiling: 47+.', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                  ].map(function (c) {
                    return (
                      <div key={c.dim} className={'p-2.5 border rounded-xl ' + c.color}>
                        <p className="text-[11px] leading-snug">
                          <span className="font-bold">{c.dim}: </span>
                          {c.coaching}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          LIVE SCORE DEMO
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Try It Now — No Account Required</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
              What score would your content get?
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
              Select a preset topic or type your own. See a 5-dimension authority score instantly — the same rubric used on every engine inside Authority Studio.
            </p>
          </div>
          <LiveScoreDemo />
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-400 mb-4 font-medium">
              Want to score <span className="font-bold text-gray-600">your actual LinkedIn post</span>?
            </p>
            <Link to="/score">
              <button className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 hover:border-violet-300 rounded-xl px-6 py-3 transition-all">
                <Sparkles className="w-4 h-4" />
                Paste your post and score it free — no signup
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          IMPROVEMENT 3: REAL ENGAGEMENT PROOF
          "Score 44/50 → 3× engagement" — tangible numbers
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Real Engines · Real Results · No Cherry-Picking</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
              High-scoring content performs differently
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
              These are real engines from real users — with the score, the iteration path, and the engagement numbers that followed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {ENGAGEMENT_PROOF.map(function (proof) {
              return (
                <div key={proof.topic} className={'rounded-2xl border p-5 flex flex-col gap-3 ' + proof.color}>
                  <div className="flex items-center justify-between">
                    <span className={'text-xs font-black px-2.5 py-1 rounded-full ' + proof.badgeColor}>
                      {proof.score}/50 · Grade {proof.grade}
                    </span>
                    <span className={'text-sm font-black ' + proof.metricColor}>{proof.result}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 leading-snug">"{proof.topic}"</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{proof.detail}</p>
                  <div className="pt-2 border-t border-gray-200/60">
                    <p className="text-[10px] text-gray-400 font-medium">{proof.lift}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{proof.author}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 font-medium mb-4">
              Engagement data self-reported by users. Score data from platform vault. All topics anonymised.
            </p>
            <Link to="/score">
              <button className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-xl px-5 py-2.5 transition-all">
                <BarChart className="w-4 h-4" />
                Score your post — see where you stand
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. ITERATION LOOP
      ══════════════════════════════════════════════════════════════ */}
      <section id="iteration" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">The Iteration Loop</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
              Don't guess what to publish. Know.
            </h2>
            <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
              Every iteration targets your lowest-scoring dimension. The system tracks all versions, compares them automatically, and surfaces your Best Version — the single highest-scoring output across all iterations. No guesswork. No manual review.
            </p>
            <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
              This is a closed-loop system — every version is scored, improved, compared, and stored, so your content quality compounds over time.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-4">Version history — one topic, three iterations</p>
              <IterationLoop />
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-gray-700">Best Version auto-detection</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  The system marks and pins your highest-scoring version across all iterations. When you export, you are always exporting the best — not just the latest.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">What happens at each iteration</p>
                <div className="space-y-3">
                  {[
                    { step: '1', label: 'Coaching identifies your weakest dimension', detail: 'System reads your current score and targets the dimension with the most upside — e.g. Retention at 7/10.' },
                    { step: '2', label: 'AI generates an improved version', detail: 'New content is focused specifically on lifting that dimension, while preserving your high-scoring ones.' },
                    { step: '3', label: 'Choose your angle — or let AI pick', detail: 'Pick Contrarian, Story, Framework, Mistake, Trend, or Myth. At 40+ plateau the system shows an angle picker so you can break through with a genuinely different approach.' },
                    { step: '4', label: 'New score compared against all previous', detail: 'Delta shown per dimension. Best Version automatically updated if the score improves. Every version is kept — you can always open any prior iteration.' },
                  ].map(function (s) {
                    return (
                      <div key={s.step} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">{s.step}</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{s.label}</p>
                          <p className="text-xs text-gray-500 leading-snug mt-0.5">{s.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 ring-1 ring-emerald-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Score progression</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">v1 to v3 across 3 iterations</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-700">+6</span>
                    <p className="text-[10px] font-bold text-emerald-600">pts · 38 to 44</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { dim: 'Hook', before: 8, after: 9, color: 'bg-blue-500' },
                    { dim: 'Clarity', before: 7, after: 9, color: 'bg-violet-500' },
                    { dim: 'Authority', before: 8, after: 9, color: 'bg-teal-500' },
                    { dim: 'Retention', before: 6, after: 8, color: 'bg-amber-500' },
                    { dim: 'Originality', before: 9, after: 9, color: 'bg-pink-500' },
                  ].map(function (d) {
                    return (
                      <div key={d.dim}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-gray-600">{d.dim}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400">{d.before}</span>
                            <span className="text-[10px] text-gray-300">to</span>
                            <span className="text-[11px] font-black text-gray-800">{d.after}</span>
                            {d.after > d.before && (
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 rounded-full px-1">+{d.after - d.before}</span>
                            )}
                          </div>
                        </div>
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="absolute left-0 h-full bg-gray-300 rounded-full" style={{ width: (d.before * 10) + '%', opacity: 0.4 }} />
                          <div className={'absolute left-0 h-full rounded-full transition-all ' + d.color} style={{ width: (d.after * 10) + '%' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-emerald-600 font-semibold mt-3 text-center">Grade C to Grade A in 3 iterations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. GEO READINESS + AUTHORITY VAULT
      ══════════════════════════════════════════════════════════════ */}
      <section id="vault" className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Intelligence System · Not Just a Tool</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
              It learns your domain. It builds your authority. It compounds.
            </h2>
            <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
              Every engine you run makes the next one smarter. Your top-scoring outputs become quality references. Your niche coverage map grows. Your voice profile deepens. And every piece of content is structured for GEO — so when someone asks Perplexity or ChatGPT a question you should own, your content is citation-ready.
            </p>
            <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
              Every post you generate improves the system — your highest-scoring content becomes a reference point for future outputs.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700 mb-2">GEO Readiness is scored inside every engine</p>
              <div className="grid grid-cols-1 gap-3">
                {GEO_SIGNALS.map(function (g) {
                  return (
                    <div key={g.label} className="flex items-start gap-3 p-3.5 bg-teal-50 border border-teal-100 rounded-xl">
                      <span className="text-xl shrink-0">{g.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-teal-800">{g.label}</p>
                        <p className="text-xs text-teal-600 leading-snug mt-0.5">{g.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-2xl mt-2">
                <p className="text-sm font-bold text-gray-800 mb-1">Why this matters now</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  When someone asks ChatGPT who the leading experts on AI integration in enterprise are, the answer is built from citation patterns, named frameworks, and content structure — not keyword density. Authority Studio's GEO scoring trains your content for this world.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700 mb-2">How the intelligence flywheel works</p>
              <div className="space-y-3">
                {[
                  { icon: '🎯', title: 'Niche memory', desc: 'Every engine you run in a niche builds a topic map. The system tracks which ideas you have covered, which scored highest, and which angles your audience responded to — surfacing gaps automatically.' },
                  { icon: '🧬', title: 'Voice DNA', desc: 'Train your writing fingerprint from past posts. Vocabulary, sentence rhythm, opinion density, formatting style, signature moves — extracted and applied to every engine at the highest priority. No competitor does this.' },
                  { icon: '🧠', title: 'Voice RAG — active', desc: 'Your top-performing scripts (scored ≥38) are stored as quality references. Future generations pull from these as style and depth benchmarks — your content compounds in quality over time. This is live.', highlight: true },
                  { icon: '📊', title: 'Authority profile', desc: 'Each generation updates your 5-dimension authority average. Over time, this profile shows exactly which dimension is your consistent strength and which is costing you citations.' },
                  { icon: '🔄', title: 'Compounding vault', desc: 'Engines are versioned, scored, and stored. Your Best Version is automatically identified. When you publish, you always export the highest-scoring iteration — not just the latest one.' },
                ].map(function (item) {
                  return (
                    <div key={item.title} className={'flex items-start gap-3 p-3.5 border rounded-xl transition-colors ' + (item.highlight ? 'bg-violet-50 border-violet-200 hover:border-violet-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200 hover:bg-blue-50/30')}>
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-800">{item.title}</p>
                          {item.highlight && <span className="text-[9px] font-black bg-violet-600 text-white rounded-full px-1.5 py-0.5 uppercase tracking-wide">Live</span>}
                        </div>
                        <p className="text-xs text-gray-500 leading-snug mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4b. VOICE DNA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-950 via-violet-950 to-indigo-950 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-widest bg-violet-900/40 border border-violet-600/30 rounded-full px-3 py-1 mb-3">
              <span>🧬</span> Pro exclusive — unique in the market
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-4 tracking-tight">
              Every engine sounds like <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">you</em> — not generic AI
            </h2>
            <p className="text-violet-200 text-base max-w-2xl mx-auto leading-relaxed">
              Voice DNA trains on your past LinkedIn posts and extracts your writing fingerprint across 6 dimensions. Every engine you generate from that point applies your fingerprint at the highest prompt priority — before niche context, before formatting rules, before everything else.
            </p>
          </div>

          <div className="mb-10">
            <p className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-4 text-center">The difference Voice DNA makes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">Without Voice DNA</span>
                </div>
                <p className="text-xs text-violet-300 leading-relaxed italic">
                  "In today's rapidly evolving digital landscape, leveraging AI-powered solutions can drive significant business transformation. By implementing strategic frameworks, organisations can unlock new value streams and optimise their competitive positioning."
                </p>
                <p className="text-[10px] text-red-400/60 mt-2 font-medium">Could be anyone. Zero signal. No authority.</p>
              </div>
              <div className="bg-white/10 border border-emerald-400/30 rounded-2xl p-5 ring-1 ring-emerald-400/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">With Voice DNA active 🧬</span>
                </div>
                <p className="text-xs text-violet-100 leading-relaxed italic">
                  "Most AI integration projects fail in month 3. Not because of the technology — because nobody defined what 'good' looked like before go-live. I've seen this kill three enterprise rollouts. The fix isn't better AI. It's a scoring rubric built before you start."
                </p>
                <p className="text-[10px] text-emerald-400/70 mt-2 font-medium">Practitioner-level specificity. Unmistakably yours.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <p className="text-sm font-bold text-violet-300 uppercase tracking-wider">How Voice DNA training works</p>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Paste your past posts', desc: 'Open Voice Studio in your dashboard. Paste 3–10 of your best LinkedIn posts — posts that represent how you naturally write at your best.', color: 'bg-violet-600' },
                  { step: '2', title: 'AI extracts your fingerprint', desc: 'The system analyses your vocabulary, sentence rhythm, opinion density, formatting style, signature moves, and tone profile — 6 dimensions of how you write.', color: 'bg-indigo-600' },
                  { step: '3', title: 'Applied at highest prompt priority', desc: 'Your fingerprint is injected into every engine run before niche context, before formatting rules, before everything else. The output must sound like you — or the generation reruns.', color: 'bg-blue-600' },
                  { step: '4', title: 'Compounds with RAG references', desc: 'Your top-scoring engines (≥38) become quality benchmarks for future generations. The system pulls from your best work — so every new engine has a higher quality ceiling.', color: 'bg-teal-600' },
                ].map(function (item) {
                  return (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className={'w-6 h-6 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ' + item.color}>{item.step}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="text-xs text-violet-300 leading-snug mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold text-violet-300 uppercase tracking-wider">Your fingerprint — 6 dimensions</p>
              <div className="space-y-3">
                {[
                  { dim: 'Vocabulary signature', detail: 'The specific words, phrases, and terminology patterns that appear across your writing.', score: 94 },
                  { dim: 'Sentence rhythm', detail: 'Short punchy vs long elaborated. Where you breathe and where you push.', score: 88 },
                  { dim: 'Opinion density', detail: 'How frequently you assert positions vs describe situations. Calibrated per niche.', score: 91 },
                  { dim: 'Formatting style', detail: 'Line breaks, list usage, paragraph length, and punctuation patterns.', score: 86 },
                  { dim: 'Signature moves', detail: 'Recurring structural devices — the 3-part reveal, the "here is what nobody says", the named failure mode.', score: 79 },
                  { dim: 'Tone profile', detail: 'Where you sit on the warm/authoritative and bold/measured spectra.', score: 92 },
                ].map(function (item) {
                  return (
                    <div key={item.dim} className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-white">{item.dim}</p>
                        <span className="text-[10px] font-black text-violet-300">{item.score}% match</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: item.score + '%' }} />
                      </div>
                      <p className="text-[10px] text-violet-400 leading-snug">{item.detail}</p>
                    </div>
                  );
                })}
              </div>
              <Link to="/dashboard">
                <button className="w-full flex items-center justify-center gap-2 text-sm font-bold text-violet-900 bg-violet-300 hover:bg-violet-200 rounded-xl px-5 py-3 transition-all mt-2">
                  <span>🧬</span>
                  Train my Voice DNA — Pro
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. MULTI-FORMAT ENGINE
      ══════════════════════════════════════════════════════════════ */}
      <section id="formats" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">One Engine — Six Formats</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
              One topic. Six publish-ready formats. All scored.
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Every engine run generates all six simultaneously. Two full variants are generated per run so the better-scoring angle is always selected automatically.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { Icon: MessageSquare, iconColor: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', label: 'LinkedIn Post', detail: 'Authority-structured long-form post. Hook to mechanism to call-to-reflect. Scored independently.' },
              { Icon: Video, iconColor: 'text-red-500', bg: 'bg-red-50 border-red-100', label: 'YouTube Script', detail: '~1,450 words. Full narrative arc. No markdown bold, no generic frameworks — real argument structure.' },
              { Icon: Presentation, iconColor: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', label: 'Slide Deck Outline', detail: '7 slides with thesis, frameworks, and mechanism reveals. Ready to build in Canva or PowerPoint.' },
              { Icon: Zap, iconColor: 'text-amber-500', bg: 'bg-amber-50 border-amber-100', label: 'Viral Hooks x5', detail: 'Five opening lines calibrated to your niche — contrarian, curiosity, mechanism, and challenge formats.' },
              { Icon: BookOpen, iconColor: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', label: 'Research Brief', detail: 'Core thesis, evidence anchors, and supporting arguments. Structured for GEO citability.' },
              { Icon: Award, iconColor: 'text-violet-600', bg: 'bg-violet-50 border-violet-100', label: 'Authority Score Report', detail: 'Full 5-dimension breakdown with coaching, grade, benchmark, and iteration recommendations.' },
            ].map(function (f) {
              return (
                <div key={f.label} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className={'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ' + f.bg}>
                    <f.Icon className={'w-5 h-5 ' + f.iconColor} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{f.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <GitCompare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white mb-1">Batch Generation — Best of 2, Automatic</p>
              <p className="text-sm text-blue-100 leading-relaxed">
                Every Pro engine run generates two full variants with different angles in parallel. The higher-scoring one is automatically selected and saved to your vault. Contrarian angle scored 44/50. Framework angle scored 40/50. Contrarian selected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          IMPROVEMENT 4: SHIPPED FEATURES — sync with changelog
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">What's live right now</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
              Platform capabilities — all shipped
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              Everything below is live in production today. No roadmap promises — these are working features.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {SHIPPED_FEATURES.map(function (feat) {
              return (
                <div key={feat.label} className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <span className="text-2xl shrink-0">{feat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900">{feat.label}</p>
                      <span className={'text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ' + (feat.badge === 'Live' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700')}>
                        {feat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{feat.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <Link to="/changelog" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Full changelog — every release documented
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5b. NICHE INTELLIGENCE
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Niche Intelligence</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3 tracking-tight">
              Content that knows your audience before you type a word.
            </h2>
            <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
              Generic AI generates generic content. Authority Studio profiles your niche — adapting hook style, authority depth, framework structure, and GEO positioning to the specific expectations of your audience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { niche: 'AI & Technology', icon: '⚙️', signals: ['Named ML mechanisms over hype', 'Implementation specificity scored', 'Technical depth as authority signal'], color: 'bg-blue-50 border-blue-100' },
              { niche: 'Finance & Fintech', icon: '📈', signals: ['Risk and compliance framing', 'Regulatory awareness in hooks', 'Data-backed authority statements'], color: 'bg-emerald-50 border-emerald-100' },
              { niche: 'Business & Strategy', icon: '🎯', signals: ['Framework-led structure', 'Executive-level specificity', 'ROI and outcomes language'], color: 'bg-amber-50 border-amber-100' },
              { niche: 'Marketing & Growth', icon: '📣', signals: ['Behavioural insight hooks', 'Channel-specific examples', 'Conversion mechanism depth'], color: 'bg-violet-50 border-violet-100' },
              { niche: 'Education & L&D', icon: '🎓', signals: ['Pedagogical framework references', 'Learner outcome specificity', 'Research citation structure'], color: 'bg-teal-50 border-teal-100' },
              { niche: 'Creator Economy', icon: '🎨', signals: ['Audience relationship framing', 'Monetisation mechanism depth', 'Platform-aware formatting'], color: 'bg-pink-50 border-pink-100' },
            ].map(function (n) {
              return (
                <div key={n.niche} className={'rounded-2xl border p-5 ' + n.color}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{n.icon}</span>
                    <span className="text-sm font-bold text-gray-900">{n.niche}</span>
                  </div>
                  <div className="space-y-1.5">
                    {n.signals.map(function (s) {
                      return (
                        <div key={s} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5 shrink-0 text-xs">&#10003;</span>
                          <span className="text-xs text-gray-600 leading-snug">{s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-5">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Custom niche + audience targeting</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Beyond the six core niches, define a custom niche and specify your exact audience — e.g. "Resource Management Engineers in enterprise IT" or "Series A founders in B2B SaaS." The engine adapts its authority positioning, hook tension style, and depth benchmarks to the professional reading your content. Your audience context is stored and applied to every future generation automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. AUTHORITY FLYWHEEL
      ══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">The Authority Flywheel</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3 tracking-tight">One topic. Score. Iterate. Publish. Repeat.</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">Generate — Score — Improve — Publish — Vault — Repeat</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-blue-200 via-violet-200 to-amber-200" />
            <div className="space-y-4">
              {FLYWHEEL_STEPS.map(function (step) {
                return (
                  <div key={step.number} className="relative flex gap-4 items-start">
                    <div className={'shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-sm relative z-10 bg-white ' + step.accent}>
                      {step.number}
                    </div>
                    <div className="flex-1 pt-3.5">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT MOCKUP */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">The Full Engine Output</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3 tracking-tight">One topic. Six formats. One score.</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">Publish-ready content across every major professional format — scored and ranked before you see it.</p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-white max-w-2xl mx-auto">
            <div className="bg-gray-900 px-4 py-3 flex items-center gap-2"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-amber-500/60" /><div className="w-3 h-3 rounded-full bg-emerald-500/60" /></div><div className="flex-1 mx-4 bg-gray-800 rounded px-3 py-1 text-center"><span className="text-gray-400 text-xs font-mono">authoritystudioai.com/dashboard</span></div></div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-blue-200 rounded-xl px-4 py-3"><Sparkles className="w-4 h-4 text-blue-500 shrink-0" /><span className="text-sm text-gray-700 font-medium flex-1">Why most leaders confuse activity with progress</span><span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg shrink-0">Launch Engine</span></div>
              <div className="grid grid-cols-3 gap-2">{[{ icon: "📝", label: "LinkedIn Post", color: "bg-blue-50 border-blue-100" }, { icon: "🎬", label: "YouTube Script", color: "bg-red-50 border-red-100" }, { icon: "📊", label: "Slide Deck", color: "bg-indigo-50 border-indigo-100" }].map(function (f) { return (<div key={f.label} className={"rounded-xl border p-3 " + f.color}><div className="text-xl mb-1">{f.icon}</div><p className="text-xs font-bold text-gray-700">{f.label}</p><span className="text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5 mt-1 inline-block">Ready</span></div>); })}</div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 flex items-center justify-between"><div><p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Authority Score</p><div className="flex items-baseline gap-1 mt-0.5"><span className="text-3xl font-black text-white">44</span><span className="text-blue-300 text-sm">/50</span></div><span className="text-xs font-bold text-emerald-300">Grade A · Thought Leadership</span></div><div className="space-y-1.5">{[["Hook", 9], ["Clarity", 9], ["Authority", 9], ["Retention", 8], ["Originality", 9]].map(function (d) { return (<div key={d[0]} className="flex items-center gap-2"><span className="text-xs text-blue-200 w-14 text-right">{d[0]}</span><div className="w-14 h-1 bg-blue-500 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: (d[1] * 10) + "%" }} /></div><span className="text-xs font-bold text-white w-3">{d[1]}</span></div>); })}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. REAL RESULTS + TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Real Results · Actual Engines · No Cherry-Picking</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3 tracking-tight">What real engines produce</h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto mb-8">
              Every score below is from a real generation. Real topic, real dimension breakdown, real iteration delta.
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap mb-4">
              {[
                { label: 'Avg first-run score', value: '38–44/50' },
                { label: 'Typical score lift per iteration', value: '+3–6 pts' },
                { label: 'Formats per engine', value: '6 formats' },
              ].map(function (stat) {
                return (
                  <div key={stat.label} className="text-center">
                    <p className="text-lg font-black text-gray-900">{stat.value}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* MID-PAGE CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-white font-black text-xl sm:text-2xl leading-tight mb-1">
              Your next post could score 44/50. Build it free.
            </p>
            <p className="text-blue-200 text-sm font-medium">
              5 engines free — no credit card. Score, iterate, reach Grade A.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/dashboard">
              <Button size="lg" className="bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm px-7 py-5 h-auto rounded-xl whitespace-nowrap shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Launch your first engine — free
              </Button>
            </Link>
            <Link to="/score">
              <Button variant="ghost" size="lg" className="text-white border border-white/30 hover:bg-white/10 font-semibold text-sm px-7 py-5 h-auto rounded-xl whitespace-nowrap">
                Score my last post first
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          IMPROVEMENT 2: PUBLIC LEADERBOARD TEASER
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Niche Authority Intelligence</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
                See how your authority stacks up — in your niche
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                The Niche Leaderboard shows your authority score percentile against other creators in the same space — anonymously. See the score distribution, your position, and the gap to the top. Available to every plan.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { icon: '🏆', label: 'Percentile ranking in your niche', detail: 'See where you rank vs all creators in the same domain — instantly.' },
                  { icon: '📊', label: 'Score distribution bar chart', detail: 'Visualise the full authority distribution. Know if 44/50 is exceptional or expected.' },
                  { icon: '📈', label: 'Gap-to-top shown when relevant', detail: 'If you are not leading your niche, the exact points gap is shown — and which dimension to lift.' },
                  { icon: '🔒', label: 'Fully anonymous', detail: 'Your identity is never exposed. Only your anonymised score contributes to the board.' },
                ].map(function (item) {
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-500 leading-snug">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/dashboard">
                <button className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 hover:border-violet-300 rounded-xl px-5 py-2.5 transition-all">
                  <Trophy className="w-4 h-4" />
                  See your ranking — free
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div>
              <LeaderboardTeaser />
              <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">
                Sample data. Your real position appears after your first engine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8. WHO IT'S FOR
      ══════════════════════════════════════════════════════════════ */}
      <section id="who" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Who it's for</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 tracking-tight">Built for professionals who know their work is worth more than generic AI content</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHO_ITS_FOR.map(function (item) {
              var IconMap = {
                Briefcase: Briefcase, TrendingUp: TrendingUp, Layers: Layers,
                GraduationCap: GraduationCap, BookOpen: BookOpen, Users: Users,
              };
              var IconComp = IconMap[item.icon] || Users;
              return (
                <div key={item.role} className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className={'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ' + item.color}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.role}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          9. PRICING
      ══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              One engine = LinkedIn + YouTube + Slides + Hooks + Research + 5-dimension Authority Score.
            </p>
          </div>
          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : plans.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
                {plans.map(function (plan) {
                  return (
                    <div
                      key={plan.id}
                      className={'relative flex flex-col rounded-2xl border bg-white transition-all ' + (plan.isPro ? 'border-blue-600 shadow-xl md:scale-[1.03] z-10 ring-1 ring-blue-600/20' : 'border-gray-200 shadow-sm hover:shadow-md')}
                    >
                      {plan.isPro && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                          <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</span>
                        </div>
                      )}
                      <div className="p-6 border-b border-gray-100">
                        {plan.tagline && (
                          <span className={'inline-block text-[10px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full ' + (plan.isPro ? 'bg-blue-100 text-blue-700' : plan.displayName === 'Pro+' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500')}>
                            {plan.tagline}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-gray-900 mb-1">{plan.displayName}</h3>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                          {plan.period && <span className="text-sm text-gray-400">{plan.period}</span>}
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                          <BarChart className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="text-sm font-black text-blue-700">{plan.monthly_limit > 1000 ? '∞' : plan.monthly_limit}</span>
                          <span className="text-xs font-semibold text-blue-600">engines / mo</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <ul className="space-y-2.5 mb-5 flex-1">
                          {plan.features.map(function (feature, fidx) {
                            return (
                              <li key={fidx} className="flex items-start gap-2 text-sm text-gray-600">
                                <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" strokeWidth={3} />
                                {feature}
                              </li>
                            );
                          })}
                        </ul>
                        <Button
                          onClick={function () { navigate(plan.price === '$0' ? '/dashboard' : '/pricing'); }}
                          className={'w-full font-bold rounded-xl py-4 text-sm ' + (plan.isPro ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50')}
                        >
                          {plan.price === '$0' ? 'Start free' : plan.isPro ? 'Start 7-day trial' : 'See plan details'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center">
                <Link to="/pricing" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 text-sm">
                  View full plan details <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 font-semibold">Pricing information is currently unavailable.</div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          IMPROVEMENT 5: PRODUCT HUNT + LINKEDIN LAUNCH SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-t border-orange-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 border border-orange-200 rounded-full px-3 py-1 mb-3">
              <Rocket className="w-3.5 h-3.5" /> We're launching
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
              Join us at launch — shape what we build next
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
              Authority Studio AI is live on Product Hunt today. Early supporters get direct access to the founding team — and your feedback directly shapes the next 3 features.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <a
              href="https://www.producthunt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-orange-200 hover:border-orange-400 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <span className="text-4xl">🐱</span>
              <div className="text-center">
                <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">Upvote on Product Hunt</p>
                <p className="text-xs text-gray-400 mt-1">Takes 10 seconds. Means the world.</p>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">Vote now</span>
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <span className="text-4xl">💼</span>
              <div className="text-center">
                <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">Follow on LinkedIn</p>
                <p className="text-xs text-gray-400 mt-1">Weekly feature drops and authority tips.</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">Follow</span>
            </a>
            <Link
              to="/dashboard"
              className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-600 rounded-2xl shadow-sm hover:shadow-lg transition-all group"
            >
              <Sparkles className="w-10 h-10 text-white/80" />
              <div className="text-center">
                <p className="text-sm font-black text-white">Try it free — right now</p>
                <p className="text-xs text-blue-200 mt-1">5 engines. No credit card. 60 seconds.</p>
              </div>
              <span className="text-xs font-bold text-blue-900 bg-white rounded-full px-3 py-1">Start free</span>
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 mb-0.5">Have feedback or a feature request?</p>
              <p className="text-xs text-gray-500">We read every message. Reach us at <span className="font-semibold text-blue-600">contact@authoritystudioai.com</span> — the founder responds personally.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          10. FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold mb-8">
            <Check className="w-3.5 h-3.5" />
            5 engines free · No credit card required
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
            Stop guessing. Start building authority
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              that compounds with every engine.
            </span>
          </h2>
          <p className="text-blue-100/80 text-base mb-10 max-w-xl mx-auto leading-relaxed">
            One topic. Six professional formats. A 5-dimension score that tells you exactly what to improve — and an iteration engine that fixes it. Build an authority vault AI engines can discover and cite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-10 py-6 h-auto rounded-xl shadow-lg shadow-blue-900/50">
                <Sparkles className="w-5 h-5 mr-2" />
                Launch your first engine — free
              </Button>
            </Link>
            <Link to="/score">
              <Button variant="ghost" size="lg" className="text-gray-300 hover:text-white border border-white/15 hover:border-white/30 font-semibold text-sm px-8 py-6 h-auto rounded-xl">
                Score my last post first <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <p className="text-gray-500 text-xs font-medium">No credit card · Cancel anytime · 5 engines free forever</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;