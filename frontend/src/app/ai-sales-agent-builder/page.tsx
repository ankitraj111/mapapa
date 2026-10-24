'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Book,
  Target,
  Clock,
  UserCheck,
  Workflow,
  Play,
  Settings,
  Check,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Layers,
  MessageSquare,
  RefreshCw,
  Sliders,
  Terminal,
  Menu,
  X,
  Mic,
  Volume2,
  Globe,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────── helpers ─────────────────────── */

const FLOW_NODES = [
  'AGENT IDENTITY',
  'BRAND VOICE',
  'BUSINESS KNOWLEDGE',
  'QUALIFICATION RULES',
  'FOLLOW-UP RULES',
  'HUMAN HANDOFF',
  'REVENUE WORKFLOW',
];

const PIPELINE_NODES = [
  { label: 'LEAD', desc: 'Inbound contact via website, Gmail or WhatsApp', color: 'bg-slate-400' },
  { label: 'AI RESPONSE', desc: 'Instant, branded reply grounded in your knowledge base', color: 'bg-blue-400' },
  { label: 'QUALIFICATION', desc: 'Budget · Timeline · Requirements · Intent analysis', color: 'bg-violet-400' },
  { label: '0–100 SCORE', desc: 'Automated lead scoring based on qualification signals', color: 'bg-amber-400' },
  { label: 'NEXT BEST ACTION', desc: 'Auto-select: follow-up, meeting proposal, or escalate', color: 'bg-orange-400' },
  { label: 'FOLLOW-UP', desc: 'Scheduled drip cadence (Day 1 / 3 / 7 / 14)', color: 'bg-pink-400' },
  { label: 'MEETING', desc: 'Google Calendar + Meet link sent automatically', color: 'bg-emerald-400' },
  { label: 'REVENUE', desc: 'Qualified, scheduled opportunity handed to your team', color: 'bg-[#e8572a]' },
];

const TONE_PILLS = ['Professional', 'Friendly', 'Consultative', 'Concise', 'Conversational'];

const LENGTH_OPTS = ['Brief', 'Standard', 'Detailed'];
const GREETING_OPTS = ['Warm', 'Professional', 'Direct'];
const OBJECTION_OPTS = [
  'Acknowledge then redirect',
  'Empathize then qualify',
  'Direct challenge',
];

const KNOWLEDGE_ITEMS = [
  { label: 'Services & Offerings', loaded: true },
  { label: 'Pricing & Packages', loaded: true },
  { label: 'FAQs', loaded: true },
  { label: 'Policies & Terms', loaded: true },
  { label: 'Case Studies / Documents', loaded: true },
];

const VOICE_CARDS = [
  { icon: Volume2, label: 'Voice Personality', desc: 'Tune the energy, warmth, and pacing of your AI employee\'s voice persona.' },
  { icon: Globe, label: 'Indian Languages', desc: 'Support for Hindi, Hinglish, and regional English dialects.' },
  { icon: Mic, label: 'Indian Accents', desc: 'Accent-aware voice synthesis tuned for Indian business conversations.' },
  { icon: Sliders, label: 'Response Speed', desc: 'Control how quickly the agent starts speaking after a prospect pause.' },
  { icon: RefreshCw, label: 'Interruption Handling', desc: 'Graceful handling of mid-sentence interruptions and clarifying questions.' },
  { icon: Phone, label: 'Call Behavior', desc: 'Opening lines, hold phrases, and call-wrap-up scripts.' },
];

/* ─────────────────────── page ─────────────────────── */

