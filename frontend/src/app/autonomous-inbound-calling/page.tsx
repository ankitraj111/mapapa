'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mic,
  Bot,
  Sparkles,
  Target,
  Calendar,
  UserCheck,
  Clock,
  ArrowRight,
  CheckCircle,
  Check,
  Globe,
  Mail,
  MessageCircle,
  TrendingUp,
  Volume2,
  Activity,
  Shield,
  Layers,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Waveform component ────────────────────────────────────────────────────────
function Waveform({ className }: { className?: string }) {
  const bars = [6, 14, 10, 18, 8, 16, 12, 7];
  return (
    <div className={cn('flex items-end gap-[3px]', className)}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            height: `${h}px`,
            animationDelay: `${i * 0.12}s`,
            animationDuration: '0.9s',
          }}
          className="w-[3px] rounded-full bg-[#e8572a] animate-pulse"
        />
      ))}
    </div>
  );
}

// ── Animated waveform bars (CSS keyframe style) ───────────────────────────────
function AnimatedWaveform({ className }: { className?: string }) {
  const heights = [8, 18, 12, 22, 10, 20, 14, 9];
  return (
    <div className={cn('flex items-end gap-1', className)}>
      {heights.map((h, i) => (
        <span
          key={i}
          style={
            {
              '--bar-h': `${h}px`,
              animationDelay: `${i * 0.15}s`,
            } as React.CSSProperties
          }
          className="w-[4px] rounded-full bg-[#e8572a] animate-wave-bar"
        />
      ))}
      <style>{`
        @keyframes waveBar {
          0%, 100% { height: 4px; }
          50% { height: var(--bar-h); }
        }
        .animate-wave-bar {
          height: 4px;
          animation: waveBar 0.9s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ── Pipeline node ─────────────────────────────────────────────────────────────
const pipelineNodes = [
  { label: 'INBOUND CALL', desc: 'Phone rings — AI picks up instantly', icon: Phone },
  { label: 'AI ANSWERS', desc: 'Natural voice greeting in <1s', icon: Mic },
  { label: 'UNDERSTANDS INTENT', desc: 'NLP extracts caller context', icon: Bot },
  { label: 'QUALIFIES', desc: 'Budget · Timeline · Authority · Need', icon: Target },
  { label: '0–100 SCORES', desc: 'Lead scored in real-time', icon: Activity },
  { label: 'BOOKS / ESCALATES', desc: 'Meeting auto-booked or human joined', icon: Calendar },
  { label: 'REVENUE PIPELINE', desc: 'Opportunity enters CRM instantly', icon: TrendingUp },
];

// ── Capability cards ──────────────────────────────────────────────────────────
const capabilityCards = [
  { icon: Mic, title: 'Natural Conversation', desc: 'Human-like pacing, pauses, and affirmations' },
  { icon: Activity, title: 'Real-Time Response', desc: 'Sub-second latency voice responses' },
  { icon: Volume2, title: 'Interruption Handling', desc: 'Detects and adapts to mid-sentence interrupts' },
  { icon: Target, title: 'Qualification', desc: 'BANT-style extraction from voice signals' },
  { icon: Shield, title: 'Objection Handling', desc: 'Responds to common sales objections in context' },
  { icon: Layers, title: 'Knowledge Base Grounding', desc: 'Answers only from approved business knowledge' },
  { icon: Sparkles, title: '0–100 Lead Scoring', desc: 'Intent + qualification signals → numeric score' },
  { icon: Calendar, title: 'Meeting Booking', desc: 'Calendar integration to confirm slots live' },
  { icon: UserCheck, title: 'Human Escalation', desc: 'Warm transfer when human judgment needed' },
];

// ── Language cards ────────────────────────────────────────────────────────────
const languageCards = [
  { lang: 'English', note: 'Indian English accent support' },
  { lang: 'Hindi', note: 'हिंदी — conversational fluency' },
  { lang: 'Hinglish', note: 'Code-switching mid-sentence' },
  { lang: 'Indian Accents', note: 'Regional voice training planned' },
  { lang: 'Voice Personalities', note: 'Multiple persona options' },
];

// ── Funnel steps ──────────────────────────────────────────────────────────────
const funnelSteps = [
  'PHONE CALL',
  'LEAD',
  'QUALIFICATION',
  '0–100 SCORE',
  'MEETING',
  'OPPORTUNITY',
  'WON / LOST',
  'REVENUE',
];

// ── Architecture stack ────────────────────────────────────────────────────────
const archStack = [
  { label: 'Telephony Layer', status: 'PLANNED' as const },
  { label: 'Voice AI Engine', status: 'PLANNED' as const },
  { label: 'AI Revenue Operator', status: 'LIVE' as const },
  { label: 'Knowledge + Qualification', status: 'LIVE' as const },
  { label: 'Revenue Pipeline', status: 'LIVE' as const },
  { label: 'Revenue Intelligence', status: 'LIVE' as const },
];

// ── Qualification signals ─────────────────────────────────────────────────────
const qualSignals = [
  { label: 'Budget', value: '₹5L–₹10L / yr', color: 'text-emerald-600' },
  { label: 'Timeline', value: 'Q1 2026', color: 'text-blue-600' },
  { label: 'Decision Maker', value: 'Yes — VP Sales', color: 'text-emerald-600' },
  { label: 'Need', value: 'Lead automation', color: 'text-emerald-600' },
  { label: 'Lead Score', value: '82 / 100', color: 'text-[#e8572a]' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AutonomousInboundCallingPage() {
  const [activeNode, setActiveNode] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pipeline animation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % pipelineNodes.length);
    }, 1600);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fb] font-[Space_Grotesk,system-ui,sans-serif]">
      {/* ── Announcement bar ── */}
      <aside className="relative z-[210] flex h-9 items-center justify-center gap-2 overflow-hidden whitespace-nowrap bg-[#0c0e14] px-4 text-[12.5px] font-medium text-white">
        <span className="font-semibold text-[#e8572a]">New:</span>
        <span>AI Revenue Operator 2.0 — Autonomous 24/7 AI Sales Employee →</span>
        <Link
          href="/register"
          className="ml-1 underline decoration-[#e8572a] hover:text-[#e8572a] font-semibold"
        >
          Deploy Free
        </Link>
      </aside>

      {/* ── Sticky nav ── */}
      <header className="sticky top-0 z-[200] h-[72px] border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-5 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src="/images/op-logo-arc.png"
              alt="Operator"
              className="h-6 w-6 object-contain"
            />
            <span className="text-[18px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
              operator<span className="text-[#e8572a]">.</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 xl:gap-2 lg:flex text-[13px] font-medium text-slate-600">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/enterprise-ai-deployment"
              className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors"
            >
              Enterprise Deployment
            </Link>
            <Link
              href="/ai-sales-agent-builder"
              className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors"
            >
              Agent Builder
            </Link>
            <Link
              href="/live-command-center"
              className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors"
            >
              Command Center
            </Link>
            <span className="rounded-full px-3 py-1.5 bg-orange-50 border border-orange-200 text-[#e8572a] font-semibold cursor-default">
              Inbound Calling
            </span>
            <Link
              href="/call-scrubber-replay"
              className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors"
            >
              Call Scrubber
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="px-3 py-2 text-[14px] font-medium text-slate-700"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#e8572a] px-5 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920]"
            >
              Book Demo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-slate-700"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-[72px] z-[199] bg-white border-b border-slate-200 px-5 py-4 flex flex-col gap-3 text-[14px] font-medium text-slate-700 shadow-lg">
            <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/enterprise-ai-deployment" onClick={() => setMobileOpen(false)}>Enterprise Deployment</Link>
            <Link href="/ai-sales-agent-builder" onClick={() => setMobileOpen(false)}>AI Agent Builder</Link>
            <Link href="/live-command-center" onClick={() => setMobileOpen(false)}>Live Command Center</Link>
            <span className="text-[#e8572a] font-semibold">Autonomous Inbound Calling</span>
            <Link href="/call-scrubber-replay" onClick={() => setMobileOpen(false)}>Call Scrubber &amp; Replay</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
            <Link
              href="/register"
              className="rounded-full bg-[#e8572a] px-5 py-2.5 text-[14px] font-semibold text-white text-center"
              onClick={() => setMobileOpen(false)}
            >
              Join Waitlist
            </Link>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75 overflow-hidden">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            {/* Rail dot */}
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                AUTONOMOUS INBOUND CALLING
              </span>
              <span className="ml-2 inline-flex items-center gap-1 bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                COMING SOON
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
              {/* Left */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-[#0c0e14] leading-[1.1] mb-5">
                  Your AI Sales Employee,{' '}
                  <span className="text-[#e8572a]">Answering Every Inbound Call</span>
                </h1>

                <p className="text-slate-600 text-[15px] leading-relaxed mb-6 max-w-lg">
                  Extend the AI Revenue Operator from text-based conversations to
                  real-time inbound voice conversations. The same brain. The same
                  qualification logic. Now on every incoming call.
                </p>

                {/* Amber alert bar */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 max-w-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-amber-800 font-medium">
                    Voice AI is a planned roadmap feature — not currently available.
                    Join the waitlist to be notified.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="rounded-full bg-[#e8572a] px-6 py-3 text-[14px] font-semibold text-white shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920] transition-colors flex items-center gap-2"
                  >
                    Join Voice AI Waitlist <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-[13.5px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    See How Voice Will Work
                  </Link>
                </div>

                {/* Waveform visual */}
                <div className="mt-10 flex items-center gap-4">
                  <AnimatedWaveform />
                  <span className="text-[12px] font-mono text-slate-400 uppercase tracking-wider">
                    Planned voice signal processing
                  </span>
                </div>
              </div>

              {/* Right — animated pipeline console */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-[340px] bg-[#0c0e14] rounded-2xl border border-slate-800 shadow-2xl p-5 font-mono">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-[11px] text-slate-500 uppercase tracking-widest">
                      voice pipeline — roadmap
                    </span>
                  </div>

                  <div className="space-y-2">
                    {pipelineNodes.map((node, i) => {
                      const Icon = node.icon;
                      const isActive = i === activeNode;
                      const isPast = i < activeNode;
                      return (
                        <div
                          key={i}
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-500',
                            isActive
                              ? 'bg-[#e8572a]/20 border border-[#e8572a]/40'
                              : isPast
                              ? 'bg-emerald-900/20 border border-emerald-800/30'
                              : 'border border-transparent'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-lg shrink-0',
                              isActive
                                ? 'bg-[#e8572a] text-white'
                                : isPast
                                ? 'bg-emerald-700/40 text-emerald-400'
                                : 'bg-slate-800 text-slate-500'
                            )}
                          >
                            {isPast ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Icon className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div
                              className={cn(
                                'text-[11px] font-bold uppercase tracking-wider',
                                isActive
                                  ? 'text-[#e8572a]'
                                  : isPast
                                  ? 'text-emerald-400'
                                  : 'text-slate-600'
                              )}
                            >
                              {node.label}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {node.desc}
                            </div>
                          </div>
                          {isActive && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-[#e8572a] animate-pulse shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 uppercase tracking-widest">
                    Planned — Not Yet Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HOW IT WILL WORK
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="border-b border-slate-200/60 bg-white/75"
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                HOW IT WILL WORK
              </span>
              <span className="ml-2 bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                COMING SOON
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              From Phone Call to Qualified Opportunity
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-12 max-w-xl">
              When Voice AI launches, every inbound call will flow through the same
              qualification pipeline as your website, Gmail, and WhatsApp channels.
            </p>

            <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
              {/* Left — step flow */}
              <div>
                {[
                  { step: 'Caller', sub: 'Inbound call connects', icon: Phone },
                  { step: 'AI Voice Employee', sub: 'Picks up instantly — natural greeting', icon: Mic },
                  { step: 'Natural Conversation', sub: 'Open-ended discovery dialogue', icon: MessageCircle },
                  { step: 'Requirement Detection', sub: 'What does the caller need?', icon: Target },
                  { step: 'Budget Analysis', sub: 'Price range extracted from context', icon: TrendingUp },
                  { step: 'Timeline Discussion', sub: 'When are they looking to buy?', icon: Clock },
                  { step: 'Intent Scoring', sub: 'Real-time intent signal evaluation', icon: Activity },
                  { step: '0–100 Lead Score', sub: 'Numeric qualification output', icon: Sparkles },
                  { step: 'Next Best Action', sub: 'Book meeting · escalate · follow-up', icon: CheckCircle },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 mb-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8572a]/10 border border-[#e8572a]/20 shrink-0">
                          <Icon className="h-3.5 w-3.5 text-[#e8572a]" />
                        </span>
                        {i < 8 && (
                          <span className="w-px flex-1 bg-[#e8572a]/20 mt-1 mb-0 min-h-[20px]" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-[13.5px] font-semibold text-[#0c0e14]">{item.step}</p>
                        <p className="text-[12.5px] text-slate-500">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right — mock phone widget + qualification card */}
              <div className="space-y-6">
                {/* Phone widget */}
                <div className="bg-[#0c0e14] rounded-2xl border border-slate-800 p-6 max-w-[300px] mx-auto lg:mx-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                      Incoming Call
                    </span>
                    <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                      COMING SOON
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-full bg-[#e8572a]/20 border border-[#e8572a]/30 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-[#e8572a]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-[14px]">Ananya S.</p>
                      <p className="text-slate-400 text-[12px]">+91 98765 43210</p>
                    </div>
                    <span className="ml-auto text-emerald-400 text-[11px] font-mono animate-pulse">
                      ●  Live
                    </span>
                  </div>

                  {/* Waveform animation */}
                  <div className="bg-slate-900 rounded-xl px-4 py-3 flex items-end gap-1 h-14 mb-4">
                    {[5, 12, 8, 20, 6, 17, 11, 22, 9, 15, 7, 18, 13, 5, 10].map((h, i) => (
                      <span
                        key={i}
                        style={
                          {
                            '--bar-h': `${h}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.85s',
                          } as React.CSSProperties
                        }
                        className="flex-1 rounded-full bg-[#e8572a]/70 animate-wave-bar"
                      />
                    ))}
                  </div>

                  <div className="flex gap-3 justify-center">
                    <span className="h-9 w-9 rounded-full bg-red-900/40 border border-red-700/40 flex items-center justify-center">
                      <X className="h-4 w-4 text-red-400" />
                    </span>
                    <span className="h-9 w-9 rounded-full bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-emerald-400" />
                    </span>
                  </div>
                </div>

                {/* Qualification card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 max-w-[300px] mx-auto lg:mx-0">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[12px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      Extracted Signals
                    </p>
                    <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                      COMING SOON
                    </span>
                  </div>
                  <div className="space-y-2">
                    {qualSignals.map((sig) => (
                      <div
                        key={sig.label}
                        className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                      >
                        <span className="text-[12.5px] text-slate-500">{sig.label}</span>
                        <span className={cn('text-[12.5px] font-semibold', sig.color)}>
                          {sig.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — AI VOICE EMPLOYEE CAPABILITIES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                AI VOICE EMPLOYEE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              A Voice Employee That Understands the Conversation
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-12 max-w-xl">
              Planned capabilities for the Voice AI Employee — all grounded in the
              same AI Revenue Operator brain.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {capabilityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8572a]/10 border border-[#e8572a]/15">
                        <Icon className="h-4 w-4 text-[#e8572a]" />
                      </span>
                      <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        COMING SOON
                      </span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#0c0e14] mb-1">{card.title}</p>
                      <p className="text-[13px] text-slate-500 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — KNOWLEDGE BASE CONTINUITY
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                KNOWLEDGE BASE CONTINUITY
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
              {/* Left text */}
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
                  The Same Business Knowledge Powers Voice
                </h2>
                <p className="text-slate-600 text-[14px] leading-relaxed mb-6">
                  When Voice AI launches, the voice agent will use the exact same
                  Knowledge Base, qualification rules, and business logic as the
                  existing text-based AI Sales Employee.
                </p>
                <p className="text-slate-600 text-[14px] leading-relaxed mb-6">
                  No separate setup. No re-training. Voice is simply a new input
                  modality into the same AI Revenue Operator brain.
                </p>
                <div className="flex flex-col gap-2.5">
                  {[
                    'Same qualification criteria across all channels',
                    'Same knowledge base answers — no contradictions',
                    'Same 0–100 lead scoring methodology',
                    'Same business rules and escalation triggers',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-[13.5px] text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — unified architecture diagram */}
              <div>
                <div className="bg-[#f7f8fb] border border-slate-200 rounded-2xl p-6">
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-6 text-center">
                    Unified Channel Architecture
                  </p>

                  {/* Channels → brain box */}
                  <div className="flex gap-4 items-stretch">
                    {/* Left channels */}
                    <div className="flex flex-col gap-2 justify-center">
                      {[
                        { label: 'Website', icon: Globe, live: true },
                        { label: 'Gmail', icon: Mail, live: true },
                        { label: 'WhatsApp', icon: MessageCircle, live: true },
                        { label: 'Voice', icon: Phone, live: false },
                      ].map((ch) => {
                        const Icon = ch.icon;
                        return (
                          <div
                            key={ch.label}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px] font-semibold transition-all',
                              ch.live
                                ? 'bg-white border-slate-200 text-slate-700'
                                : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {ch.label}
                            {ch.live ? (
                              <span className="ml-auto bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                LIVE
                              </span>
                            ) : (
                              <span className="ml-auto bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                SOON
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Arrow connector */}
                    <div className="flex flex-col justify-center items-center px-1">
                      <div className="flex flex-col gap-1 items-center">
                        {[0, 1, 2, 3].map((i) => (
                          <ChevronRight key={i} className="h-3 w-3 text-[#e8572a]" />
                        ))}
                      </div>
                    </div>

                    {/* Brain + downstream */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="bg-[#e8572a] text-white rounded-xl px-3 py-2.5 text-center">
                        <p className="text-[11px] font-mono font-bold uppercase tracking-wide">
                          AI Revenue Operator
                        </p>
                        <p className="text-[10px] opacity-80">Knowledge + Qualification Brain</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400 rotate-90 mx-auto" />
                      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-center">
                        <p className="text-[11.5px] font-semibold text-slate-700">AI Sales Employee</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400 rotate-90 mx-auto" />
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
                        <p className="text-[11.5px] font-semibold text-emerald-700">Revenue Pipeline</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — HUMAN ESCALATION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                HUMAN ESCALATION
              </span>
              <span className="ml-2 bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                COMING SOON
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Escalate the Call When a Human Is Needed
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-12 max-w-xl">
              Voice AI will use the same HUMAN_REVIEW workflow as the text-based
              AI Sales Employee. When a call becomes complex, sensitive, or a high-value
              opportunity, the AI escalates to your sales representative.
            </p>

            {/* Escalation flow */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              {[
                { label: 'AI Voice Employee', icon: Mic, color: 'bg-[#e8572a]/10 border-[#e8572a]/20 text-[#e8572a]' },
                { label: 'Complex / Sensitive Request', icon: AlertCircle, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                { label: 'Human Escalation', icon: UserCheck, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: 'Sales Representative', icon: Phone, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-semibold',
                        step.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {step.label}
                    </div>
                    {i < 3 && (
                      <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 max-w-2xl">
              <p className="text-[12px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
                Planned Escalation Triggers
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'High-value enterprise caller',
                  'Pricing negotiation requested',
                  'Caller explicitly asks for a human',
                  'Legal or compliance questions',
                  'Complex technical requirements',
                  'HUMAN_REVIEW flag from AI logic',
                ].map((trigger) => (
                  <div key={trigger} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e8572a] shrink-0" />
                    <span className="text-[13px] text-slate-600">{trigger}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — MULTILINGUAL / INDIAN VOICE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                MULTILINGUAL VOICE
              </span>
              <span className="ml-2 bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                COMING SOON
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Built for Indian Conversations
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-3 max-w-xl">
              Voice AI will be designed for the nuances of the Indian B2B sales
              context — where conversations mix languages, accents, and communication styles.
            </p>
            <div className="flex items-center gap-2 mb-10">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-[13px] text-amber-700 font-medium">
                No timeline confirmed. Join the waitlist to be notified when this becomes available.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-3xl">
              {languageCards.map((card) => (
                <div
                  key={card.lang}
                  className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[15px] font-bold text-[#0c0e14]">{card.lang}</p>
                    <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      ROADMAP
                    </span>
                  </div>
                  <p className="text-[12.5px] text-slate-500">{card.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — CALL → REVENUE PIPELINE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                CALL → REVENUE PIPELINE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Every Conversation Enters the Same Revenue Pipeline
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-12 max-w-xl">
              Voice will be one more entry point into the same AI Revenue Operator
              brain — alongside website, email, and WhatsApp.
            </p>

            <div className="flex flex-col items-start gap-0 max-w-xs">
              {funnelSteps.map((step, i) => {
                const width = 100 - i * 8;
                return (
                  <div key={step} className="w-full">
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-xl py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all',
                        i === 0
                          ? 'bg-[#e8572a] text-white'
                          : i === funnelSteps.length - 1
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      )}
                      style={{ width: `${width}%` }}
                    >
                      {step}
                    </div>
                    {i < funnelSteps.length - 1 && (
                      <div
                        className="w-px h-4 bg-slate-300 ml-4"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-10 bg-white border border-[#e8572a]/20 rounded-2xl px-6 py-4 max-w-lg inline-flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-[#e8572a] mt-0.5 shrink-0" />
              <p className="text-[13.5px] text-slate-700">
                <strong className="text-[#0c0e14]">Voice is one more entry point</strong> into the
                same AI Revenue Operator brain — the pipeline, scoring, and intelligence
                infrastructure is already running.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 7 — CALL RELIABILITY ARCHITECTURE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                ARCHITECTURE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Built Around the Same Revenue Infrastructure
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-12 max-w-xl">
              The AI Revenue Operator foundation is already built and running. Voice
              adds two planned layers on top.
            </p>

            {/* Architecture stack — horizontal */}
            <div className="flex flex-wrap items-center gap-2">
              {archStack.map((layer, i) => (
                <div key={layer.label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'rounded-xl border px-4 py-3 flex flex-col items-center gap-1.5 min-w-[130px]',
                      layer.status === 'LIVE'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    )}
                  >
                    <p
                      className={cn(
                        'text-[12.5px] font-semibold text-center',
                        layer.status === 'LIVE' ? 'text-emerald-800' : 'text-slate-500'
                      )}
                    >
                      {layer.label}
                    </p>
                    <span
                      className={cn(
                        'font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase',
                        layer.status === 'LIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                      )}
                    >
                      {layer.status}
                    </span>
                  </div>
                  {i < archStack.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 text-[13.5px] text-slate-600 max-w-lg leading-relaxed">
              The two <span className="font-semibold text-orange-700">PLANNED</span> layers
              (Telephony + Voice AI Engine) are what Voice AI will add. Everything
              downstream is{' '}
              <span className="font-semibold text-emerald-700">already live</span> and
              powering your existing AI Sales Employee today.
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA (dark block)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 py-16 md:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div
            className="bg-[#0c0e14] rounded-[28px] px-8 py-14 md:px-16 md:py-20 text-center relative overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 60% 0%, rgba(232,87,42,0.22) 0%, transparent 60%)',
            }}
          >
            {/* Waveform decoration */}
            <div className="flex justify-center mb-8">
              <AnimatedWaveform />
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <Phone className="h-4 w-4 text-[#e8572a]" />
              <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                VOICE AI — ROADMAP
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[38px] font-bold tracking-tight text-white mb-4 max-w-2xl mx-auto">
              Bring Your AI Employee to Every Phone Call
            </h2>

            <p className="text-slate-400 text-[15px] leading-relaxed mb-4 max-w-lg mx-auto">
              Voice AI is coming to AI Revenue Operator. Be the first to know when
              it launches — and get early access priority.
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-[13px] text-amber-300 font-medium">
                Not currently available. Join the waitlist below.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#e8572a] px-8 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-[#e8572a]/30 hover:bg-[#d04920] transition-colors"
            >
              Join Voice AI Waitlist <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/images/op-logo-arc.png"
                  alt="Operator"
                  className="h-5 w-5 object-contain"
                />
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
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  Product
                </p>
                <Link
                  href="/enterprise-ai-deployment"
                  className="block text-slate-600 hover:text-[#e8572a]"
                >
                  Enterprise Deployment
                </Link>
                <Link
                  href="/live-command-center"
                  className="block text-slate-600 hover:text-[#e8572a]"
                >
                  Command Center
                </Link>
                <Link
                  href="/ai-sales-agent-builder"
                  className="block text-slate-600 hover:text-[#e8572a]"
                >
                  Agent Builder
                </Link>
                <Link
                  href="/autonomous-inbound-calling"
                  className="block text-[#e8572a] font-semibold"
                >
                  Inbound Calling ↗
                </Link>
                <Link
                  href="/call-scrubber-replay"
                  className="block text-slate-600 hover:text-[#e8572a]"
                >
                  Call Scrubber
                </Link>
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
