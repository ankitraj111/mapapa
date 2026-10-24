'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, Flame, Calendar, Clock,
  Bot, ShieldCheck, Sparkles, MessageSquare, TrendingUp,
  BarChart3, ChevronDown, Check, RefreshCw,
  ChevronRight, Globe, Cpu, Terminal,
  Database, Activity, UserCheck, Users, Mail, Target,
  Layers, CheckCircle, Menu, X, HelpCircle,
  Send, Sliders, ChevronUp, Plus, Minus,
  Building2, Video, Inbox, ListFilter, Workflow, Book,
  Phone, MessageCircle, Zap, Lock, Shield, AlertCircle,
  Webhook, ExternalLink, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */

const PIPELINE_STATUSES = [
  {
    status: 'NEW',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    desc: 'Inbound lead captured from Website, Gmail, or WhatsApp.',
  },
  {
    status: 'CONTACTED',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-500',
    desc: 'AI Sales Employee has sent the first engagement message.',
  },
  {
    status: 'QUALIFYING',
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    dot: 'bg-violet-500',
    desc: 'AI is actively gathering budget, timeline and requirements.',
  },
  {
    status: 'QUALIFIED',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    desc: 'Prospect meets configured qualification criteria.',
  },
  {
    status: 'HOT',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    desc: 'High intent. AI proposes a meeting slot and invite.',
  },
  {
    status: 'MEETING_BOOKED',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    desc: 'Prospect confirmed. Google Meet created. Calendar synced.',
  },
  {
    status: 'WON',
    color: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-600',
    desc: 'Deal closed. Revenue attributed.',
  },
  {
    status: 'LOST',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    desc: 'Lead did not convert. Logged for analytics.',
  },
];

const OPTIONAL_STATUSES = [
  {
    status: 'HUMAN_REVIEW',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    desc: 'Complex or sensitive request. AI pauses. Human takes over.',
  },
  {
    status: 'NURTURE',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    dot: 'bg-cyan-500',
    desc: 'Post-sequence lead. Re-enters qualification on reply.',
  },
];

const FOLLOW_UP_STEPS = [
  {
    day: 'Day 1',
    hours: '24 hours',
    label: 'First follow-up',
    desc: 'Sent 24 hours after initial contact with no response.',
  },
  {
    day: 'Day 3',
    hours: '72 hours',
    label: 'Second follow-up',
    desc: 'Sent 72 hours after first contact. Adds context or value.',
  },
  {
    day: 'Day 7',
    hours: '168 hours',
    label: 'Third follow-up',
    desc: 'Sent 7 days after first contact. Tries a different angle.',
  },
  {
    day: 'Day 14',
    hours: '336 hours',
    label: 'Final follow-up',
    desc: 'Last automated step. After this, lead may enter NURTURE.',
  },
];

const EMPLOYEE_CAPABILITIES = [
  {
    num: '01',
    title: 'Capture',
    icon: Inbox,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    desc: 'Captures inbound leads from Website forms, Gmail inbox, and WhatsApp messages in real time.',
  },
  {
    num: '02',
    title: 'Respond',
    icon: MessageSquare,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    desc: 'Engages prospects through supported channels — email, WhatsApp — with grounded, contextual responses.',
  },
  {
    num: '03',
    title: 'Understand',
    icon: Sparkles,
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    desc: 'Understands prospect budget, timeline, requirements, and buying intent from conversation context.',
  },
  {
    num: '04',
    title: 'Qualify',
    icon: CheckCircle2,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    desc: 'Evaluates prospects against your configured qualification rules: budget, timeline, requirements, intent.',
  },
  {
    num: '05',
    title: 'Score',
    icon: Target,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    desc: 'Generates a 0–100 lead score based on qualification signals. HOT leads score ≥ 70.',
  },
  {
    num: '06',
    title: 'Follow Up',
    icon: Clock,
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    desc: 'Runs the automated 4-step follow-up sequence (Day 1, 3, 7, 14). A reply cancels pending steps.',
  },
  {
    num: '07',
    title: 'Book',
    icon: Calendar,
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    desc: 'Checks Google Calendar availability, proposes a slot, and creates a Google Meet meeting on confirmation.',
  },
  {
    num: '08',
    title: 'Human Handoff',
    icon: UserCheck,
    color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    desc: 'Escalates to HUMAN_REVIEW when a conversation requires human intervention. AI pauses automatically.',
  },
  {
    num: '09',
    title: 'Track',
    icon: BarChart3,
    color: 'bg-teal-50 text-teal-600 border-teal-100',
    desc: 'Tracks pipeline activity, lead status changes, AI actions, and revenue intelligence across the operation.',
  },
];

const INTEGRATIONS = [
  {
    icon: Globe,
    name: 'Website',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    desc: 'Capture inbound leads from website forms via webhook or API. Deduplication and sanitisation applied automatically.',
    status: 'live',
  },
  {
    icon: Mail,
    name: 'Gmail',
    color: 'bg-red-50 text-red-600 border-red-100',
    desc: 'Monitor your Gmail inbox for inbound enquiries. The AI reads, understands, and responds on your behalf.',
    status: 'live',
  },
  {
    icon: MessageCircle,
    name: 'WhatsApp',
    color: 'bg-green-50 text-green-600 border-green-100',
    desc: 'Engage prospects on WhatsApp Business. The AI sends grounded, human-quality messages through your connected number.',
    status: 'live',
  },
  {
    icon: Calendar,
    name: 'Google Calendar',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    desc: 'Checks real-time availability and creates calendar events when a prospect confirms a meeting time.',
    status: 'live',
  },
  {
    icon: Video,
    name: 'Google Meet',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    desc: 'Generates Google Meet links for every booked meeting. Link is sent to the prospect automatically.',
    status: 'live',
  },
  {
    icon: Database,
    name: 'Razorpay',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    desc: 'Payment gateway integration for revenue attribution and deal tracking within the pipeline.',
    status: 'live',
  },
  {
    icon: Webhook,
    name: 'APIs & Webhooks',
    color: 'bg-slate-50 text-slate-600 border-slate-200',
    desc: 'Inbound webhooks for any source. HMAC verification, idempotency protection, and dead-letter queue handling.',
    status: 'live',
  },
  {
    icon: Phone,
    name: 'Voice AI',
    color: 'bg-orange-50 text-orange-500 border-orange-100',
    desc: 'Autonomous voice calling capability — expanding the AI Sales Employee beyond text channels.',
    status: 'soon',
  },
];

const SECURITY_CAPABILITIES = [
  {
    icon: Layers,
    title: 'Multi-Tenant Architecture',
    desc: 'Each customer operates in a fully isolated tenant context. No cross-tenant data leakage.',
    badge: 'Active',
  },
  {
    icon: ShieldCheck,
    title: 'JWT Authentication',
    desc: 'All API requests are authenticated with signed JWT tokens. Token refresh and expiry handled automatically.',
    badge: 'Active',
  },
  {
    icon: Lock,
    title: 'Tenant Data Isolation',
    desc: 'PostgreSQL row-level isolation ensures each tenant can only access their own data.',
    badge: 'Active',
  },
  {
    icon: Shield,
    title: 'HMAC Webhook Verification',
    desc: 'All inbound webhook payloads are verified using HMAC signatures to prevent spoofing.',
    badge: 'Active',
  },
  {
    icon: Activity,
    title: 'Redis Rate Limiting',
    desc: 'Distributed rate limiting: 60 requests per minute per IP. Prevents abuse and protects pipeline integrity.',
    badge: 'Active',
  },
  {
    icon: AlertCircle,
    title: 'XSS & Input Sanitisation',
    desc: 'All inbound data is sanitised before storage or processing. Cross-site scripting prevention applied.',
    badge: 'Active',
  },
  {
    icon: RefreshCw,
    title: 'OAuth Token Handling',
    desc: 'Google OAuth token refresh and recovery handled automatically. RECONNECT_REQUIRED state on failure.',
    badge: 'Active',
  },
  {
    icon: Database,
    title: 'Production Seed Protection',
    desc: 'Production environments are protected from accidental seed operations. Strict environment checks enforced.',
    badge: 'Active',
  },
];