export default function AISalesAgentBuilderPage() {
  /* hero flow animation */
  const [activeNode, setActiveNode] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveNode((n) => (n + 1) % FLOW_NODES.length), 1500);
    return () => clearInterval(id);
  }, []);

  /* pipeline animation */
  const [activePipe, setActivePipe] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActivePipe((n) => (n + 1) % PIPELINE_NODES.length), 1800);
    return () => clearInterval(id);
  }, []);

  /* brand voice state */
  const [selectedTone, setSelectedTone] = useState('Consultative');
  const [selectedLength, setSelectedLength] = useState('Standard');
  const [selectedGreeting, setSelectedGreeting] = useState('Warm');
  const [selectedObjection, setSelectedObjection] = useState('Acknowledge then redirect');
  const [formalSlider, setFormalSlider] = useState(35);

  /* mobile nav */
  const [mobileOpen, setMobileOpen] = useState(false);

  /* sandbox */
  const [sandboxMsg, setSandboxMsg] = useState('');

  return (
    <div className="min-h-screen bg-[#f7f8fb] font-[\'Space_Grotesk\',sans-serif]">
      {/* ── Announcement bar ── */}
      <aside className="relative z-[210] flex h-9 items-center justify-center gap-2 overflow-hidden whitespace-nowrap bg-[#0c0e14] px-4 text-[12.5px] font-medium text-white">
        <span className="font-semibold text-[#e8572a]">New:</span>
        <span>AI Revenue Operator 2.0 — Autonomous 24/7 AI Sales Employee →</span>
        <Link href="/register" className="ml-1 underline decoration-[#e8572a] hover:text-[#e8572a] font-semibold">
          Deploy Free
        </Link>
      </aside>

      {/* ── Sticky nav ── */}
      <header className="sticky top-0 z-[200] h-[72px] border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-5 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <img src="/images/op-logo-arc.png" alt="Operator" className="h-6 w-6 object-contain" />
            <span className="text-[18px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
              operator<span className="text-[#e8572a]">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 xl:gap-2 lg:flex text-[13px] font-medium text-slate-600">
            <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Home</Link>
            <Link href="/enterprise-ai-deployment" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Enterprise Deployment</Link>
            <Link href="/ai-sales-agent-builder" className="rounded-full px-3 py-1.5 bg-orange-50 text-[#e8572a] border border-orange-200 font-semibold">Agent Builder</Link>
            <Link href="/live-command-center" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Command Center</Link>
            <Link href="/autonomous-inbound-calling" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Inbound Calling</Link>
            <Link href="/call-scrubber-replay" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Call Scrubber</Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="px-3 py-2 text-[14px] font-medium text-slate-700">Sign in</Link>
            <Link href="/register" className="rounded-full bg-[#e8572a] px-5 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920]">
              Book Demo
            </Link>
          </div>

          <button className="lg:hidden p-2 text-slate-700" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-[72px] z-[199] border-b border-slate-200 bg-white px-5 py-4 flex flex-col gap-3 text-[14px] font-medium text-slate-700 shadow-lg">
            <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/enterprise-ai-deployment" onClick={() => setMobileOpen(false)}>Enterprise Deployment</Link>
            <Link href="/ai-sales-agent-builder" onClick={() => setMobileOpen(false)} className="text-[#e8572a] font-semibold">Agent Builder</Link>
            <Link href="/live-command-center" onClick={() => setMobileOpen(false)}>Live Command Center</Link>
            <Link href="/autonomous-inbound-calling" onClick={() => setMobileOpen(false)}>Autonomous Inbound Calling</Link>
            <Link href="/call-scrubber-replay" onClick={() => setMobileOpen(false)}>Call Scrubber &amp; Replay</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-full bg-[#e8572a] px-5 py-2.5 text-[14px] font-semibold text-white text-center">Book Demo</Link>
          </div>
        )}
      </header>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75 overflow-hidden">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-20 md:py-28">
            {/* Rail dot */}
            <div className="flex items-center gap-2.5 mb-10 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">AI SALES AGENT BUILDER</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              {/* Left */}
              <div>
                {/* Eyebrow */}
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">AI Sales Agent Builder</span>
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-[#0c0e14] leading-[1.1] mb-6">
                  Build an AI Sales Employee That Sounds Like{' '}
                  <span className="text-[#e8572a]">Your Business</span>
                </h1>

                <p className="text-slate-600 text-[15px] leading-relaxed mb-8 max-w-[520px]">
                  Configure your AI Sales Employee around your brand voice, business knowledge,
                  qualification rules, and revenue workflow — then deploy it across every inbound channel in minutes.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="rounded-full bg-[#e8572a] px-6 py-3 text-[14px] font-semibold text-white shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920] flex items-center gap-2"
                  >
                    Build Your AI Agent <ArrowRight size={15} />
                  </Link>
                  <a
                    href="#configuration"
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-[13.5px] font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                  >
                    Explore the Configuration <ChevronRight size={14} />
                  </a>
                </div>
              </div>

              {/* Right — animated flow console */}
              <div className="hidden lg:flex justify-center">
                <div className="w-[300px] rounded-2xl bg-[#0c0e14] border border-slate-700/50 shadow-2xl p-5">
                  <div className="flex items-center gap-2 mb-5 border-b border-slate-700/50 pb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    <span className="ml-2 font-mono text-[11px] text-slate-400 uppercase tracking-wider">agent.config</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {FLOW_NODES.map((node, i) => (
                      <div
                        key={node}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-500',
                          i === activeNode
                            ? 'bg-[#e8572a]/15 border border-[#e8572a]/30'
                            : i < activeNode
                            ? 'bg-emerald-950/40 border border-emerald-800/20'
                            : 'bg-slate-800/40 border border-transparent'
                        )}
                      >
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0 transition-colors duration-500',
                            i === activeNode
                              ? 'bg-[#e8572a] shadow-[0_0_6px_#e8572a]'
                              : i < activeNode
                              ? 'bg-emerald-400'
                              : 'bg-slate-600'
                          )}
                        />
                        <span
                          className={cn(
                            'font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-500',
                            i === activeNode
                              ? 'text-[#e8572a]'
                              : i < activeNode
                              ? 'text-emerald-400'
                              : 'text-slate-500'
                          )}
                        >
                          {node}
                        </span>
                        {i < activeNode && (
                          <Check size={11} className="ml-auto text-emerald-400 shrink-0" />
                        )}
                        {i === activeNode && (
                          <span className="ml-auto font-mono text-[9px] text-[#e8572a] animate-pulse">CONFIGURING</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ S1 — AGENT IDENTITY ══════════════════════ */}
      <section id="configuration" className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">AGENT IDENTITY</span>
            </div>

            <div className="mb-10">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a] mb-3">Step 1</p>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                Give Your AI Employee a Clear Identity
              </h2>
              <p className="text-slate-600 text-[14px] leading-relaxed max-w-[560px]">
                Define who your AI Sales Employee is — its name, role, tone, and primary objective. This identity is
                embedded into every conversation it has on your behalf.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Config form */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <Settings size={14} className="text-[#e8572a]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Identity Configuration</span>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: 'Agent Name', value: 'Alex', hint: 'Your AI employee will introduce itself by this name' },
                    { label: 'Role', value: 'Inbound Sales Representative', hint: 'Used in self-introductions and handoffs' },
                    { label: 'Company', value: 'Your Company', hint: 'Pulled from your workspace settings' },
                    { label: 'Communication Style', value: 'Professional + Conversational', hint: 'Balances authority with approachability' },
                    { label: 'Tone', value: 'Consultative', hint: 'Asks questions, listens, then recommends' },
                    { label: 'Language', value: 'English', hint: 'Primary language for all conversations' },
                    { label: 'Response Goal', value: 'Qualify inbound prospects and move toward meetings', hint: 'The north-star objective for every reply' },
                  ].map(({ label, value, hint }) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                          <p className="text-[13.5px] font-semibold text-[#0c0e14]">{value}</p>
                          <p className="text-[11.5px] text-slate-400 mt-0.5">{hint}</p>
                        </div>
                        <span className="shrink-0 mt-0.5 text-emerald-500">
                          <Check size={14} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview card */}
              <div className="flex flex-col gap-5">
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Agent Preview Card</p>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e8572a]/20 to-[#e8572a]/5 border border-[#e8572a]/20 flex items-center justify-center">
                      <Bot size={24} className="text-[#e8572a]" />
                    </div>
                    <div>
                      <p className="text-[18px] font-bold text-[#0c0e14] leading-tight">Alex</p>
                      <p className="text-[13px] text-slate-500">Inbound Sales Representative</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-emerald-600 font-semibold">Active · 24/7</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      ['Tone', 'Consultative'],
                      ['Style', 'Professional + Conversational'],
                      ['Goal', 'Qualify & book meetings'],
                      ['Language', 'English'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[13px]">
                        <span className="text-slate-400">{k}</span>
                        <span className="font-medium text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex gap-3 items-start">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-emerald-800 leading-relaxed">
                    Identity settings are embedded into every message your AI employee sends. Prospects always know who they&apos;re talking to.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ S2 — BRAND VOICE ══════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">BRAND VOICE</span>
            </div>

            <div className="mb-10">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a] mb-3">Step 2</p>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                Make Every Conversation Sound Like Your Brand
              </h2>
              <p className="text-slate-600 text-[14px] leading-relaxed max-w-[560px]">
                Configure tone, greeting style, response length, and objection-handling approach so every message
                feels consistent with how your business communicates.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#e8572a]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Voice Configuration</span>
                </div>
                <div className="p-5 space-y-6">
                  {/* Tone pills */}
                  <div>
                    <p className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">Tone</p>
                    <div className="flex flex-wrap gap-2">
                      {TONE_PILLS.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTone(t)}
                          className={cn(
                            'rounded-full px-4 py-1.5 text-[13px] font-semibold border transition-all',
                            selectedTone === t
                              ? 'bg-[#e8572a] text-white border-[#e8572a] shadow-md shadow-[#e8572a]/20'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-[#e8572a]/50 hover:text-[#e8572a]'
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Response Length */}
                  <div>
                    <p className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">Response Length</p>
                    <div className="flex gap-2">
                      {LENGTH_OPTS.map((o) => (
                        <button
                          key={o}
                          onClick={() => setSelectedLength(o)}
                          className={cn(
                            'rounded-lg px-4 py-2 text-[13px] font-semibold border transition-all flex-1',
                            selectedLength === o
                              ? 'bg-[#0c0e14] text-white border-[#0c0e14]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Greeting Style */}
                  <div>
                    <p className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">Greeting Style</p>
                    <div className="flex gap-2">
                      {GREETING_OPTS.map((o) => (
                        <button
                          key={o}
                          onClick={() => setSelectedGreeting(o)}
                          className={cn(
                            'rounded-lg px-4 py-2 text-[13px] font-semibold border transition-all flex-1',
                            selectedGreeting === o
                              ? 'bg-[#0c0e14] text-white border-[#0c0e14]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Objection handling */}
                  <div>
                    <p className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">Objection Handling</p>
                    <div className="flex flex-col gap-2">
                      {OBJECTION_OPTS.map((o) => (
                        <button
                          key={o}
                          onClick={() => setSelectedObjection(o)}
                          className={cn(
                            'rounded-xl px-4 py-2.5 text-[13px] font-medium border text-left transition-all',
                            selectedObjection === o
                              ? 'bg-violet-50 border-violet-200 text-violet-800'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          <span className={cn('inline-block w-2 h-2 rounded-full mr-2 align-middle', selectedObjection === o ? 'bg-violet-500' : 'bg-slate-300')} />
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formal/Casual slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-slate-400">Formal ↔ Casual</p>
                      <span className="text-[12px] font-semibold text-[#e8572a]">{formalSlider}% casual</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formalSlider}
                      onChange={(e) => setFormalSlider(Number(e.target.value))}
                      className="w-full accent-[#e8572a]"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Formal</span>
                      <span>Casual</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info panel */}
              <div className="flex flex-col gap-5 justify-center">
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Active Voice Config</p>
                  <div className="space-y-3">
                    {[
                      ['Tone', selectedTone],
                      ['Length', selectedLength],
                      ['Greeting', selectedGreeting],
                      ['Objection', selectedObjection],
                      ['Formal / Casual', `${formalSlider}% casual`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[13px] py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-slate-400">{k}</span>
                        <span className="font-semibold text-[#0c0e14] text-right max-w-[56%]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex gap-3 items-start">
                  <Sparkles size={15} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-amber-800 leading-relaxed">
                    Brand voice applies to text conversations only. Voice synthesis is not yet available — see the Voice section below for planned features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ S3 — KNOWLEDGE ══════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">BUSINESS KNOWLEDGE</span>
            </div>

            <div className="mb-10">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a] mb-3">Step 3</p>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                Give Your AI Employee the Knowledge It Needs
              </h2>
              <p className="text-slate-600 text-[14px] leading-relaxed max-w-[560px]">
                Upload your business documents, pricing guides, FAQs, and policies into the Knowledge Base.
                Your AI Sales Employee responds strictly from this approved knowledge — never from guesswork.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* Knowledge list */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <Book size={14} className="text-[#e8572a]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Knowledge Base (RAG)</span>
                  <span className="ml-auto bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">5 / 5 LOADED</span>
                </div>
                <div className="p-5 space-y-3">
                  {KNOWLEDGE_ITEMS.map(({ label, loaded }) => (
                    <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#e8572a]/10 flex items-center justify-center">
                          <Book size={13} className="text-[#e8572a]" />
                        </div>
                        <span className="text-[13.5px] font-medium text-slate-700">{label}</span>
                      </div>
                      {loaded && (
                        <span className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600">
                          <CheckCircle2 size={13} /> Loaded
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="pt-2">
                    <button className="w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-[13px] text-slate-400 hover:border-[#e8572a]/30 hover:text-[#e8572a] transition-colors font-medium">
                      + Add Document or FAQ
                    </button>
                  </div>
                </div>
              </div>

              {/* Grounding flow */}
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-5">Knowledge Grounding Flow</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'Business Knowledge', desc: 'Your uploaded docs & FAQs', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                      { label: 'Knowledge Base (RAG)', desc: 'Vector-indexed for semantic search', color: 'bg-violet-100 text-violet-700 border-violet-200' },
                      { label: 'AI Sales Employee', desc: 'Retrieves relevant context before replying', color: 'bg-[#e8572a]/10 text-[#e8572a] border-[#e8572a]/20' },
                      { label: 'Grounded Response', desc: 'Factual reply from approved knowledge only', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                    ].map(({ label, desc, color }, i, arr) => (
                      <div key={label}>
                        <div className={cn('rounded-xl border px-4 py-3', color)}>
                          <p className="font-semibold text-[13px]">{label}</p>
                          <p className="text-[11.5px] mt-0.5 opacity-80">{desc}</p>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="flex justify-center my-1">
                            <ChevronRight size={16} className="rotate-90 text-slate-300" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 flex gap-3 items-start">
                  <Layers size={15} className="text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Your AI Employee never invents pricing, features, or policies. It only responds from what you have explicitly approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ S4 — SALES BEHAVIOR ══════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">QUALIFICATION RULES</span>
            </div>

            <div className="mb-10">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a] mb-3">Step 4</p>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                Define How Your AI Employee Sells
              </h2>
              <p className="text-slate-600 text-[14px] leading-relaxed max-w-[560px]">
                Set qualification criteria, lead scoring thresholds, follow-up timing, and escalation rules.
                The AI operates within exactly the parameters you define.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Terminal config */}
              <div className="lg:col-span-2 bg-[#0c0e14] rounded-2xl overflow-hidden shadow-xl border border-slate-700/40">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/40">
                  <Terminal size={13} className="text-slate-400" />
                  <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">qualification.config</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="p-5 space-y-2 font-mono text-[12.5px]">
                  {[
                    { key: 'budget_qualification', value: 'enabled', comment: '// asks about budget range' },
                    { key: 'timeline_qualification', value: 'enabled', comment: '// asks about project timeline' },
                    { key: 'requirements_analysis', value: 'enabled', comment: '// maps prospect needs to services' },
                    { key: 'intent_scoring', value: 'enabled', comment: '// detects urgency signals' },
                    { key: 'lead_score_hot_threshold', value: '≥ 70', comment: '// 0–100 score; HOT above 70' },
                    { key: 'follow_up_days', value: '[1, 3, 7, 14]', comment: '// automated drip cadence' },
                    { key: 'meeting_booking', value: '"auto-propose on HOT"', comment: '// Google Calendar + Meet' },
                    { key: 'human_escalation', value: '"complex | sensitive"', comment: '// triggers AI pause + handoff' },
                  ].map(({ key, value, comment }) => (
                    <div key={key} className="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span className="text-blue-400">{key}</span>
                      <span className="text-slate-500">:</span>
                      <span className="text-emerald-400">{value}</span>
                      <span className="text-slate-500">{comment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score badge */}
              <div className="flex flex-col gap-5">
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 flex flex-col items-center">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Example Lead Score</p>
                  <div className="relative w-28 h-28 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="#e8572a" strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - 78 / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[28px] font-bold text-[#0c0e14] leading-none">78</span>
                      <span className="text-[10px] font-mono text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <span className="bg-[#e8572a]/10 text-[#e8572a] border border-[#e8572a]/20 font-mono text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                    🔥 HOT LEAD
                  </span>
                  <p className="text-[12px] text-slate-500 text-center">Score ≥ 70 triggers auto meeting proposal via Google Calendar</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
                  <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-3">Score Ranges</p>
                  {[
                    { range: '0–39', label: 'COLD', color: 'bg-slate-100 text-slate-500' },
                    { range: '40–69', label: 'WARM', color: 'bg-amber-100 text-amber-700' },
                    { range: '70–100', label: 'HOT', color: 'bg-[#e8572a]/10 text-[#e8572a]' },
                  ].map(({ range, label, color }) => (
                    <div key={range} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-[12.5px] text-slate-600">{range}</span>
                      <span className={cn('font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full', color)}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ S5 — AGENT WORKFLOW ══════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">REVENUE WORKFLOW</span>
            </div>

            <div className="mb-10">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a] mb-3">Step 5</p>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                Design the Conversation-to-Revenue Workflow
              </h2>
              <p className="text-slate-600 text-[14px] leading-relaxed max-w-[560px]">
                Every inbound lead flows through a structured pipeline your AI employee manages autonomously —
                from first contact to qualified meeting booked.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              {/* Pipeline */}
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
                <div className="flex flex-col gap-0">
                  {PIPELINE_NODES.map(({ label, desc, color }, i) => (
                    <div key={label} className="relative flex items-start gap-5 pl-14 py-3">
                      <div
                        className={cn(
                          'absolute left-2.5 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center transition-all duration-700',
                          color,
                          i === activePipe ? 'scale-125 shadow-lg' : 'scale-100 opacity-70'
                        )}
                      />
                      <div
                        className={cn(
                          'rounded-xl border px-4 py-3 w-full transition-all duration-500',
                          i === activePipe
                            ? 'border-[#e8572a]/30 bg-[#e8572a]/5 shadow-sm'
                            : 'border-slate-100 bg-slate-50/60'
                        )}
                      >
                        <p className={cn('font-mono text-[11px] font-bold uppercase tracking-wider mb-0.5', i === activePipe ? 'text-[#e8572a]' : 'text-slate-400')}>
                          {label}
                        </p>
                        <p className="text-[13px] text-slate-600">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Response Time', value: '< 60s', desc: 'Average first reply after lead arrives' },
                  { label: 'Follow-up Cadence', value: '4 touches', desc: 'Day 1, 3, 7, 14 — fully automated' },
                  { label: 'Channels', value: '3 active', desc: 'Website · Gmail · WhatsApp' },
                  { label: 'Meeting Booking', value: 'Auto', desc: 'Google Calendar + Meet for HOT leads' },
                ].map(({ label, value, desc }) => (
                  <div key={label} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5">
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                    <p className="text-[24px] font-bold text-[#0c0e14] leading-none mb-1">{value}</p>
                    <p className="text-[12px] text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ S6 — SANDBOX TESTING ══════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">SANDBOX TESTING</span>
            </div>

            <div className="mb-10">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a] mb-3">Step 6</p>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                Test Your AI Employee Before Going Live
              </h2>
              <p className="text-slate-600 text-[14px] leading-relaxed max-w-[560px]">
                Use the built-in sandbox to simulate prospect conversations with your exact configuration
                before deploying to any live channel.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Config summary */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Settings size={13} className="text-[#e8572a]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Config</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { k: 'Agent', v: 'Alex' },
                    { k: 'Tone', v: selectedTone },
                    { k: 'Length', v: selectedLength },
                    { k: 'Greeting', v: selectedGreeting },
                    { k: 'Knowledge', v: '5 docs loaded' },
                    { k: 'Scoring', v: 'HOT ≥ 70' },
                    { k: 'Handoff', v: 'Complex / Sensitive' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between text-[12.5px] border-b border-slate-100 pb-2 last:border-0">
                      <span className="text-slate-400">{k}</span>
                      <span className="font-semibold text-[#0c0e14]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <MessageSquare size={13} className="text-[#e8572a]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Prospect Message</span>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-4">
                  <div className="rounded-xl bg-slate-100 px-4 py-3 text-[13.5px] text-slate-700 leading-relaxed">
                    &quot;We need a website redesign. What&apos;s your pricing?&quot;
                  </div>
                  <div className="mt-auto">
                    <textarea
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#e8572a]/30 focus:border-[#e8572a]/50 transition"
                      rows={3}
                      value={sandboxMsg}
                      onChange={(e) => setSandboxMsg(e.target.value)}
                      placeholder="Type a test prospect message…"
                    />
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 rounded-full bg-[#e8572a] px-4 py-2 text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 hover:bg-[#d04920]">
                        <Play size={12} /> Run Test
                      </button>
                      <button
                        onClick={() => setSandboxMsg('')}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                      >
                        <RefreshCw size={12} /> Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI response */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Bot size={13} className="text-[#e8572a]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">AI Employee Response</span>
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ALEX
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-4">
                  <div className="rounded-xl border border-[#e8572a]/15 bg-[#e8572a]/4 px-4 py-4 text-[13.5px] text-slate-700 leading-relaxed flex-1">
                    <span className="font-semibold text-[#e8572a]">Alex: </span>
                    Thanks for reaching out! I&apos;d love to help you explore a website redesign. To make sure I point
                    you in the right direction — could you share a bit about your timeline and budget range?
                    Our packages start from different tiers depending on scope, and I want to make sure we&apos;re aligned
                    before diving into details. What does your ideal go-live date look like? 🙂
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">
                      Sandbox uses your configured knowledge and qualification rules — no external AI calls required for preview.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ S7 — HUMAN HANDOFF ══════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">HUMAN HANDOFF</span>
            </div>

            <div className="mb-10">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a] mb-3">Step 7</p>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                Keep Humans in Control
              </h2>
              <p className="text-slate-600 text-[14px] leading-relaxed max-w-[560px]">
                Your AI Sales Employee knows its limits. When a conversation turns complex, sensitive, or high-value,
                it pauses and passes control to a human — with full conversation context.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px]">
              {/* Autonomous */}
              <div className="bg-white border border-emerald-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="bg-emerald-50 px-5 py-3.5 border-b border-emerald-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700">Autonomous Mode</span>
                </div>
                <div className="p-5">
                  <div className="flex flex-col gap-2">
                    {[
                      'AI Employee receives inbound message',
                      'Retrieves knowledge & runs qualification',
                      'Generates grounded response',
                      'Scores lead (0–100)',
                      'AI handles follow-up or books meeting',
                    ].map((step, i) => (
                      <div key={step} className="flex items-start gap-3 text-[13px] text-slate-700">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-[12.5px] text-emerald-700 font-semibold">
                    ✓ AI handles end-to-end with no human needed
                  </div>
                </div>
              </div>

              {/* Handoff */}
              <div className="bg-white border border-amber-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="bg-amber-50 px-5 py-3.5 border-b border-amber-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-700">Human Handoff Mode</span>
                </div>
                <div className="p-5">
                  <div className="flex flex-col gap-2">
                    {[
                      'Complex, sensitive, or out-of-scope request detected',
                      'AI flags conversation for HUMAN_REVIEW',
                      'AI pauses — stops sending autonomous replies',
                      'Human receives full conversation context',
                      'Human takes over in the AI Command Center',
                    ].map((step, i) => (
                      <div key={step} className="flex items-start gap-3 text-[13px] text-slate-700">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-[12.5px] text-amber-700 font-semibold">
                    ⚡ Human in control — AI ready to resume when cleared
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ S8 — VOICE (COMING SOON) ══════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">VOICE CONFIGURATION</span>
            </div>

            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  COMING SOON
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                Voice Is the Next Layer of Your AI Employee
              </h2>
              <p className="text-slate-600 text-[14px] leading-relaxed max-w-[560px]">
                We are building a full voice configuration layer for your AI Sales Employee — including Indian language support,
                accent-aware synthesis, and inbound call behavior. These capabilities are not yet live.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {VOICE_CARDS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="relative bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 opacity-70">
                  <div className="absolute top-4 right-4">
                    <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-full">COMING SOON</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                    <Icon size={18} className="text-slate-400" />
                  </div>
                  <p className="font-semibold text-[13.5px] text-[#0c0e14] mb-1">{label}</p>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="max-w-[680px] rounded-2xl bg-amber-50 border border-amber-200 px-6 py-4 flex gap-3 items-start">
              <Mic size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[13.5px] font-semibold text-amber-800 mb-1">Voice configuration is a planned future capability</p>
                <p className="text-[13px] text-amber-700 leading-relaxed">
                  The platform currently supports text-based conversations across Website, Gmail, and WhatsApp.
                  Voice synthesis and inbound calling are on the product roadmap and will be announced when available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FINAL CTA ══════════════════════ */}
      <section className="py-16 md:py-24 bg-[#f7f8fb]">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-[28px] bg-[#0c0e14] px-8 py-16 md:px-16 text-center"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(232,87,42,0.22) 0%, #0c0e14 70%)' }}
          >
            {/* Glow orb */}
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#e8572a]/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="bg-[#e8572a]/15 text-[#e8572a] border border-[#e8572a]/25 font-mono text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  AI Sales Agent Builder
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-white mb-5 leading-[1.1]">
                Build Your AI Sales Employee
              </h2>
              <p className="text-slate-400 text-[15px] leading-relaxed mb-10 max-w-[520px] mx-auto">
                Configure identity, brand voice, knowledge, and qualification rules — then deploy your AI Sales Employee
                to every inbound channel in minutes.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-full bg-[#e8572a] px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#e8572a]/30 hover:bg-[#d04920] flex items-center gap-2"
                >
                  Create Your Agent <ArrowRight size={16} />
                </Link>
                <Link
                  href="/enterprise-ai-deployment"
                  className="rounded-full border border-slate-600 bg-white/5 px-6 py-3.5 text-[14px] font-semibold text-slate-200 hover:bg-white/10 flex items-center gap-2"
                >
                  Enterprise Deployment <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[13px] text-slate-500">
                {['No engineering required', 'Deploy in minutes', 'Knowledge Base included', 'Human Review built-in'].map((f) => (
                  <span key={f} className="flex items-center gap-1.5">
                    <Check size={13} className="text-emerald-500" /> {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/images/op-logo-arc.png" alt="Operator" className="h-5 w-5 object-contain" />
                <span className="text-[17px] font-bold tracking-[-0.04em]">
                  operator<span className="text-[#e8572a]">.</span>
                </span>
              </div>
              <p className="text-[13px] text-slate-600 max-w-[280px]">
                Autonomous AI Sales Employee for B2B agencies and service firms.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-[13px]">
              <div className="space-y-2">
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800">Product</p>
                <Link href="/enterprise-ai-deployment" className="block text-slate-600 hover:text-[#e8572a]">Enterprise Deployment</Link>
                <Link href="/live-command-center" className="block text-slate-600 hover:text-[#e8572a]">Command Center</Link>
                <Link href="/ai-sales-agent-builder" className="block text-slate-600 hover:text-[#e8572a]">Agent Builder</Link>
                <Link href="/autonomous-inbound-calling" className="block text-slate-600 hover:text-[#e8572a]">Inbound Calling</Link>
                <Link href="/call-scrubber-replay" className="block text-slate-600 hover:text-[#e8572a]">Call Scrubber</Link>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800">Company</p>
                <Link href="/login" className="block text-slate-600 hover:text-[#e8572a]">Sign In</Link>
                <Link href="/register" className="block text-slate-600 hover:text-[#e8572a]">Book Demo</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-10 pt-6 text-[12px] text-slate-500 font-mono">
            © 2026 AI Revenue Technologies Pvt. Ltd. · New Delhi, India
          </div>
        </div>
      </footer>
    </div>
  );
}
