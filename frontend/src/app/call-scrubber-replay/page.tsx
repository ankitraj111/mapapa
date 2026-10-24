'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play, Pause, SkipBack, SkipForward, Bot, User, Clock,
  Target, TrendingUp, Calendar, UserCheck, CheckCircle2,
  ArrowRight, Check, Sparkles, MessageSquare, AlertCircle,
  Shield, Lock, Database, Activity, ChevronRight, Menu, X,
  Flame, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Fixed waveform data (40 bars, heights 20-80) ─── */
const WAVEFORM: number[] = [
  32, 45, 28, 60, 75, 42, 55, 38, 70, 48,
  35, 62, 50, 80, 40, 55, 30, 68, 52, 45,
  72, 38, 58, 44, 65, 36, 50, 62, 40, 75,
  48, 33, 58, 70, 42, 55, 38, 65, 45, 30,
];

/* ─── Timeline markers ─── */
interface TimelineMarker {
  time: string;
  label: string;
  color: string;
  dotColor: string;
  pos: number; // 0-100
}
const MARKERS: TimelineMarker[] = [
  { time: '00:12', label: 'Requirement identified', color: 'text-blue-600', dotColor: 'bg-blue-500', pos: 6 },
  { time: '00:41', label: 'Budget discussed',       color: 'text-amber-600', dotColor: 'bg-amber-500', pos: 20 },
  { time: '01:18', label: 'Timeline confirmed',     color: 'text-emerald-600', dotColor: 'bg-emerald-500', pos: 38 },
  { time: '02:05', label: 'Objection detected',     color: 'text-rose-600', dotColor: 'bg-rose-500', pos: 61 },
  { time: '02:42', label: 'Meeting requested',      color: 'text-violet-600', dotColor: 'bg-violet-500', pos: 79 },
];

/* ─── Transcript lines ─── */
interface TranscriptLine {
  speaker: 'AI' | 'Prospect';
  text: string;
  time: string;
  posThreshold: number; // scrubberPos at which this line becomes "past"
}
const TRANSCRIPT: TranscriptLine[] = [
  { speaker: 'AI',      text: 'Hi! Thanks for reaching out. Can you tell me what you\'re looking for?', time: '0:03', posThreshold: 2 },
  { speaker: 'Prospect',text: 'We need a new website for our company.',                                  time: '0:08', posThreshold: 4 },
  { speaker: 'AI',      text: 'Great! What\'s your expected timeline for the project?',                 time: '0:14', posThreshold: 7 },
  { speaker: 'Prospect',text: 'We want to launch within two months.',                                    time: '0:21', posThreshold: 10 },
  { speaker: 'AI',      text: 'And do you have a budget range in mind?',                                time: '0:28', posThreshold: 13 },
  { speaker: 'Prospect',text: 'Around 2 to 3 lakhs.',                                                    time: '0:35', posThreshold: 17 },
  { speaker: 'AI',      text: 'Perfect, that aligns well with our packages. Let me share some details...', time: '0:41', posThreshold: 20 },
];

/* ─── Intelligence cards ─── */
const INTEL_CARDS = [
  { icon: Target,          title: 'Intent Detection',              desc: 'Automatically detect purchase intent from voice tone, keywords, and phrasing.' },
  { icon: BarChart3,       title: 'Budget Extraction',             desc: 'Pull out budget signals mentioned during the conversation and map to deal tiers.' },
  { icon: Calendar,        title: 'Timeline Analysis',             desc: 'Extract project timelines and urgency signals from spoken conversation.' },
  { icon: CheckCircle2,    title: 'Requirement Mapping',           desc: 'Structure free-form spoken requirements into CRM-ready qualification fields.' },
  { icon: AlertCircle,     title: 'Objection Detection',           desc: 'Flag hesitations, objections, and concerns for sales team review.' },
  { icon: Flame,           title: 'Buying Signal Recognition',     desc: 'Score positive signals like "we want to start soon" or "let\'s move forward".' },
  { icon: ArrowRight,      title: 'Next Best Action',              desc: 'Automatically suggest the optimal follow-up step based on call content.' },
  { icon: UserCheck,       title: 'Human Escalation Triggers',     desc: 'Define conditions that instantly route a call to a live human agent.' },
];