const ONBOARDING_STEPS = [
  {
    num: '01',
    title: 'CONNECT',
    desc: 'Connect supported revenue channels: Website, Gmail, WhatsApp, Google Calendar.',
  },
  {
    num: '02',
    title: 'CONFIGURE',
    desc: 'Define qualification rules — budget, timeline, requirements, intent, lead score thresholds.',
  },
  {
    num: '03',
    title: 'GROUND',
    desc: 'Add services, pricing, FAQs, policies, and business documents to the Knowledge Base.',
  },
  {
    num: '04',
    title: 'TEST',
    desc: 'Test AI responses, qualification flows, and follow-up sequences in a sandbox environment.',
  },
  {
    num: '05',
    title: 'ACTIVATE',
    desc: 'Launch the AI Sales Employee. Live inbound processing begins immediately.',
  },
  {
    num: '06',
    title: 'MONITOR',
    desc: 'Track conversations, lead pipeline, integration health, and AI actions in the Command Center.',
  },
  {
    num: '07',
    title: 'OPTIMIZE',
    desc: 'Use Revenue Intelligence — win rates, source attribution, NBA — to refine the workflow.',
  },
];

const FAQS = [
  {
    q: 'What is Enterprise AI Deployment?',
    a: 'Enterprise AI Deployment is the process of connecting the AI Revenue Operator platform to your existing revenue channels (Website, Gmail, WhatsApp, Google Calendar) and activating an autonomous AI Sales Employee that captures, qualifies, follows up with, and books meetings with your inbound prospects — without manual intervention.',
  },
  {
    q: 'What does the AI Sales Employee actually do?',
    a: 'The AI Sales Employee captures inbound leads, responds to prospects across supported channels, understands their budget and requirements, qualifies them against your configured rules, scores them 0–100, runs automated follow-ups, books Google Meet meetings, and escalates to a human when required.',
  },
  {
    q: 'Which channels are currently supported?',
    a: 'Website (via webhook/API), Gmail, WhatsApp, Google Calendar, and Google Meet are currently supported. Razorpay is integrated for payment and revenue attribution. Voice AI is on the roadmap and is not currently available.',
  },
  {
    q: 'Can the AI use our pricing and business documents?',
    a: 'Yes. The Knowledge Base allows you to upload services, pricing, FAQs, policies, and documents. The AI Sales Employee grounds every response in this approved business knowledge — it does not make up pricing or features.',
  },
  {
    q: 'How does lead qualification work?',
    a: 'You configure qualification rules based on budget, timeline, requirements, and intent. The AI evaluates each prospect against these rules during conversation and assigns a 0–100 lead score. Leads scoring ≥ 70 are flagged as HOT.',
  },
  {
    q: 'How does automated follow-up work?',
    a: 'The follow-up engine runs a 4-step sequence: Day 1 (24h), Day 3 (72h), Day 7 (168h), Day 14 (336h). A reply from the prospect automatically cancels pending follow-ups. Meeting booked, WON, LOST, or HUMAN_REVIEW status also stops the sequence. After the final step, the lead enters NURTURE and can re-enter qualification on a later reply.',
  },
  {
    q: 'Can a human take over a conversation?',
    a: 'Yes. When the AI encounters a complex or sensitive request, it transitions the lead to HUMAN_REVIEW status and pauses all automated activity. A human can then take over the conversation directly. The AI resumes only when explicitly reactivated.',
  },
  {
    q: 'How does meeting booking work?',
    a: 'When a lead reaches HOT or QUALIFIED status, the AI proposes a meeting slot based on real-time Google Calendar availability. When the prospect confirms, a Google Meet link is generated, the calendar event is created, and the lead status is set to MEETING_BOOKED.',
  },
  {
    q: 'What happens if an integration fails?',
    a: 'The platform uses automatic retry with exponential backoff (500ms → 1s → 2s + jitter) for 429, 5xx, and connection failure errors. Google OAuth token failures trigger automatic token recovery or a RECONNECT_REQUIRED state. Webhooks that cannot be processed go to a Dead Letter Queue.',
  },
  {
    q: 'How are duplicate events handled?',
    a: 'All webhook events are processed with idempotency protection. Duplicate event IDs are detected and rejected to prevent double-processing of the same lead or action.',
  },
  {
    q: 'How is tenant data isolated?',
    a: 'AI Revenue Operator uses a multi-tenant architecture with PostgreSQL row-level isolation. Each tenant\'s data is fully separated — no cross-tenant queries or data leakage is possible. JWT authentication ensures every request is scoped to the authenticated tenant.',
  },
  {
    q: 'Is Voice AI available?',
    a: 'Voice AI is not currently available. It is on the product roadmap as the next expansion of the AI Sales Employee beyond text channels (Website, Gmail, WhatsApp). No timeline is confirmed.',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export default function EnterpriseAIDeploymentPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState<number>(0);
  const [heroStep, setHeroStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hero pipeline animation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setHeroStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 1800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Pipeline status auto-cycle
  useEffect(() => {
    const t = setInterval(() => {
      setActiveStatus((prev) => (prev >= PIPELINE_STATUSES.length - 1 ? 0 : prev + 1));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const HERO_STEPS = [
    { label: 'Website / Gmail / WhatsApp', icon: Globe, active: heroStep >= 0 },
    { label: 'AI Sales Employee', icon: Bot, active: heroStep >= 1 },
    { label: 'Understand → Qualify → Score', icon: Sparkles, active: heroStep >= 2 },
    { label: 'Follow Up', icon: Clock, active: heroStep >= 3 },
    { label: 'Meeting → Revenue', icon: Calendar, active: heroStep >= 4 },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#111827] font-sans antialiased selection:bg-[#e8572a] selection:text-white overflow-x-hidden">

      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────────────── */}
      <aside aria-label="Announcement" className="relative z-[210] flex h-9 items-center justify-center gap-2 overflow-hidden whitespace-nowrap bg-[#0c0e14] px-4 text-[12.5px] font-medium text-white">
        <span className="font-semibold text-[#e8572a]">New:</span>
        <span className="overflow-hidden text-ellipsis">
          AI Revenue Operator 2.0 — Autonomous 24/7 AI Sales Employee for Agencies →
        </span>
        <Link href="/register" className="ml-1 underline decoration-[#e8572a] hover:text-[#e8572a] font-semibold">
          Deploy Free
        </Link>
      </aside>

      {/* ── STICKY NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[200] h-[72px] border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <nav aria-label="Main" className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-5 md:px-8">

          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <img src="/images/op-logo-arc.png" alt="Operator icon" className="h-6 w-6 object-contain" loading="eager" />
            <span className="text-[18px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
              operator<span className="text-[#e8572a]">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 xl:gap-2 lg:flex text-[13px] font-medium text-slate-600">
            <Link href="/" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">Home</Link>
            <Link href="/enterprise-ai-deployment" className="rounded-full px-3 py-1.5 font-semibold text-[#e8572a] bg-orange-50 border border-orange-200 transition-colors">
              Enterprise Deployment
            </Link>
            <Link href="/live-command-center" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Command Center
            </Link>
            <Link href="/ai-sales-agent-builder" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Agent Builder
            </Link>
            <Link href="/autonomous-inbound-calling" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Inbound Calling
            </Link>
            <Link href="/call-scrubber-replay" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Call Scrubber
            </Link>
            <a href="#faq" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">FAQ</a>
          </div>

          {/* CTAs */}
          <div className="hidden items-center gap-3 lg:flex shrink-0">
            <Link href="/login" className="px-3 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#e8572a] px-5 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Book Enterprise Demo
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-6 py-5 lg:hidden space-y-3 shadow-lg">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Home</Link>
            <a href="#what-is" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">What Is It</a>
            <a href="#pipeline" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Pipeline</a>
            <a href="#integrations" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Integrations</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">FAQ</a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link href="/login" className="w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-lg">Sign In</Link>
              <Link href="/register" className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#e8572a] rounded-full">Book Enterprise Demo</Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">

        {/* ── SECTION 1: HERO ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-transparent pb-16 pt-12 md:pb-28 md:pt-16">
          {/* Grid background */}
          <div className="pointer-events-none absolute inset-0 z-0" style={{
            backgroundImage: 'linear-gradient(to right, rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,24,40,0,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="pointer-events-none absolute inset-0 z-0" style={{
            background: 'radial-gradient(ellipse 50% 60% at 80% 30%, rgba(232,87,42,0.07), transparent 70%)'
          }} />

          <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 md:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:gap-14">

              {/* Left: Copy */}
              <div className="flex flex-col items-start">
                {/* Eyebrow */}
                <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  ENTERPRISE AI DEPLOYMENT
                  <span className="h-px w-8 bg-slate-300 hidden sm:inline-block" />
                </span>

                <h1 className="text-[clamp(1.85rem,1.4rem+1.8vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0c0e14]">
                  Deploy Your{' '}
                  <span className="relative inline-block whitespace-nowrap">
                    AI Sales Employee
                    <svg viewBox="0 0 180 12" aria-hidden="true" className="absolute -bottom-2.5 left-0 h-[10px] w-full" preserveAspectRatio="none">
                      <path d="M3 7 C 45 3, 100 8.5, 177 4.5" stroke="#e8572a" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                </h1>

                <p className="mt-6 max-w-[580px] text-[15px] sm:text-[16px] leading-relaxed text-slate-600">
                  Deploy a 24/7 autonomous AI employee that captures, understands, qualifies, follows up with, and converts inbound prospects across your connected revenue channels.
                </p>

                <p className="mt-3 font-mono text-[12px] font-medium tracking-[0.03em] text-slate-500">
                  AI Revenue Operator Platform · AI Sales Employee · Fully Managed
                </p>

                <div className="mt-8 flex flex-wrap items-start gap-x-4 gap-y-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8572a] px-6 py-3 text-[13.5px] font-semibold text-white shadow-lg shadow-[#e8572a]/25 transition-all hover:bg-[#d04920] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <span>Book Enterprise Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#what-is"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-[13.5px] font-semibold text-slate-800 transition-all hover:bg-slate-50 active:scale-[0.98] shadow-xs"
                  >
                    <ChevronDown className="w-4 h-4 text-[#e8572a]" />
                    <span>See How It Works</span>
                  </a>
                </div>
              </div>

              {/* Right: Animated Operations Console */}
              <div className="relative flex flex-col items-center">
                <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl relative overflow-hidden">
                  {/* Console Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                        AI REVENUE OPERATOR · LIVE PIPELINE
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      RUNNING
                    </span>
                  </div>

                  {/* Animated Pipeline Steps */}
                  <div className="space-y-2">
                    {HERO_STEPS.map((step, i) => {
                      const Icon = step.icon;
                      const isActive = heroStep === i;
                      const isDone = heroStep > i;
                      return (
                        <div key={i} className="relative">
                          <div className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-500",
                            isActive
                              ? "bg-orange-50 border-[#e8572a]/30 shadow-sm"
                              : isDone
                              ? "bg-emerald-50/50 border-emerald-200/60"
                              : "bg-slate-50/60 border-slate-100"
                          )}>
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                              isActive ? "bg-[#e8572a] text-white shadow-sm" : isDone ? "bg-emerald-500 text-white" : "bg-white text-slate-400 border border-slate-200"
                            )}>
                              {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <span className={cn(
                              "text-[12.5px] font-semibold transition-colors duration-300",
                              isActive ? "text-[#0c0e14]" : isDone ? "text-emerald-700" : "text-slate-400"
                            )}>
                              {step.label}
                            </span>
                            {isActive && (
                              <span className="ml-auto font-mono text-[10px] text-[#e8572a] font-bold animate-pulse">
                                ACTIVE
                              </span>
                            )}
                            {isDone && (
                              <span className="ml-auto font-mono text-[10px] text-emerald-600 font-bold">
                                ✓ DONE
                              </span>
                            )}
                          </div>
                          {i < HERO_STEPS.length - 1 && (
                            <div className={cn(
                              "ml-7 w-px h-2 transition-all duration-500",
                              heroStep > i ? "bg-emerald-400" : "bg-slate-200"
                            )} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom status */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">Autonomous Sales Agent</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      LIVE OPERATOR RUNNING
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 2: WHAT IS ENTERPRISE AI DEPLOYMENT ──────────────── */}
        <section id="what-is" className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              {/* Rail node */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">PLATFORM</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  WHAT IS ENTERPRISE AI DEPLOYMENT?
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Your AI Sales Employee, Deployed Into Your Workflow
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  AI Revenue Operator connects to your existing revenue channels and automates the entire inbound sales workflow — from first contact to booked meeting — with an autonomous AI Sales Employee operating 24/7 inside the platform.
                </p>
              </div>

              {/* Flow diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center max-w-5xl">
                {/* Sources */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">REVENUE CHANNELS</p>
                  {['Website', 'Gmail', 'WhatsApp', 'Google Calendar', 'APIs / Webhooks'].map((ch, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e8572a]" />
                      {ch}
                    </div>
                  ))}
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-8 bg-gradient-to-b from-[#e8572a] to-[#e8572a]" />
                    <ArrowRight className="w-5 h-5 text-[#e8572a] rotate-90 lg:rotate-0" />
                    <div className="hidden lg:block w-px h-0" />
                  </div>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">PLATFORM</p>
                  <div className="p-4 rounded-xl border-2 border-[#e8572a]/40 bg-orange-50 text-center">
                    <Bot className="w-8 h-8 text-[#e8572a] mx-auto mb-2" />
                    <p className="text-[13px] font-bold text-[#0c0e14]">AI REVENUE OPERATOR</p>
                    <p className="text-[11px] text-slate-500 mt-1">Platform</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-px h-4 bg-[#e8572a]/40" />
                  </div>
                  <div className="p-4 rounded-xl border-2 border-indigo-300/50 bg-indigo-50 text-center">
                    <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-[13px] font-bold text-[#0c0e14]">AI SALES EMPLOYEE</p>
                    <p className="text-[11px] text-slate-500 mt-1">Autonomous Employee</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-[#e8572a] rotate-90 lg:rotate-0" />
                </div>

                {/* Output */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">OUTPUT</p>
                  {['Qualification + Engagement', 'Follow-up Sequences', 'Meeting Booking', 'Pipeline Intelligence', 'Revenue Attribution'].map((item, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold",
                      i === 2 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200 text-slate-700"
                    )}>
                      <CheckCircle className={cn("w-3.5 h-3.5 shrink-0", i === 2 ? "text-emerald-600" : "text-[#e8572a]")} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 3: WHAT YOUR AI EMPLOYEE DOES ─────────────────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">AI EMPLOYEE</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  CAPABILITIES
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  One AI Employee. An Entire Revenue Workflow.
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  The AI Sales Employee operates every step of your inbound revenue pipeline — autonomously, accurately, and around the clock.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {EMPLOYEE_CAPABILITIES.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", cap.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-mono text-[10px] font-bold text-slate-400">{cap.num}</span>
                          <h3 className="text-[15px] font-bold text-[#0c0e14] group-hover:text-[#e8572a] transition-colors">{cap.title}</h3>
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-600 leading-relaxed">{cap.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 4: AUTONOMOUS REVENUE PIPELINE ────────────────────── */}
        <section id="pipeline" className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">PIPELINE</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  AUTONOMOUS PIPELINE
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  From First Contact to Revenue — Automatically
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  The AI Sales Employee moves every lead through a defined status pipeline. Click any status to understand what happens at each stage.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Primary pipeline */}
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">PRIMARY PIPELINE</p>
                  <div className="space-y-1">
                    {PIPELINE_STATUSES.map((s, i) => (
                      <div key={i}>
                        <button
                          onClick={() => setActiveStatus(i)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer",
                            activeStatus === i
                              ? "border-[#e8572a]/40 bg-orange-50 shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.dot)} />
                          <span className={cn(
                            "font-mono text-[11px] font-bold px-2 py-0.5 rounded border",
                            s.color
                          )}>
                            {s.status}
                          </span>
                          {activeStatus === i && (
                            <ChevronRight className="w-4 h-4 text-[#e8572a] ml-auto" />
                          )}
                        </button>
                        {i < PIPELINE_STATUSES.length - 1 && i !== 4 && (
                          <div className={cn(
                            "ml-5 w-px h-3 transition-colors",
                            activeStatus > i ? "bg-[#e8572a]/30" : "bg-slate-200"
                          )} />
                        )}
                        {/* Special HOT → MEETING_BOOKED node */}
                        {i === 4 && (
                          <div className="ml-5 my-1 pl-4 border-l-2 border-dashed border-slate-200">
                            <p className="font-mono text-[10px] text-slate-400 mb-1">AI proposes meeting slot → Prospect confirms</p>
                            <div className="w-px h-2 bg-[#e8572a]/30 ml-0" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Optional statuses */}
                  <div className="mt-6">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">OPTIONAL STATES</p>
                    <div className="flex flex-wrap gap-2">
                      {OPTIONAL_STATUSES.map((s, i) => (
                        <span key={i} className={cn("font-mono text-[11px] font-bold px-3 py-1.5 rounded-lg border", s.color)}>
                          {s.status}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detail panel */}
                <div className="p-6 rounded-2xl bg-[#0c0e14] text-white border border-slate-800 shadow-xl min-h-[200px] flex flex-col justify-between">
                  <div>
                    <span className={cn(
                      "font-mono text-[12px] font-bold px-3 py-1 rounded border mb-4 inline-block",
                      PIPELINE_STATUSES[activeStatus]?.color || 'bg-slate-700 text-white border-slate-600'
                    )}>
                      {PIPELINE_STATUSES[activeStatus]?.status}
                    </span>
                    <p className="text-slate-300 text-[14px] leading-relaxed mt-3">
                      {PIPELINE_STATUSES[activeStatus]?.desc}
                    </p>

                    {activeStatus === 4 && (
                      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="font-mono text-[11px] text-[#e8572a] font-bold mb-2">MEETING BOOKING FLOW</p>
                        <div className="space-y-1.5 text-[12px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            HOT / QUALIFIED lead detected
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            AI proposes a meeting slot + invite
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Prospect confirms → MEETING_BOOKED
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatus === 6 || activeStatus === 7 ? (
                      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="font-mono text-[11px] text-emerald-400 font-bold mb-1">FOLLOW-UP STOPS</p>
                        <p className="text-[12px] text-slate-400">All automated follow-up sequences are cancelled when a lead reaches WON or LOST status.</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Click any status to explore the pipeline</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 5: FOLLOW-UP ENGINE ─────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">FOLLOW-UP ENGINE</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  AUTOMATED FOLLOW-UP
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Follow Up Until the Conversation Moves Forward
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  A structured 4-step follow-up sequence keeps your pipeline moving without any manual effort. The AI stops automatically when the prospect responds.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Timeline */}
                <div>
                  <div className="space-y-0">
                    {FOLLOW_UP_STEPS.map((step, i) => (
                      <div key={i} className="flex gap-5 relative">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-[#e8572a] text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-sm">
                            {`0${i + 1}`}
                          </div>
                          {i < FOLLOW_UP_STEPS.length - 1 && (
                            <div className="w-px flex-1 bg-[#e8572a]/20 my-1" style={{ minHeight: '32px' }} />
                          )}
                        </div>
                        <div className={cn("pb-6", i === FOLLOW_UP_STEPS.length - 1 && "pb-0")}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#0c0e14] text-[14px]">{step.day}</span>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 font-bold">
                              {step.hours}
                            </span>
                          </div>
                          <p className="text-[12px] font-semibold text-slate-700 mb-0.5">{step.label}</p>
                          <p className="text-[12px] text-slate-500 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules panel */}
                <div className="space-y-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">STOP CONDITIONS</p>
                  {[
                    { icon: MessageSquare, text: 'A reply from the prospect cancels all pending follow-ups.', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                    { icon: Calendar, text: 'Meeting booked stops the follow-up sequence.', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { icon: CheckCircle2, text: 'WON or LOST status stops all follow-up.', color: 'text-teal-600 bg-teal-50 border-teal-100' },
                    { icon: UserCheck, text: 'HUMAN_REVIEW status pauses all automation.', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
                        <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5", item.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className="text-[13px] text-slate-700 leading-relaxed">{item.text}</p>
                      </div>
                    );
                  })}

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[12px] font-semibold text-slate-600 mb-1">After the final step:</p>
                    <p className="text-[13px] text-slate-700">The lead enters <span className="font-mono font-bold text-cyan-700">NURTURE</span> status. A later reply from the prospect can re-trigger the qualification flow.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 6: KNOWLEDGE BASE ────────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">KNOWLEDGE BASE</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                    <span className="h-px w-5 bg-[#e8572a]" />
                    GROUNDED KNOWLEDGE
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                    Give Your AI Employee Your Business Knowledge
                  </h2>
                  <p className="text-slate-600 text-[14px] leading-relaxed">
                    The AI Sales Employee is strictly grounded in the knowledge you provide. It never invents pricing, features, or policies — every response is based on your approved business documents.
                  </p>

                  <div className="space-y-2 pt-4">
                    {['Services & Offerings', 'Pricing & Packages', 'FAQs', 'Policies & Terms', 'Business Documents'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <Book className="w-4 h-4 text-[#e8572a] shrink-0" />
                        <span className="text-[13px] font-semibold text-slate-700">{item}</span>
                        <span className="ml-auto text-[10px] font-mono text-emerald-600 font-bold">UPLOADED</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grounding visual */}
                <div className="flex flex-col items-center gap-4">
                  {[
                    { label: 'Business Knowledge', icon: Building2, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: 'Knowledge Base', icon: Book, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                    { label: 'AI Sales Employee', icon: Bot, color: 'bg-orange-50 border-orange-200 text-[#e8572a]' },
                    { label: 'Grounded Response', icon: CheckCircle2, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                  ].map((node, i) => {
                    const Icon = node.icon;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 w-full max-w-xs">
                        <div className={cn("w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border font-semibold text-[13px]", node.color)}>
                          <Icon className="w-5 h-5 shrink-0" />
                          {node.label}
                        </div>
                        {i < 3 && <div className="w-px h-5 bg-[#e8572a]/30" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 7: BUSINESS RULES ────────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">BUSINESS RULES</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  CONFIGURATION
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Your Business Sets the Rules. Your AI Employee Executes Them.
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  Every qualification, follow-up, meeting, and handoff decision is driven by rules your business defines — not by the AI guessing.
                </p>
              </div>

              {/* AI Config Console */}
              <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-[#0c0e14] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#e8572a]" />
                    <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">AI EMPLOYEE CONFIGURATION</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: 'Budget Threshold', value: 'Configurable — your criteria', icon: Target },
                    { label: 'Timeline Requirement', value: 'Configurable — your criteria', icon: Clock },
                    { label: 'Requirements Check', value: 'Configurable — your criteria', icon: ListFilter },
                    { label: 'Intent Signals', value: 'Extracted from conversation context', icon: Sparkles },
                    { label: 'HOT Lead Score', value: '≥ 70 / 100', icon: Flame },
                    { label: 'Follow-up Rules', value: 'Day 1 / 3 / 7 / 14', icon: RefreshCw },
                    { label: 'Meeting Rules', value: 'Propose on HOT/QUALIFIED', icon: Calendar },
                    { label: 'Human Handoff', value: 'Complex / sensitive requests', icon: UserCheck },
                  ].map((rule, i) => {
                    const Icon = rule.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                        <Icon className="w-4 h-4 text-[#e8572a] shrink-0" />
                        <span className="text-[13px] font-semibold text-slate-800 flex-1">{rule.label}</span>
                        <span className="font-mono text-[11px] text-slate-500">{rule.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 8: HUMAN-IN-THE-LOOP ────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">HUMAN-IN-THE-LOOP</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  HUMAN CONTROL
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Autonomous When It Should Be. Human When It Matters.
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  The AI Sales Employee operates autonomously for standard qualification conversations. Complex or sensitive requests are escalated immediately — the AI pauses and a human takes full control.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
                {/* Autonomous flow */}
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-4">AUTONOMOUS MODE</p>
                  <div className="space-y-2">
                    {[
                      'AI Sales Employee active',
                      'Normal inbound conversation',
                      'Qualification in progress',
                      'Follow-up running',
                      'Meeting proposed → Confirmed',
                      'Lead → MEETING_BOOKED',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        {i < 5 && <div className="w-px h-3 bg-emerald-300 ml-3.5" />}
                        <div className={cn(
                          "flex items-center gap-2",
                          i === 0 && "mt-0"
                        )}>
                          {i > 0 && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {i === 0 && <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span className={cn("text-[12.5px] font-semibold", i === 0 ? "text-emerald-800" : "text-emerald-700")}>{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Human handoff flow */}
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-4">HUMAN HANDOFF MODE</p>
                  <div className="space-y-2">
                    {[
                      'AI Sales Employee active',
                      'Complex / sensitive request detected',
                      'Lead → HUMAN_REVIEW',
                      'AI automation pauses',
                      'Human takes over conversation',
                      'AI resumes when reactivated',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        {i < 5 && <div className="w-px h-3 bg-amber-300 ml-3.5" />}
                        <div className="flex items-center gap-2">
                          {i === 0 && <Bot className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          {i === 1 && <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          {i === 2 && <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          {i === 3 && <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {i === 4 && <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          {i === 5 && <RefreshCw className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          <span className={cn("text-[12.5px] font-semibold", i === 2 ? "text-amber-800 font-bold" : "text-amber-700")}>{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 9: INTEGRATIONS ──────────────────────────────────────── */}
        <section id="integrations" className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">INTEGRATIONS</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  CONNECTED CHANNELS
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Works With Your Existing Revenue Channels
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  Connect the AI Sales Employee to the channels your business already uses. No migration, no rebuild.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {INTEGRATIONS.map((int, i) => {
                  const Icon = int.icon;
                  const isSoon = int.status === 'soon';
                  return (
                    <div key={i} className={cn(
                      "p-5 rounded-2xl border transition-all hover:shadow-md",
                      isSoon ? "bg-orange-50/50 border-orange-200 border-dashed" : "bg-white border-slate-200"
                    )}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", int.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSoon ? (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                            COMING SOON
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            LIVE
                          </span>
                        )}
                      </div>
                      <h3 className="text-[14px] font-bold text-[#0c0e14] mb-2">{int.name}</h3>
                      <p className="text-[12px] text-slate-600 leading-relaxed">{int.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 10: RELIABILITY ──────────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">RELIABILITY</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  RESILIENCE ARCHITECTURE
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Built for Real-World Revenue Operations
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  Every component of the pipeline is designed to handle real-world failures gracefully — retrying, recovering, and protecting your lead data automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {/* Retry logic */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <RefreshCw className="w-5 h-5 text-[#e8572a]" />
                    <h3 className="font-bold text-[14px] text-[#0c0e14]">Automatic Retry</h3>
                  </div>
                  <div className="space-y-2 font-mono text-[12px]">
                    <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-700">
                      429 / 5xx / Connection Failure
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
                      Automatic Retry
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                      500ms → 1s → 2s + jitter
                    </div>
                  </div>
                </div>

                {/* OAuth recovery */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-[#e8572a]" />
                    <h3 className="font-bold text-[14px] text-[#0c0e14]">Google OAuth Recovery</h3>
                  </div>
                  <div className="space-y-2 font-mono text-[12px]">
                    <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-700">
                      Google OAuth Failure
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
                      Token Recovery Attempt
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
                      RECONNECT_REQUIRED if unresolvable
                    </div>
                  </div>
                </div>

                {/* Webhook DLQ */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <Webhook className="w-5 h-5 text-[#e8572a]" />
                    <h3 className="font-bold text-[14px] text-[#0c0e14]">Webhook Processing</h3>
                  </div>
                  <div className="space-y-2 font-mono text-[12px]">
                    {['Webhook → PENDING', 'Processing', 'Retry on failure', 'DEAD LETTER QUEUE if unresolvable'].map((step, i) => (
                      <div key={i}>
                        <div className={cn(
                          "px-3 py-2 rounded-lg border",
                          i === 3 ? "bg-red-50 border-red-100 text-red-700" : "bg-slate-50 border-slate-100 text-slate-600"
                        )}>
                          {step}
                        </div>
                        {i < 3 && <div className="flex justify-center my-1"><ArrowRight className="w-4 h-4 text-slate-400 rotate-90" /></div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rate limiting + idempotency */}
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-[#e8572a]" />
                      <h3 className="font-bold text-[14px] text-[#0c0e14]">Rate Limiting</h3>
                    </div>
                    <div className="font-mono text-[12px] space-y-2">
                      <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">Distributed Requests</div>
                      <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-slate-400 rotate-90" /></div>
                      <div className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">Redis Rate Limiting</div>
                      <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-slate-400 rotate-90" /></div>
                      <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">60 requests / minute / IP</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-[#e8572a]" />
                      <h3 className="font-bold text-[13px] text-[#0c0e14]">Idempotency Protection</h3>
                    </div>
                    <p className="text-[12px] text-slate-600">Duplicate webhook events are detected by event ID and rejected — preventing double-processing of any lead or action.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 11: SECURITY ──────────────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">SECURITY</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  SECURITY ARCHITECTURE
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Security Built Into the Revenue Pipeline
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  Every layer of the AI Revenue Operator platform is built with security as a default — not an afterthought. These are the implemented capabilities, not aspirational claims.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {SECURITY_CAPABILITIES.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#e8572a]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                          {cap.badge}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold text-[#0c0e14] mb-2">{cap.title}</h4>
                      <p className="text-[12px] text-slate-600 leading-relaxed">{cap.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 12: COMMAND CENTER ───────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">COMMAND CENTER</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  OPERATIONS CONSOLE
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Your AI Employee. One Command Center.
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  Every lead, conversation, meeting, and AI action is visible in a single real-time operations console.
                </p>
              </div>

              {/* Dashboard mock */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-w-5xl">
                {/* Topbar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-slate-900">Revenue Operations Center</h3>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">AI Activity</span>
                    <span className="font-mono text-[11px] font-bold text-indigo-600">24 actions today</span>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100">
                  {[
                    { label: 'Active Leads', value: '47', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Hot Leads', value: '12', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Pipeline Value', value: '₹18.4L', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'Meetings Booked', value: '8', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
                  ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                      <div key={i} className="p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", kpi.bg, kpi.color)}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-xl font-extrabold text-slate-950">{kpi.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Main content area mock */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-100">
                  {/* Pipeline distribution */}
                  <div className="p-5 bg-white lg:col-span-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Lead Status Distribution</p>
                    <div className="space-y-2.5">
                      {[
                        { status: 'HOT', pct: 25, color: 'bg-rose-500' },
                        { status: 'QUALIFYING', pct: 35, color: 'bg-violet-500' },
                        { status: 'QUALIFIED', pct: 20, color: 'bg-emerald-500' },
                        { status: 'NEW', pct: 15, color: 'bg-blue-500' },
                        { status: 'OTHER', pct: 5, color: 'bg-slate-400' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-slate-500 w-20 shrink-0">{item.status}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 w-8 text-right">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trend chart mock */}
                  <div className="p-5 bg-white lg:col-span-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">7-Day Lead Trend</p>
                    <div className="flex items-end gap-2 h-20">
                      {[12, 18, 14, 22, 19, 27, 24].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-[#e8572a]/80 transition-all"
                            style={{ height: `${(val / 27) * 100}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-400">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i}>{d}</span>
                      ))}
                    </div>
                  </div>

                  {/* Integration health + NBA */}
                  <div className="p-5 bg-white lg:col-span-1 space-y-5">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Integration Health</p>
                      {[
                        { name: 'Gmail', status: 'Connected', ok: true },
                        { name: 'WhatsApp', status: 'Connected', ok: true },
                        { name: 'Calendar', status: 'Connected', ok: true },
                      ].map((int, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                          <span className="text-[12px] font-semibold text-slate-700">{int.name}</span>
                          <span className={cn("text-[10px] font-mono font-bold", int.ok ? "text-emerald-600" : "text-red-500")}>
                            {int.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Next Best Action</p>
                      <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                        <p className="text-[12px] font-semibold text-[#e8572a]">3 HOT leads awaiting meeting confirmation</p>
                        <p className="text-[11px] text-slate-600 mt-1">AI will propose slots automatically.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 13: REVENUE INTELLIGENCE ────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">INTELLIGENCE</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                    <span className="h-px w-5 bg-[#e8572a]" />
                    REVENUE INTELLIGENCE
                  </span>
                  <h2 className="mt-2 text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                    Don't Just Automate Sales. Measure the Revenue It Creates.
                  </h2>
                  <p className="mt-4 text-slate-600 text-[14px] leading-relaxed">
                    Every lead, qualification, meeting, and deal is tracked — giving you full visibility into source attribution, pipeline value, win rates, and revenue created by the AI Sales Employee.
                  </p>

                  <div className="mt-8 space-y-3">
                    {[
                      { label: 'Pipeline Value', desc: 'Estimated value of active qualified leads' },
                      { label: 'Closed Revenue', desc: 'Actual revenue from WON deals' },
                      { label: 'Channel Attribution', desc: 'Revenue traced back to Website, Gmail, WhatsApp' },
                      { label: 'Win Rates', desc: 'Qualified-to-WON conversion tracking' },
                      { label: 'Revenue Attribution', desc: 'Which channel and source drives revenue' },
                      { label: 'Next Best Action', desc: 'AI-recommended action for the highest-value leads' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-[#e8572a] mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[13px] font-bold text-slate-800">{item.label}</span>
                          <span className="text-[13px] text-slate-500"> — {item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue funnel */}
                <div className="flex flex-col gap-1 max-w-sm">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">REVENUE FUNNEL</p>
                  {[
                    { label: 'Lead Source', width: '100%', color: 'bg-blue-500' },
                    { label: 'Lead', width: '88%', color: 'bg-indigo-500' },
                    { label: 'Qualification', width: '72%', color: 'bg-violet-500' },
                    { label: 'Meeting', width: '55%', color: 'bg-purple-500' },
                    { label: 'Opportunity', width: '40%', color: 'bg-rose-500' },
                    { label: 'Won', width: '28%', color: 'bg-emerald-500' },
                    { label: 'Revenue', width: '20%', color: 'bg-teal-600' },
                  ].map((stage, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-slate-500 w-24 shrink-0">{stage.label}</span>
                      <div className="flex-1 flex">
                        <div
                          className={cn("h-8 rounded-lg flex items-center px-3 transition-all duration-500", stage.color)}
                          style={{ width: stage.width }}
                        >
                          <span className="text-white text-[10px] font-bold font-mono whitespace-nowrap">{stage.width}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 14: DEPLOYMENT ARCHITECTURE ─────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">ARCHITECTURE</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  PRODUCTION ARCHITECTURE
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  A Revenue System Built for Production
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  The AI Revenue Operator platform is engineered for production-grade reliability — multi-tenant, containerized, and designed to scale with your pipeline.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Architecture diagram */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-[12px]">
                  <div className="space-y-3">
                    {/* Sources */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {['Website', 'Gmail', 'WhatsApp', 'Calendar', 'APIs'].map((s, i) => (
                        <div key={i} className="px-2 py-2 rounded-lg bg-white border border-slate-200 text-center text-[10px] font-bold text-slate-700">
                          {s}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <div className="w-px h-5 bg-[#e8572a]/40" />
                    </div>

                    <div className="px-5 py-3.5 rounded-xl bg-[#e8572a] text-white text-center font-bold">
                      AI REVENUE OPERATOR
                    </div>

                    <div className="flex justify-center">
                      <div className="w-px h-5 bg-[#e8572a]/40" />
                    </div>

                    <div className="px-5 py-3.5 rounded-xl bg-indigo-600 text-white text-center font-bold">
                      AI SALES EMPLOYEE
                    </div>

                    <div className="flex justify-center">
                      <div className="w-px h-5 bg-slate-300" />
                    </div>

                    <div className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-center text-slate-700 font-semibold text-[11px]">
                      Qualification + Follow-up + Meetings
                    </div>

                    <div className="flex justify-center">
                      <div className="w-px h-5 bg-slate-300" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-center text-[11px] font-bold text-slate-700">PostgreSQL</div>
                      <div className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-center text-[11px] font-bold text-slate-700">Redis</div>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-px h-5 bg-slate-300" />
                    </div>

                    <div className="px-5 py-3 rounded-xl bg-teal-600 text-white text-center font-bold text-[11px]">
                      Revenue Intelligence
                    </div>
                  </div>
                </div>

                {/* Stack */}
                <div className="space-y-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">TECHNOLOGY STACK</p>
                  <p className="text-[13px] text-slate-600">
                    Built on a modern, production-grade stack — designed for reliability, multi-tenancy, and horizontal scale. Business value leads; technology serves it.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Java 21', desc: 'Backend runtime', color: 'bg-amber-50 border-amber-100 text-amber-800' },
                      { label: 'Spring Boot', desc: 'API framework', color: 'bg-green-50 border-green-100 text-green-800' },
                      { label: 'PostgreSQL', desc: 'Relational data', color: 'bg-blue-50 border-blue-100 text-blue-800' },
                      { label: 'Redis', desc: 'Caching & rate limiting', color: 'bg-red-50 border-red-100 text-red-800' },
                      { label: 'Next.js', desc: 'Frontend', color: 'bg-slate-50 border-slate-200 text-slate-700' },
                      { label: 'Docker', desc: 'Containerised deployment', color: 'bg-sky-50 border-sky-100 text-sky-800' },
                    ].map((tech, i) => (
                      <div key={i} className={cn("p-3 rounded-xl border text-[12px] font-semibold", tech.color)}>
                        <span className="font-bold">{tech.label}</span>
                        <span className="block text-[11px] font-normal opacity-70 mt-0.5">{tech.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 15: FULLY MANAGED ────────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">MANAGED PLATFORM</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  FULLY MANAGED
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  A Fully Managed AI Revenue Operation
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  AI Revenue Operator is a platform — not a service that requires human operators on our end. You configure and control your AI Sales Employee through the platform's tools, rules, and knowledge base.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    icon: Sliders,
                    title: 'Configuration',
                    desc: 'Set qualification rules, thresholds, follow-up timing, and meeting booking rules through the platform UI.',
                    color: 'bg-blue-50 text-blue-600 border-blue-100',
                  },
                  {
                    icon: Book,
                    title: 'Business Knowledge',
                    desc: 'Upload services, pricing, FAQs, and policies. The AI employee uses this as its single source of truth.',
                    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                  },
                  {
                    icon: Webhook,
                    title: 'Integrations',
                    desc: 'Connect channels through the Integrations panel. OAuth, HMAC verification, and token management handled automatically.',
                    color: 'bg-violet-50 text-violet-600 border-violet-100',
                  },
                  {
                    icon: Zap,
                    title: 'Automation',
                    desc: 'Once configured, the AI employee operates fully autonomously — qualification, follow-up, booking — without manual input.',
                    color: 'bg-amber-50 text-amber-600 border-amber-100',
                  },
                  {
                    icon: Activity,
                    title: 'Monitoring',
                    desc: 'Track AI activity, pipeline health, integration status, and lead progress in the Command Center.',
                    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                  },
                  {
                    icon: UserCheck,
                    title: 'Human Control',
                    desc: 'You can review, override, or escalate any conversation. HUMAN_REVIEW mode pauses AI activity immediately.',
                    color: 'bg-rose-50 text-rose-600 border-rose-100',
                  },
                ].map((area, i) => {
                  const Icon = area.icon;
                  return (
                    <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                      <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center mb-4", area.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-[14px] font-bold text-[#0c0e14] mb-2">{area.title}</h3>
                      <p className="text-[12.5px] text-slate-600 leading-relaxed">{area.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 16: ENTERPRISE ONBOARDING ───────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">ONBOARDING</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  DEPLOYMENT PROCESS
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  From Setup to Live AI Employee
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {ONBOARDING_STEPS.map((step, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#e8572a]/40 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[24px] font-bold text-[#e8572a] leading-none">{step.num}</span>
                    </div>
                    <h3 className="font-mono text-[12px] font-bold text-[#0c0e14] uppercase tracking-wider mb-2 group-hover:text-[#e8572a] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 17: WHY AI EMPLOYEE ──────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">COMPARISON</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  WHY AI EMPLOYEE?
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  More Than Automation. An AI Employee for Your Revenue Pipeline.
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
                {/* Traditional */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 opacity-80">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">TRADITIONAL WORKFLOW</p>
                  <div className="space-y-0">
                    {['Lead arrives', 'Sits in sales inbox', 'Manual qualification (if it happens)', 'Manual follow-up (if remembered)', 'Manual scheduling', 'Manual reporting'].map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-bold">
                            {i + 1}
                          </div>
                          {i < 5 && <div className="w-px h-4 bg-slate-200" />}
                        </div>
                        <p className={cn("text-[13px] py-1.5", i === 0 ? "font-semibold text-slate-800" : "text-slate-500")}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Revenue Operator */}
                <div className="p-6 rounded-2xl bg-orange-50 border border-[#e8572a]/30">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e8572a] mb-4">AI REVENUE OPERATOR</p>
                  <div className="space-y-0">
                    {[
                      'Lead arrives via any channel',
                      'AI Sales Employee captures instantly',
                      'Automated qualification (always)',
                      'Automated follow-up sequence',
                      'AI proposes & books meeting',
                      'Revenue Intelligence generated',
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-7 h-7 rounded-lg bg-[#e8572a] text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          {i < 5 && <div className="w-px h-4 bg-[#e8572a]/30" />}
                        </div>
                        <p className={cn("text-[13px] py-1.5 font-semibold", i === 0 ? "text-[#0c0e14]" : "text-slate-700")}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 18: VOICE AI ROADMAP ─────────────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">ROADMAP</span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  WHAT'S NEXT
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  The AI Employee Is Expanding Beyond Text
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  The AI Sales Employee currently operates across text-based channels. Voice AI is the next planned expansion — it is not currently available.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 max-w-2xl">
                {[
                  { name: 'Website', status: 'Live', icon: Globe, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                  { name: 'Gmail', status: 'Live', icon: Mail, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                  { name: 'WhatsApp', status: 'Live', icon: MessageCircle, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                  { name: 'Voice AI', status: 'Coming Soon', icon: Phone, color: 'bg-orange-50 border-orange-200 text-orange-700 border-dashed' },
                ].map((ch, i) => {
                  const Icon = ch.icon;
                  const isSoon = ch.status === 'Coming Soon';
                  return (
                    <div key={i} className={cn(
                      "flex items-center gap-3 px-5 py-3 rounded-xl border text-[13px] font-semibold",
                      ch.color
                    )}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{ch.name}</span>
                      <span className={cn(
                        "font-mono text-[10px] px-2 py-0.5 rounded-full border font-bold",
                        isSoon
                          ? "bg-orange-100 border-orange-200 text-orange-700"
                          : "bg-emerald-100 border-emerald-200 text-emerald-700"
                      )}>
                        {ch.status === 'Live' ? '✓ LIVE' : 'COMING SOON'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 max-w-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-bold text-amber-800 mb-1">Voice AI — Roadmap Item</p>
                    <p className="text-[12.5px] text-amber-700 leading-relaxed">
                      Voice AI is a planned future capability for the AI Sales Employee. It is not currently available on the platform. No confirmed release date has been announced.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION 19: FAQ ───────────────────────────────────────────────── */}
        <section id="faq" className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">FAQ</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
                {/* Left */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                      <span className="h-px w-5 bg-[#e8572a]" />
                      FREQUENTLY ASKED QUESTIONS
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] leading-[1.18]">
                      Everything you need to know.
                    </h2>
                    <p className="text-slate-600 text-[14px] leading-relaxed">
                      Clear, honest answers about Enterprise AI Deployment, the AI Sales Employee, and how the platform works in practice.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0c0e14] text-white border border-slate-800 shadow-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Enterprise Questions?
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Have integration, compliance, or architecture requirements? Get in touch directly.
                    </p>
                    <a
                      href="mailto:engineering@operator.ai"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#e8572a] hover:underline font-mono"
                    >
                      <span>engineering@operator.ai</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Right: Accordion */}
                <div className="lg:col-span-7 divide-y divide-slate-200/80 border-t border-b border-slate-200/80">
                  {FAQS.map((faq, i) => {
                    const isOpen = activeFaq === i;
                    return (
                      <div key={i} className="py-4 sm:py-5 transition-colors group">
                        <button
                          onClick={() => setActiveFaq(isOpen ? null : i)}
                          className="w-full text-left flex items-start justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3.5">
                            <span className="font-mono text-xs font-bold text-slate-400 pt-0.5 select-none shrink-0 group-hover:text-[#e8572a] transition-colors">
                              0{i + 1}
                            </span>
                            <span className={cn(
                              "text-[14px] sm:text-[15px] font-semibold transition-colors leading-snug",
                              isOpen ? "text-[#e8572a]" : "text-slate-900 group-hover:text-slate-700"
                            )}>
                              {faq.q}
                            </span>
                          </div>

                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5",
                            isOpen
                              ? "bg-[#e8572a] border-[#e8572a] text-white"
                              : "border-slate-300 text-slate-500 group-hover:border-slate-400 bg-white"
                          )}>
                            {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="pt-3 pl-8 sm:pl-9 pr-4 text-[13px] sm:text-[13.5px] text-slate-600 leading-relaxed space-y-2 animate-in fade-in-50 duration-200">
                            <p>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="bg-white/80 py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative flex flex-col items-center overflow-hidden rounded-[28px] bg-[#0c0e14] px-6 py-16 text-center md:px-16 md:py-20 shadow-2xl">
              {/* Radial glow */}
              <div className="pointer-events-none absolute inset-0" style={{
                background: 'radial-gradient(ellipse 65% 55% at 50% 20%, rgba(232,87,42,0.22), transparent 75%)'
              }} aria-hidden="true" />

              <div className="relative z-10 flex w-full flex-col items-center">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  Deploy Your AI Sales Employee
                </span>

                <h2 className="mt-4 max-w-[720px] text-[22px] sm:text-[28px] md:text-[32px] font-bold leading-[1.15] tracking-[-0.025em] text-white">
                  Deploy Your AI Sales Employee
                </h2>

                <p className="mt-4 max-w-[600px] text-[14px] sm:text-[15px] leading-relaxed text-slate-300">
                  Turn your inbound sales workflow into an autonomous revenue operation that works around the clock.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8572a] px-7 py-3.5 text-[14px] font-bold uppercase tracking-wider font-mono text-white transition-all hover:bg-[#d04920] shadow-lg shadow-[#e8572a]/30 active:scale-[0.98]"
                  >
                    Book Enterprise Demo →
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-[14px] font-semibold font-mono text-white transition-all hover:bg-white/15"
                  >
                    Start a Pilot
                  </Link>
                </div>

                <p className="mt-6 font-mono text-[11px] text-slate-400">
                  AI Revenue Operator — Your 24/7 AI Sales Employee
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="relative z-30 bg-white border-t border-slate-200 text-[#0c0e14]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-6 xl:gap-8">

            {/* Brand */}
            <div className="space-y-4 sm:col-span-2 md:col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2">
                <img src="/images/op-logo-arc.png" alt="Operator" className="h-5 w-5 object-contain shrink-0" />
                <span className="text-[17px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
                  operator<span className="text-[#e8572a]">.</span>
                </span>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed max-w-[260px]">
                Autonomous AI Sales Employee for B2B agencies and service firms. Capture, qualify, follow up, and book meetings — 24/7.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">PRODUCT</h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Enterprise AI Deployment', href: '/enterprise-ai-deployment' },
                  { label: 'Live Command Center', href: '/live-command-center' },
                  { label: 'AI Sales Agent Builder', href: '/ai-sales-agent-builder' },
                  { label: 'Autonomous Inbound Calling', href: '/autonomous-inbound-calling' },
                  { label: 'Call Scrubber & Replay', href: '/call-scrubber-replay' },
                  { label: 'AI Sales Employee', href: '#what-is' },
                  { label: 'Revenue Pipeline', href: '#pipeline' },
                  { label: 'Knowledge Base', href: '#' },
                  { label: 'Integrations', href: '#integrations' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">FEATURES</h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Lead Qualification', href: '#what-is' },
                  { label: 'Follow-up Engine', href: '#' },
                  { label: 'Meeting Booking', href: '#' },
                  { label: 'Human Handoff', href: '#' },
                  { label: 'Revenue Intelligence', href: '#' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">RESOURCES</h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'FAQ', href: '#faq' },
                  { label: 'Security', href: '#' },
                  { label: 'Integrations', href: '#integrations' },
                  { label: 'Pipeline Guide', href: '#pipeline' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">COMPANY</h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Sign in', href: '/login' },
                  { label: 'Book Demo', href: '/register' },
                  { label: 'Contact', href: 'mailto:engineering@operator.ai' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-200 mt-14 pt-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-[12px] text-slate-600">
              <div className="font-mono text-[11.5px] text-slate-600">
                © 2026 AI Revenue Technologies Pvt. Ltd. · New Delhi, India ·{' '}
                <a href="mailto:engineering@operator.ai" className="hover:text-slate-900 transition-colors font-semibold">engineering@operator.ai</a>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Link href="/" className="hover:text-[#e8572a] font-medium transition-colors">Privacy Policy</Link>
                <span className="text-slate-400">·</span>
                <Link href="/" className="hover:text-[#e8572a] font-medium transition-colors">Terms of Service</Link>
                <span className="text-slate-400">·</span>
                <Link href="/" className="hover:text-[#e8572a] font-medium transition-colors">Trust Center</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