/* ─── Pipeline steps ─── */
const PIPELINE = [
  { step: 1, label: 'CALL',              desc: 'Inbound or outbound AI voice conversation.' },
  { step: 2, label: 'TRANSCRIPT',        desc: 'Auto-generated, speaker-labelled text transcript.' },
  { step: 3, label: 'EXTRACTED SIGNALS', desc: 'Budget, timeline, intent, and requirements pulled from text.' },
  { step: 4, label: '0–100 SCORE',       desc: 'Same scoring engine already used on text channels.' },
  { step: 5, label: 'NEXT BEST ACTION',  desc: 'AI-recommended follow-up task or workflow trigger.' },
  { step: 6, label: 'FOLLOW-UP',         desc: 'Automated or manual outreach triggered immediately.' },
  { step: 7, label: 'MEETING',           desc: 'Qualified prospect booked into sales calendar.' },
  { step: 8, label: 'REVENUE',           desc: 'Closed deal attributed back to the original AI call.' },
];

/* ─── Privacy cards ─── */
const PRIVACY_CARDS = [
  { icon: Shield,   title: 'Recording Consent',    desc: 'Future dual-consent flows with jurisdiction-aware disclosures before any recording starts.' },
  { icon: Lock,     title: 'Recording Status',     desc: 'Planned per-call recording toggle visible to both the AI agent and human supervisors.' },
  { icon: Database, title: 'Retention Settings',   desc: 'Configurable retention windows with auto-deletion policies for recorded audio files.' },
  { icon: Activity, title: 'Access Control',       desc: 'Role-based access so only authorised team members can replay or download recordings.' },
];

/* ════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function CallScrubberReplayPage() {
  /* Shared player state */
  const [scrubberPos, setScrubberPos] = useState<number>(0);
  const [isPlaying, setIsPlaying]     = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Auto-advance scrubber */
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setScrubberPos(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return +(prev + 0.5).toFixed(1);
        });
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  /* Helpers */
  const currentSeconds = Math.round((scrubberPos / 100) * 204); // 3:24 = 204s
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handlePlayPause = () => {
    if (scrubberPos >= 100) setScrubberPos(0);
    setIsPlaying(p => !p);
  };

  const handleSkipBack  = () => setScrubberPos(p => Math.max(0, +(p - 10).toFixed(1)));
  const handleSkipFwd   = () => setScrubberPos(p => Math.min(100, +(p + 10).toFixed(1)));

  /* Active transcript line */
  const activeTranscriptIdx = TRANSCRIPT.reduce((acc, line, i) =>
    scrubberPos >= line.posThreshold ? i : acc, -1);

  /* Mobile nav */
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fb] font-[\'Space_Grotesk\',sans-serif]">

      {/* ── Announcement bar ── */}
      <aside className="relative z-[210] flex h-9 items-center justify-center gap-2 overflow-hidden whitespace-nowrap bg-[#0c0e14] px-4 text-[12.5px] font-medium text-white">
        <span className="font-semibold text-[#e8572a]">New:</span>
        <span>AI Revenue Operator 2.0 — Autonomous 24/7 AI Sales Employee →</span>
        <Link href="/register" className="ml-1 underline decoration-[#e8572a] hover:text-[#e8572a] font-semibold">Deploy Free</Link>
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

          {/* Desktop links */}
          <div className="hidden items-center gap-1 xl:gap-2 lg:flex text-[13px] font-medium text-slate-600">
            <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Home</Link>
            <Link href="/enterprise-ai-deployment" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Enterprise Deployment</Link>
            <Link href="/ai-sales-agent-builder" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Agent Builder</Link>
            <Link href="/live-command-center" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Command Center</Link>
            <Link href="/autonomous-inbound-calling" className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">Inbound Calling</Link>
            <span className="rounded-full px-3 py-1.5 bg-orange-50 border border-orange-200 text-[#e8572a] font-semibold cursor-default">Call Scrubber</span>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="px-3 py-2 text-[14px] font-medium text-slate-700">Sign in</Link>
            <Link href="/register" className="rounded-full bg-[#e8572a] px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-[#d04920]">Join Waitlist</Link>
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 text-slate-700" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-[72px] z-[190] border-b border-slate-200 bg-white px-5 py-4 shadow-lg lg:hidden">
            <div className="flex flex-col gap-2 text-[14px] font-medium text-slate-700">
              <Link href="/" className="py-2" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link href="/enterprise-ai-deployment" className="py-2" onClick={() => setMobileOpen(false)}>Enterprise Deployment</Link>
              <Link href="/ai-sales-agent-builder" className="py-2" onClick={() => setMobileOpen(false)}>Agent Builder</Link>
              <Link href="/live-command-center" className="py-2" onClick={() => setMobileOpen(false)}>Live Command Center</Link>
              <Link href="/autonomous-inbound-calling" className="py-2" onClick={() => setMobileOpen(false)}>Inbound Calling</Link>
              <span className="py-2 font-semibold text-[#e8572a]">Call Scrubber &amp; Replay</span>
              <Link href="/register" className="mt-2 rounded-full bg-[#e8572a] px-5 py-2.5 text-center font-semibold text-white" onClick={() => setMobileOpen(false)}>Join Waitlist</Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-white/75">
        {/* Subtle grid bg */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e8572a08_1px,transparent_1px),linear-gradient(to_bottom,#e8572a08_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 py-20 md:py-28 items-center">

            {/* Left */}
            <div>
              {/* Eyebrow */}
              <div className="flex flex-wrap items-center gap-2.5 mb-6">
                <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  Call Scrubber &amp; Replay
                </span>
                <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  COMING SOON
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight leading-[1.12] text-[#0c0e14] mb-5">
                Every AI Call.<br />
                <span className="text-[#e8572a]">Reviewable, Searchable,</span><br />
                Actionable.
              </h1>

              <p className="text-slate-600 text-[15px] leading-relaxed mb-6 max-w-xl">
                Turn future AI voice conversations into structured sales intelligence with call playback,
                transcripts, lead scoring and conversation insights — all feeding the same revenue pipeline
                as your existing text channels.
              </p>

              {/* Amber alert */}
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-8 max-w-xl">
                <AlertCircle size={16} className="mt-0.5 text-amber-600 shrink-0" />
                <p className="text-[13px] text-amber-800 font-medium leading-snug">
                  Call Scrubber &amp; Replay is a planned roadmap feature — not currently available.
                  Join the waitlist to be notified at launch.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-[#e8572a] px-6 py-3 text-[14px] font-semibold text-white shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920] transition-colors flex items-center gap-2"
                >
                  Join Voice AI Waitlist <ArrowRight size={14} />
                </Link>
                <Link
                  href="#player"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-[13.5px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  See the Preview
                </Link>
              </div>
            </div>

            {/* Right — Hero player card */}
            <div className="relative">
              {/* DEMO label */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-amber-500 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow tracking-widest uppercase">
                  SAMPLE DEMO — NOT A REAL RECORDING
                </span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/60 p-6 pt-8">
                {/* Call info */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0c0e14]">Inbound Call — Website Lead</p>
                    <p className="text-[12px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Clock size={11} /> 3:24 &nbsp;·&nbsp; Demo Data
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                    <TrendingUp size={12} className="text-emerald-600" />
                    <span className="font-mono text-[12px] font-bold text-emerald-700">78</span>
                    <span className="text-[11px] text-emerald-600">/100</span>
                  </div>
                </div>

                {/* Mini waveform */}
                <div className="flex items-end gap-[2px] h-12 mb-4">
                  {WAVEFORM.map((h, i) => {
                    const pct = (i / WAVEFORM.length) * 100;
                    return (
                      <div
                        key={i}
                        style={{ height: `${h * 0.6}%` }}
                        className={cn(
                          'flex-1 rounded-sm transition-colors duration-75',
                          pct <= scrubberPos ? 'bg-[#e8572a]' : 'bg-slate-200'
                        )}
                      />
                    );
                  })}
                </div>

                {/* Scrubber */}
                <input
                  type="range" min={0} max={100} value={scrubberPos}
                  onChange={e => setScrubberPos(Number(e.target.value))}
                  className="w-full accent-[#e8572a] cursor-pointer mb-2"
                />

                {/* Time */}
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-4">
                  <span>{formatTime(currentSeconds)}</span>
                  <span>3:24</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-5">
                  <button onClick={handleSkipBack}
                    className="rounded-full p-2 hover:bg-slate-100 transition-colors text-slate-600">
                    <SkipBack size={18} />
                  </button>
                  <button onClick={handlePlayPause}
                    className="rounded-full bg-[#e8572a] p-3 shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920] transition-colors text-white">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button onClick={handleSkipFwd}
                    className="rounded-full p-2 hover:bg-slate-100 transition-colors text-slate-600">
                    <SkipForward size={18} />
                  </button>
                </div>

                {/* Timeline markers (hero mini) */}
                <div className="flex flex-wrap gap-1.5">
                  {MARKERS.map(m => (
                    <button
                      key={m.time}
                      onClick={() => setScrubberPos(m.pos)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium transition-all',
                        scrubberPos >= m.pos
                          ? 'border-[#e8572a]/40 bg-orange-50 text-[#e8572a]'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', m.dotColor)} />
                      {m.time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker labels */}
              <div className="flex justify-between mt-3 px-1">
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <Bot size={13} className="text-[#e8572a]" />
                  <span>AI Employee</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span>Prospect</span>
                  <User size={13} className="text-slate-500" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 1 — CALL PLAYER
      ══════════════════════════════════════════ */}
      <section id="player" className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            {/* Rail dot */}
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">Call Player</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Replay the Conversation,<br />Not Just the Outcome
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-10 max-w-2xl">
              The planned Call Scrubber gives you a visual, interactive player for every AI voice call —
              complete with waveform, transcript sync, and smart event markers.
            </p>

            {/* Large player mockup */}
            <div className="max-w-3xl">
              {/* DEMO badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-100 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  DEMO DATA
                </span>
                <span className="text-[12px] text-slate-500 font-mono">Sample illustration — not a real recording</span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div>
                    <p className="text-[14px] font-bold text-[#0c0e14]">Ananya S.</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[12px] text-slate-500">
                        <Calendar size={11} /> Sep 22, 2026
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-slate-500">
                        <Clock size={11} /> 3:24
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      COMING SOON
                    </span>
                  </div>
                </div>

                <div className="px-6 pt-6 pb-5">
                  {/* Waveform */}
                  <div className="flex items-end gap-[2px] h-20 mb-4 px-1">
                    {WAVEFORM.map((h, i) => {
                      const pct = (i / WAVEFORM.length) * 100;
                      return (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={cn(
                            'flex-1 rounded-sm transition-colors duration-75',
                            pct <= scrubberPos ? 'bg-[#e8572a]' : 'bg-slate-200'
                          )}
                        />
                      );
                    })}
                  </div>

                  {/* Marker dots on waveform */}
                  <div className="relative h-4 mb-1">
                    {MARKERS.map(m => (
                      <button
                        key={m.time}
                        onClick={() => setScrubberPos(m.pos)}
                        style={{ left: `${m.pos}%` }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                        title={m.label}
                      >
                        <span className={cn('block w-2.5 h-2.5 rounded-full border-2 border-white shadow', m.dotColor)} />
                      </button>
                    ))}
                  </div>

                  {/* Scrubber */}
                  <input
                    type="range" min={0} max={100} value={scrubberPos}
                    onChange={e => setScrubberPos(Number(e.target.value))}
                    className="w-full accent-[#e8572a] cursor-pointer mb-2"
                  />

                  {/* Time */}
                  <div className="flex justify-between text-[12px] font-mono text-slate-500 mb-5">
                    <span>{formatTime(currentSeconds)}</span>
                    <span>3:24</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <button onClick={handleSkipBack}
                      className="rounded-full p-2.5 hover:bg-slate-100 transition-colors text-slate-600">
                      <SkipBack size={20} />
                    </button>
                    <button onClick={handlePlayPause}
                      className="rounded-full bg-[#e8572a] p-4 shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920] transition-colors text-white">
                      {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                    </button>
                    <button onClick={handleSkipFwd}
                      className="rounded-full p-2.5 hover:bg-slate-100 transition-colors text-slate-600">
                      <SkipForward size={20} />
                    </button>
                  </div>

                  {/* Speaker labels */}
                  <div className="flex gap-6 justify-center text-[12px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Bot size={13} className="text-[#e8572a]" />
                      <span>AI Employee</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={13} />
                      <span>Prospect</span>
                    </div>
                  </div>

                  {/* Timeline markers legend */}
                  <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MARKERS.map(m => (
                      <button
                        key={m.time}
                        onClick={() => setScrubberPos(m.pos)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all text-[12px]',
                          scrubberPos >= m.pos
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        )}
                      >
                        <span className={cn('w-2 h-2 rounded-full shrink-0', m.dotColor)} />
                        <div>
                          <p className="font-mono text-[10px] text-slate-500">{m.time}</p>
                          <p className={cn('font-medium', scrubberPos >= m.pos ? 'text-[#e8572a]' : 'text-slate-700')}>{m.label}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[12px] text-slate-400 font-mono text-center">
                Sample data only — illustrating the planned Call Scrubber &amp; Replay feature
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — TRANSCRIPT
      ══════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">Live Transcript</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Read Every Conversation
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-8 max-w-xl">
              Auto-generated transcripts with speaker labels let your team skim, search, and quote any part of the call in seconds.
            </p>

            <div className="max-w-2xl">
              {/* SAMPLE DATA badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-amber-100 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  SAMPLE DATA
                </span>
                <span className="text-[12px] text-slate-500 font-mono">Scrub the player above to sync transcript</span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-3">
                {TRANSCRIPT.map((line, i) => {
                  const isActive = i === activeTranscriptIdx;
                  const isPast   = i < activeTranscriptIdx;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex gap-3 transition-all duration-300',
                        line.speaker === 'Prospect' && 'flex-row-reverse',
                        isActive && 'scale-[1.01]'
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold shadow-sm',
                        line.speaker === 'AI' ? 'bg-[#e8572a]' : 'bg-slate-500'
                      )}>
                        {line.speaker === 'AI' ? <Bot size={13} /> : <User size={13} />}
                      </div>

                      {/* Bubble */}
                      <div className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-snug transition-all duration-300',
                        line.speaker === 'AI'
                          ? cn('bg-orange-50 border border-orange-100 text-[#0c0e14] rounded-tl-none', isActive && 'ring-2 ring-[#e8572a]/30 shadow-sm')
                          : cn('bg-slate-100 border border-slate-200 text-slate-800 rounded-tr-none', isActive && 'ring-2 ring-slate-400/30 shadow-sm'),
                        !isActive && !isPast && 'opacity-60'
                      )}>
                        <p className="font-mono text-[10px] mb-1 opacity-60">{line.speaker === 'AI' ? 'AI Employee' : 'Prospect'} · {line.time}</p>
                        <p>{line.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — LEAD SCORE
      ══════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">Lead Intelligence</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Turn Conversations Into Sales Signals
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-10 max-w-xl">
              Every spoken signal — budget, timeline, requirement — feeds the same 0–100 scoring engine
              already powering your text-channel leads.
            </p>

            <div className="grid md:grid-cols-2 gap-10 max-w-3xl items-center">
              {/* Circular score */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-44 h-44">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#e8572a" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40 * 0.78} ${2 * Math.PI * 40}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[42px] font-bold text-[#0c0e14] leading-none">78</span>
                    <span className="text-[13px] text-slate-500 font-mono">/100</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold text-[#0c0e14]">Lead Score</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      COMING SOON — Voice
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-2 max-w-[200px]">
                    Same 0–100 engine as text channels. Voice adds a new input layer.
                  </p>
                </div>
              </div>

              {/* Signal bars */}
              <div className="space-y-4">
                {[
                  { label: 'Budget',       detail: 'Mentioned ₹2–3L',   status: 'Confirmed', color: 'bg-emerald-500', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200', pct: 90 },
                  { label: 'Timeline',     detail: '2 months',           status: 'Confirmed', color: 'bg-emerald-500', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200', pct: 85 },
                  { label: 'Requirement',  detail: 'Website redesign',   status: 'Confirmed', color: 'bg-emerald-500', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200', pct: 95 },
                  { label: 'Intent',       detail: 'High interest',      status: 'Strong',    color: 'bg-rose-500',    textColor: 'text-rose-700',    badgeBg: 'bg-rose-50 border-rose-200',       pct: 78 },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-slate-200/80 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-semibold text-[#0c0e14]">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-slate-500">{s.detail}</span>
                        <span className={cn('flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2 py-0.5', s.badgeBg, s.textColor)}>
                          <Check size={10} /> {s.status}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-700', s.color)} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-[13px] text-slate-500 max-w-xl leading-relaxed bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <span className="font-semibold text-[#0c0e14]">Already live on text:</span> The existing AI Revenue Operator already uses this 0–100 scoring system.
              Voice calls will feed into the same scoring engine when Call Scrubber launches.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — CONVERSATION INTELLIGENCE
      ══════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">Conversation Intelligence</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Understand What Happened on the Call
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-3 max-w-xl">
              Eight planned intelligence modules extract actionable signals from every voice conversation.
            </p>
            <p className="text-[13px] text-slate-500 mb-10 max-w-xl bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              Text-based qualification signals already work in AI Revenue Operator. Voice adds a new input layer to the same intelligence engine.
            </p>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 max-w-5xl">
              {INTEL_CARDS.map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-shadow p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="rounded-xl bg-orange-50 border border-orange-100 p-2.5">
                        <Icon size={16} className="text-[#e8572a]" />
                      </div>
                      <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                        COMING SOON
                      </span>
                    </div>
                    <p className="text-[13px] font-bold text-[#0c0e14] mb-1.5">{card.title}</p>
                    <p className="text-[12px] text-slate-500 leading-snug">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — TIMELINE / SCRUBBER
      ══════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">Smart Timeline</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Jump Directly to the Important Moment
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-4 max-w-xl">
              AI-tagged events let you click straight to the budget discussion, objection, or close — no more scrubbing blindly through recordings.
            </p>

            <div className="flex items-center gap-2 mb-8">
              <span className="bg-amber-100 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                SAMPLE DATA
              </span>
              <span className="text-[12px] text-slate-500 font-mono">Click any event to jump to that moment</span>
            </div>

            <div className="max-w-3xl">
              {/* Interactive timeline bar */}
              <div className="relative mb-6">
                {/* Track */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#e8572a] rounded-full transition-all duration-300"
                    style={{ width: `${scrubberPos}%` }}
                  />
                </div>
                {/* Marker dots on track */}
                {MARKERS.map(m => (
                  <button
                    key={m.time}
                    onClick={() => setScrubberPos(m.pos)}
                    style={{ left: `${m.pos}%` }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                    title={m.label}
                  >
                    <span className={cn(
                      'block w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125',
                      m.dotColor,
                      scrubberPos >= m.pos && 'scale-110'
                    )} />
                  </button>
                ))}
              </div>

              {/* Event cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MARKERS.map(m => (
                  <button
                    key={m.time}
                    onClick={() => setScrubberPos(m.pos)}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md',
                      scrubberPos >= m.pos
                        ? 'border-orange-200 bg-orange-50 shadow-sm'
                        : 'border-slate-200 bg-white'
                    )}
                  >
                    <span className={cn('mt-0.5 w-3 h-3 rounded-full shrink-0', m.dotColor)} />
                    <div>
                      <p className={cn('font-mono text-[11px] font-bold', m.color)}>{m.time}</p>
                      <p className={cn('text-[13px] font-semibold mt-0.5', scrubberPos >= m.pos ? 'text-[#e8572a]' : 'text-[#0c0e14]')}>
                        {m.label}
                      </p>
                    </div>
                    {scrubberPos >= m.pos && <Check size={12} className="ml-auto text-[#e8572a] mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — FROM CALL TO PIPELINE
      ══════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">Revenue Pipeline</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Every Call Becomes a Revenue Record
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-10 max-w-xl">
              Voice conversations feed the same revenue pipeline as every other channel in AI Revenue Operator —
              structured, scored, and ready for action.
            </p>

            <div className="max-w-2xl">
              <div className="relative">
                {/* Vertical connector */}
                <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#e8572a] via-slate-200 to-slate-200" />

                <div className="space-y-4">
                  {PIPELINE.map((p, i) => (
                    <div key={p.step} className="flex items-start gap-4">
                      {/* Node */}
                      <div className={cn(
                        'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold shadow-sm',
                        i === 0 ? 'border-[#e8572a] bg-[#e8572a] text-white' :
                        i === PIPELINE.length - 1 ? 'border-emerald-500 bg-emerald-500 text-white' :
                        'border-slate-200 bg-white text-slate-600'
                      )}>
                        {p.step}
                      </div>
                      {/* Content */}
                      <div className="flex-1 bg-white border border-slate-200/80 rounded-xl px-4 py-3 shadow-xs">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13px] font-bold font-mono text-[#0c0e14]">{p.label}</p>
                          {i === 0 && (
                            <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              COMING SOON
                            </span>
                          )}
                          {i > 0 && i < 4 && (
                            <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              COMING SOON
                            </span>
                          )}
                          {i >= 4 && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-slate-500">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-[13px] text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3">
                Steps 5–8 are already working in the current platform for text-qualified leads.
                Voice integration (steps 1–4) is the planned addition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — HUMAN REVIEW
      ══════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-white/75">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">Human Review</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Give Your Team the Full Conversation Context
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-10 max-w-xl">
              When a lead is flagged for <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[13px] text-[#e8572a]">HUMAN_REVIEW</code>,
              your team sees the entire call context — transcript, score, summary, and replay controls — not just a notification.
            </p>

            <div className="grid lg:grid-cols-2 gap-10 max-w-4xl items-start">
              {/* Flow diagram */}
              <div className="space-y-3">
                {[
                  { label: 'AI Call',       icon: Bot,          desc: 'Voice conversation completed',     badge: null,          color: 'border-orange-200 bg-orange-50' },
                  { label: 'AI Summary',    icon: Sparkles,     desc: 'Auto-generated call summary',      badge: 'COMING SOON', color: 'border-orange-200 bg-orange-50' },
                  { label: 'Transcript',    icon: MessageSquare,desc: 'Full speaker-labelled transcript',  badge: 'COMING SOON', color: 'border-orange-200 bg-orange-50' },
                  { label: 'Lead Score',    icon: TrendingUp,   desc: 'Updated 0–100 score',              badge: 'COMING SOON', color: 'border-orange-200 bg-orange-50' },
                  { label: 'HUMAN_REVIEW',  icon: UserCheck,    desc: 'Flagged for team action',           badge: 'LIVE',        color: 'border-emerald-200 bg-emerald-50' },
                ].map((step, i, arr) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.label}>
                      <div className={cn('flex items-center gap-3 rounded-xl border p-3.5', step.color)}>
                        <div className="rounded-lg bg-white border border-white/80 p-2 shadow-sm">
                          <Icon size={15} className={step.badge === 'LIVE' ? 'text-emerald-600' : 'text-[#e8572a]'} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-bold text-[#0c0e14] font-mono">{step.label}</p>
                          <p className="text-[11px] text-slate-500">{step.desc}</p>
                        </div>
                        {step.badge === 'COMING SOON' && (
                          <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            COMING SOON
                          </span>
                        )}
                        {step.badge === 'LIVE' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            LIVE
                          </span>
                        )}
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex justify-center my-1">
                          <ChevronRight size={14} className="rotate-90 text-slate-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* HUMAN_REVIEW card mockup */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-amber-50">
                  <div className="flex items-center gap-2">
                    <UserCheck size={15} className="text-amber-600" />
                    <span className="font-mono text-[12px] font-bold text-amber-800">HUMAN_REVIEW</span>
                  </div>
                  <span className="bg-amber-100 text-amber-700 border border-amber-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                    DEMO MOCKUP
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Score */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                      <TrendingUp size={12} className="text-emerald-600" />
                      <span className="font-mono text-[13px] font-bold text-emerald-700">78</span>
                      <span className="text-[11px] text-emerald-600">/100</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0c0e14]">Ananya S.</p>
                      <p className="text-[11px] text-slate-500">Inbound · Website Lead · 3:24</p>
                    </div>
                  </div>

                  {/* AI summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <p className="font-mono text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                      <Sparkles size={10} /> AI SUMMARY
                    </p>
                    <p className="text-[12px] text-slate-700 leading-snug">
                      Prospect confirmed budget of ₹2–3L and 2-month timeline for a website redesign.
                      High intent. Meeting requested. Recommended next action: schedule discovery call.
                    </p>
                  </div>

                  {/* Transcript excerpt */}
                  <div>
                    <p className="font-mono text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                      <MessageSquare size={10} /> TRANSCRIPT EXCERPT
                    </p>
                    <div className="space-y-1.5 text-[12px]">
                      <p><span className="font-semibold text-[#e8572a]">AI:</span> <span className="text-slate-600">And do you have a budget range in mind?</span></p>
                      <p><span className="font-semibold text-slate-700">Prospect:</span> <span className="text-slate-600">Around 2 to 3 lakhs.</span></p>
                      <p><span className="font-semibold text-[#e8572a]">AI:</span> <span className="text-slate-600">Perfect, that aligns well with our packages...</span></p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 rounded-full bg-[#e8572a] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#d04920] transition-colors flex items-center justify-center gap-1.5">
                      <UserCheck size={12} /> Take Over
                    </button>
                    <button className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={12} /> Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-[13px] text-slate-500 max-w-xl bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <span className="font-semibold text-[#0c0e14]">Already live:</span> HUMAN_REVIEW already works in the existing platform for text-qualified leads.
              Call Scrubber adds the voice layer, enriching the review card with transcript and replay controls.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8 — PRIVACY & CONSENT
      ══════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
            <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
              <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
              <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">Privacy &amp; Compliance</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] mb-4">
              Responsible Call Recording
            </h2>
            <p className="text-slate-600 text-[14px] leading-relaxed mb-8 max-w-xl">
              When voice recording ships, it will include the controls your team needs to stay compliant and in control.
            </p>

            {/* Amber caution */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 mb-10 max-w-2xl">
              <AlertCircle size={16} className="mt-0.5 text-amber-600 shrink-0" />
              <p className="text-[13px] text-amber-800 leading-relaxed">
                <span className="font-semibold">Legal notice:</span> Legal and privacy requirements for call recording vary by jurisdiction.
                This is a planned future capability — no compliance certifications are currently claimed for voice.
                Consult your legal counsel before deploying any call-recording solution.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 max-w-4xl">
              {PRIVACY_CARDS.map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-shadow p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                        <Icon size={16} className="text-slate-600" />
                      </div>
                      <span className="bg-orange-100 text-orange-700 border border-orange-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                        COMING SOON
                      </span>
                    </div>
                    <p className="text-[13px] font-bold text-[#0c0e14] mb-1.5">{card.title}</p>
                    <p className="text-[12px] text-slate-500 leading-snug">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA — Dark block
      ══════════════════════════════════════════ */}
      <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 py-16 md:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-[28px] bg-[#0c0e14] px-8 py-16 md:px-16 md:py-20 text-center"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(232,87,42,0.22) 0%, transparent 65%)',
            }}
          >
            {/* Glow dots */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#e8572a]/40 to-transparent" />

            <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a] mb-5 block">
              Voice AI — Coming Soon
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-[38px] font-bold tracking-tight text-white mb-4 max-w-2xl mx-auto">
              Make Every AI Conversation Actionable
            </h2>

            <p className="text-slate-400 text-[15px] leading-relaxed mb-10 max-w-lg mx-auto">
              Call intelligence is coming to AI Revenue Operator. Join the waitlist and be the first to replay,
              score, and act on every AI voice call — the moment it launches.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-full bg-[#e8572a] px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#e8572a]/30 hover:bg-[#d04920] transition-colors flex items-center gap-2"
              >
                Join Voice AI Waitlist <ArrowRight size={15} />
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors"
              >
                View Live Features
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['No audio stored yet', 'Same scoring engine', 'No commitments'].map(b => (
                <span key={b} className="flex items-center gap-1.5 text-[12px] text-slate-400 font-mono">
                  <Check size={11} className="text-[#e8572a]" /> {b}
                </span>
              ))}
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
                <Link href="/call-scrubber-replay" className="block font-semibold text-[#e8572a]">Call Scrubber ← you are here</Link>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800">Company</p>
                <Link href="/register" className="block text-slate-600 hover:text-[#e8572a]">Book Demo</Link>
                <Link href="/login" className="block text-slate-600 hover:text-[#e8572a]">Sign In</Link>
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
