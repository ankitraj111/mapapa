'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, CheckCircle2, Flame, Calendar, Clock,
  Bot, ShieldCheck, Sparkles, MessageSquare, TrendingUp,
  BarChart3, ChevronDown, Check, RefreshCw, PhoneCall,
  Webhook, Star, Play, ArrowUpRight, Shield, Lock,
  ChevronRight, AlertCircle, Globe, Cpu, Terminal,
  Database, Activity, UserCheck, Users, Mail, Target,
  Layers, CheckCircle, Menu, X, HelpCircle, Laptop,
  Send, ExternalLink, Sliders, ChevronUp, Copy, CheckCheck, Plus, Minus,
  User, Building2, Video, Inbox, ListFilter, Workflow, Book,
  Phone, Volume2, Mic, MicOff, PhoneOff, Pause, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import InboundArchitecturePipeline from '@/components/ui/inbound-architecture-pipeline';
import ParallaxSkyline from '@/components/ui/parallax-skyline';

import {
  CLIENT_LOGOS,
  CLIENTS,
  SCENARIOS,
  TRANSCRIPT_STEPS,
  VOICE_SAMPLES,
  PRICING_PLANS,
  FAQS,
  PLAYBOOKS,
  SDR_COMPARISON_DATA,
  SECURITY_METRICS,
  CLIENT_REVIEWS,
  RAVAN_SCRUBBER_TAPES,
} from '@/lib/constants/landing-data';

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeNavDropdown, setActiveNavDropdown] = useState<'product' | 'solutions' | 'resources' | 'company' | null>(null);

  // Hero Interactive Calling Simulation State (Ravan.ai Style)
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callStep, setCallStep] = useState(0);
  const [waveHeights, setWaveHeights] = useState([14, 28, 20, 36, 18, 42, 24, 32, 16, 26, 12, 30]);

  // Ravan.ai Scrubber State
  const [selectedScrubberTape, setSelectedScrubberTape] = useState(0);
  const [scrubberTime, setScrubberTime] = useState(56);
  const [isScrubberPlaying, setIsScrubberPlaying] = useState(false);

  // Transcript Scrubber State
  const [activeTranscriptIndex, setActiveTranscriptIndex] = useState(3);

  // Interactive ROI Calculator State
  const [monthlyLeads, setMonthlyLeads] = useState(150);
  const [dealValue, setDealValue] = useState(150000);
  const [afterHoursPct, setAfterHoursPct] = useState(38);

  // Voice Samples Player State
  const [activeVoiceIndex, setActiveVoiceIndex] = useState(0);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  // Floating Maya Widget State
  const [quickWidgetOpen, setQuickWidgetOpen] = useState(false);

  const handlePlayVoice = (index: number) => {
    if (typeof window === 'undefined') return;

    if (isVoicePlaying && activeVoiceIndex === index) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsVoicePlaying(false);
      return;
    }

    setActiveVoiceIndex(index);
    setIsVoicePlaying(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(VOICE_SAMPLES[index].audioText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi') || v.name.toLowerCase().includes('india'));
      if (indianVoice) utterance.voice = indianVoice;

      utterance.onend = () => setIsVoicePlaying(false);
      utterance.onerror = () => setIsVoicePlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsVoicePlaying(false), 5000);
    }
  };

  const activeTape = RAVAN_SCRUBBER_TAPES[selectedScrubberTape];
  const activeScrubberDialogue = activeTape.dialogues.find(
    (d) => scrubberTime >= d.start && scrubberTime <= d.end
  ) || activeTape.dialogues[activeTape.dialogues.length - 1];

  const handlePlayScrubberVoice = () => {
    if (typeof window === 'undefined') return;

    if (isScrubberPlaying) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsScrubberPlaying(false);
      return;
    }

    setIsScrubberPlaying(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeScrubberDialogue.vernacular);
      utterance.rate = 0.92;
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang.includes('mr') || v.lang.includes('hi') || v.lang.includes('IN')
      );
      if (indianVoice) utterance.voice = indianVoice;

      utterance.onend = () => setIsScrubberPlaying(false);
      utterance.onerror = () => setIsScrubberPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsScrubberPlaying(false), 4000);
    }
  };

  // Industry Playbook State
  const [activePlaybook, setActivePlaybook] = useState(0);

  // Interactive Webhook & API Code Tab State
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const estimatedQualifiedLeads = Math.round(monthlyLeads * 0.45);
  const estimatedMeetings = Math.round(estimatedQualifiedLeads * 0.40);
  const estimatedPipeline = estimatedMeetings * dealValue;

  const currentScenario = SCENARIOS[selectedScenario];

  // Call timer & dynamic frequency waveform effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let stepTimer: NodeJS.Timeout;

    if (callState === 'live') {
      timer = setInterval(() => {
        setCallSeconds((s) => s + 1);
        setWaveHeights(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 32) + 8)
        );
      }, 400);

      stepTimer = setInterval(() => {
        setCallStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 2400);
    }

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [callState]);

  const handleStartCall = () => {
    setCallState('connecting');
    setCallSeconds(0);
    setCallStep(1);
    setTimeout(() => {
      setCallState('live');
    }, 1100);
  };

  const handleEndCall = () => {
    setCallState('ended');
  };

  const handleResetCall = () => {
    setCallState('idle');
    setCallSeconds(0);
    setCallStep(0);
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#desktop-nav-menu')) {
        setActiveNavDropdown(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#111827] font-sans antialiased selection:bg-[#e8572a] selection:text-white overflow-x-hidden">

      {/* ── TOP ANNOUNCEMENT BAR (RAVAN.AI STYLE) ───────────────────── */}
      <aside aria-label="Announcement" className="relative z-[210] flex h-9 items-center justify-center gap-2 overflow-hidden whitespace-nowrap bg-[#0c0e14] px-4 text-[12.5px] font-medium text-white transition-colors hover:bg-[#1a1f2c]">
        <span className="font-semibold text-[#e8572a]">New:</span>
        <span className="overflow-hidden text-ellipsis">
          AI Revenue Operator 2.0 is live — Autonomous 24/7 AI Sales Employee for Agencies →
        </span>
        <Link href="/register" className="ml-1 underline decoration-[#e8572a] hover:text-[#e8572a] font-semibold">
          Deploy Free
        </Link>
      </aside>

      {/* ── STICKY NAVBAR (RAVAN.AI STYLE WITH OPERATOR INFORMATION) ── */}
      <header className="sticky top-0 z-[200] h-[72px] border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <nav aria-label="Main" className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-5 md:px-8">
          
          {/* Brand — Uploaded Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <img
              src="/images/op-logo-arc.png"
              alt="Operator icon"
              className="h-6 w-6 object-contain"
              loading="eager"
            />
            <span className="text-[18px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
              operator<span className="text-[#e8572a]">.</span>
            </span>
          </Link>

          {/* Nav Items with Dropdowns (Exact Ravan.ai Layout + User Data - Click to Open) */}
          <div id="desktop-nav-menu" className="hidden items-center gap-1 xl:gap-2 lg:flex text-[14px] font-medium text-slate-600 whitespace-nowrap">
            
            {/* 1. Product Dropdown (2 Columns + Platform Overview Bar) */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveNavDropdown(prev => prev === 'product' ? null : 'product')}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[14px] font-medium transition-all cursor-pointer select-none",
                  activeNavDropdown === 'product' 
                    ? "border-2 border-slate-900 bg-white font-semibold text-slate-900 shadow-sm" 
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <span>Product</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeNavDropdown === 'product' && "rotate-180 text-slate-900")} />
              </button>

              {activeNavDropdown === 'product' && (
                <div className="absolute left-0 top-full mt-2 w-[580px] rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.16)] ring-1 ring-black/5 z-[250] animate-in fade-in slide-in-from-top-2 duration-150 whitespace-normal">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {/* Col 1 */}
                    <div className="space-y-3.5">
                      <a href="#how-it-works" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Enterprise AI Deployment
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Live autonomous pipeline — fully managed
                        </div>
                      </a>

                      <a href="#demo" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          AI Sales Agent Builder
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Brand voice, Indian accents & sandbox testing
                        </div>
                      </a>

                      <a href="#demo" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Autonomous Inbound Calling
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Sub-5s instant qualification & escalation
                        </div>
                      </a>

                      <a href="#scrubber" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Call Scrubber & Replay
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Interactive audio player & 0–100 lead score
                        </div>
                      </a>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-3.5">
                      <a href="#dashboard" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Live Command Center
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Pipeline telemetry & 3D globe console
                        </div>
                      </a>

                      <a href="#how-it-works" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Grounded Knowledge Base
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Strictly grounded in approved pricing & FAQs
                        </div>
                      </a>

                      <a href="#how-it-works" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Multi-Touch Sequences
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Automated WhatsApp & email cadence
                        </div>
                      </a>

                      <a href="#how-it-works" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Developer APIs & Webhooks
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          2-minute setup for forms, Webflow & CRMs
                        </div>
                      </a>
                    </div>

                    {/* Bottom Overview Bar */}
                    <div className="col-span-2 pt-1">
                      <a 
                        href="#dashboard" 
                        onClick={() => setActiveNavDropdown(null)}
                        className="flex items-center justify-between rounded-xl bg-[#f1f3f7] px-4 py-2.5 text-[12.5px] font-semibold text-slate-900 hover:bg-[#e5e8ee] transition-colors"
                      >
                        <span>Platform overview</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Solutions Dropdown (USE CASES + INDUSTRIES - Compact & Wrapped) */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveNavDropdown(prev => prev === 'solutions' ? null : 'solutions')}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[14px] font-medium transition-all cursor-pointer select-none",
                  activeNavDropdown === 'solutions' 
                    ? "bg-slate-100 font-semibold text-slate-900 shadow-sm" 
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <span>Solutions</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeNavDropdown === 'solutions' && "rotate-180 text-slate-900")} />
              </button>

              {activeNavDropdown === 'solutions' && (
                <div className="absolute left-[-60px] top-full mt-2 w-[540px] rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.16)] ring-1 ring-black/5 z-[250] animate-in fade-in slide-in-from-top-2 duration-150 flex gap-6 whitespace-normal">
                  {/* Left: USE CASES */}
                  <div className="w-[245px] shrink-0">
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                      USE CASES
                    </div>
                    <div className="space-y-2">
                      <a href="#demo" onClick={() => setActiveNavDropdown(null)} className="flex items-center gap-1.5 text-[12.5px] font-medium text-slate-800 hover:text-[#e8572a] transition-colors py-0.5 leading-tight">
                        <span>Autonomous Revenue Operator</span>
                        <span className="rounded bg-orange-100 px-1 py-0.2 text-[9px] font-extrabold text-[#e8572a]">NEW</span>
                      </a>
                      <a href="#demo" onClick={() => setActiveNavDropdown(null)} className="block text-[12.5px] font-medium text-slate-800 hover:text-[#e8572a] transition-colors py-0.5 leading-tight">
                        Inbound Lead Qualification
                      </a>
                      <a href="#scrubber" onClick={() => setActiveNavDropdown(null)} className="block text-[12.5px] font-medium text-slate-800 hover:text-[#e8572a] transition-colors py-0.5 leading-tight">
                        0–100 Lead Scoring Engine
                      </a>
                      <a href="#demo" onClick={() => setActiveNavDropdown(null)} className="block text-[12.5px] font-medium text-slate-800 hover:text-[#e8572a] transition-colors py-0.5 leading-tight">
                        Google Meet Instant Booking
                      </a>
                      <a href="#how-it-works" onClick={() => setActiveNavDropdown(null)} className="block text-[12.5px] font-medium text-slate-800 hover:text-[#e8572a] transition-colors py-0.5 leading-tight">
                        Multi-Touch WhatsApp Sequences
                      </a>
                      <a href="#playbooks" onClick={() => setActiveNavDropdown(null)} className="block text-[12.5px] font-medium text-slate-800 hover:text-[#e8572a] transition-colors py-0.5 leading-tight">
                        After-Hours Pipeline (24/7)
                      </a>
                      <a href="#playbooks" onClick={() => setActiveNavDropdown(null)} className="block text-[12.5px] font-medium text-slate-800 hover:text-[#e8572a] transition-colors py-0.5 leading-tight">
                        High-Ticket Budget Discovery
                      </a>
                      <a href="#dashboard" onClick={() => setActiveNavDropdown(null)} className="block text-[12.5px] font-medium text-slate-800 hover:text-[#e8572a] transition-colors py-0.5 leading-tight">
                        Instant Human Rep Handoff
                      </a>
                    </div>
                  </div>

                  {/* Right: INDUSTRIES */}
                  <div className="pl-5 border-l border-slate-100 flex-1">
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                      INDUSTRIES
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { name: 'Digital Marketing Agencies', tag: 'Retainers' },
                        { name: 'Luxury Real Estate & Developers', tag: '₹2.5Cr+' },
                        { name: 'B2B SaaS & Tech Enterprises', tag: 'After-Hours' },
                        { name: 'High-Ticket Consulting', tag: 'Advisory' },
                        { name: 'BFSI & Wealth Advisory' },
                        { name: 'Executive Coaching & EdTech' },
                        { name: 'Specialized Healthcare' },
                        { name: 'High-AOV Luxury D2C' },
                        { name: 'Architecture & Design' },
                        { name: 'Commercial Solar & Infra' },
                        { name: 'Corporate Legal & CA' },
                        { name: 'Hospitality & Luxury Travel' },
                        { name: 'Enterprise Contact Centres' },
                      ].map((ind) => (
                        <a
                          key={ind.name}
                          href="#playbooks"
                          onClick={() => setActiveNavDropdown(null)}
                          className="flex items-center justify-between text-[12px] font-medium text-slate-700 hover:text-[#e8572a] transition-colors py-0.5 group"
                        >
                          <span>{ind.name}</span>
                          {ind.tag && (
                            <span className="text-[9px] font-semibold text-slate-400 group-hover:text-[#e8572a] transition-colors">
                              {ind.tag}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Pricing Link */}
            <a 
              href="#pricing" 
              className="rounded-full px-4 py-1.5 text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Pricing
            </a>

            {/* 4. Resources Dropdown (2 Columns - Compact & Wrapped) */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveNavDropdown(prev => prev === 'resources' ? null : 'resources')}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[14px] font-medium transition-all cursor-pointer select-none",
                  activeNavDropdown === 'resources' 
                    ? "bg-slate-100 font-semibold text-slate-900 shadow-sm" 
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <span>Resources</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeNavDropdown === 'resources' && "rotate-180 text-slate-900")} />
              </button>

              {activeNavDropdown === 'resources' && (
                <div className="absolute left-[-120px] top-full mt-2 w-[580px] rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.16)] ring-1 ring-black/5 z-[250] animate-in fade-in slide-in-from-top-2 duration-150 whitespace-normal">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {/* Col 1 */}
                    <div className="space-y-3.5">
                      <a href="#how-it-works" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Developer Documentation
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          REST webhooks, API auth & cURL guides
                        </div>
                      </a>

                      <a href="#demo" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Languages & Accents
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Indian English, Hindi & regional demos
                        </div>
                      </a>

                      <a href="#case-studies" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Interactive ROI Calculator
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Calculate ₹13.2L annual savings vs reps
                        </div>
                      </a>

                      <a href="#faq" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Frequently Asked Questions
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Fast answers on scoring, SLAs & pricing
                        </div>
                      </a>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-3.5">
                      <a href="#reviews" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Wall of Proof & Case Studies
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Verified pipeline metrics across clients
                        </div>
                      </a>

                      <a href="#how-it-works" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Integrations Directory
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Google Calendar, WhatsApp Cloud & CRMs
                        </div>
                      </a>

                      <a href="#film" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          The Film
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          Behind the scenes of autonomous revenue
                        </div>
                      </a>

                      <a href="#security" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                        <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                          Trust & Security Center
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                          99.98% SLA, DPDP & Mumbai AWS residency
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Company Dropdown (Single Column - Compact & Wrapped) */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveNavDropdown(prev => prev === 'company' ? null : 'company')}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[14px] font-medium transition-all cursor-pointer select-none",
                  activeNavDropdown === 'company' 
                    ? "bg-slate-100 font-semibold text-slate-900 shadow-sm" 
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <span>Company</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeNavDropdown === 'company' && "rotate-180 text-slate-900")} />
              </button>

              {activeNavDropdown === 'company' && (
                <div className="absolute right-0 top-full mt-2 w-[270px] rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.16)] ring-1 ring-black/5 z-[250] animate-in fade-in slide-in-from-top-2 duration-150 whitespace-normal">
                  <div className="space-y-3.5">
                    <a href="#reviews" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                      <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                        About operator.
                      </div>
                      <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                        Autonomous AI workforce for revenue teams
                      </div>
                    </a>

                    <a href="#case-studies" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                      <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                        Headcount Economics
                      </div>
                      <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                        ₹13.2L+ yearly savings vs human SDRs
                      </div>
                    </a>

                    <a href="tel:+911140566600" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                      <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                        Engineering Helpline
                      </div>
                      <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                        Direct Delhi line: +91 11 4056 6600
                      </div>
                    </a>

                    <a href="#demo" onClick={() => setActiveNavDropdown(null)} className="group block text-left">
                      <div className="text-[13.5px] font-semibold text-slate-900 group-hover:text-[#e8572a] transition-colors leading-tight">
                        Book a Strategy Session
                      </div>
                      <div className="text-[11.5px] text-slate-500 font-normal leading-snug mt-0.5">
                        Personalized AI architecture walkthrough
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action CTAs (Phone, Sign in, Book a demo - Pill Button) */}
          <div className="hidden items-center gap-3 xl:gap-4 lg:flex shrink-0 whitespace-nowrap">
            <a
              href="tel:+911140566600"
              className="hidden items-center gap-1.5 px-2 font-mono text-[13px] font-medium text-slate-600 hover:text-slate-900 xl:flex whitespace-nowrap shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>+91 11 4056 6600</span>
            </a>

            <Link
              href="/login"
              className="px-2.5 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-[#e8572a] px-5 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              Book a demo
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

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-6 py-5 lg:hidden space-y-3 shadow-lg">
            <a href="#playbooks" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Industry Playbooks</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Architecture & Webhooks</a>
            <a href="#dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Command Center</a>
            <a href="#case-studies" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Economics & Headcount</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Security & SLA</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Client Reviews</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">FAQ</a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link href="/login" className="w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-lg">Sign In</Link>
              <Link href="/register" className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#e8572a] rounded-full">Book a demo</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── RAVAN.AI SCROLL-DRIVEN HORIZONTAL PARALLAX SKYLINE (TAJ MAHAL) ── */}
      <ParallaxSkyline imageSrc="/images/hero-taj-skyline.jpg" />

      <main className="relative z-10">

        {/* ── SECTION 1: HERO (RAVAN.AI ARCHITECTURE) ────────────────── */}
        <section className="relative overflow-hidden bg-transparent pb-16 pt-12 md:pb-28 md:pt-16">
          
          {/* Subtle Grid Lines & Background Radial Accent */}
          <div className="pointer-events-none absolute inset-0 z-0" style={{
            backgroundImage: 'linear-gradient(to right, rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,24,40,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="pointer-events-none absolute inset-0 z-0" style={{
            background: 'radial-gradient(ellipse 50% 60% at 80% 30%, rgba(232,87,42,0.06), transparent 70%)'
          }} />

          <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 md:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:gap-14">
              
              {/* Left Column: Typography & Positioning */}
              <div className="flex flex-col items-start">
                
                {/* Eyebrow with Pulsing Live Ping Indicator */}
                <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span>GLOBAL DEPLOYMENTS — B2B AGENCIES & FIRMS</span>
                  <span className="h-px w-8 bg-slate-300 hidden sm:inline-block" />
                </span>

                {/* Main Heading with Hand-Drawn SVG Underline */}
                <h1 className="text-[clamp(1.85rem,1.4rem+1.8vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0c0e14]">
                  The enterprise AI{' '}
                  <span className="relative inline-block whitespace-nowrap text-[#0c0e14]">
                    revenue deployment
                    <svg viewBox="0 0 120 12" aria-hidden="true" className="absolute -bottom-2.5 left-0 h-[10px] w-full" preserveAspectRatio="none">
                      <path d="M3 7 C 28 3, 62 8.5, 117 4.5" stroke="#e8572a" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>{' '}
                  company.
                </h1>

                {/* Editorial Subhead */}
                <p className="mt-5 text-[clamp(1.05rem,0.98rem+0.3vw,1.25rem)] italic leading-[1.25] tracking-[-0.01em] text-slate-800">
                  Home of <span className="text-[#e8572a] font-semibold not-italic">Operator</span> — the world’s most relentless AI sales employee.
                </p>

                {/* Body Description */}
                <p className="mt-5 max-w-[560px] text-[14px] sm:text-[15px] leading-relaxed text-slate-600">
                  Instant response. 100% qualification. Sub-5s response. Around it we deploy your entire inbound sales workflow — webhooks, Gmail, WhatsApp, follow-ups, and calendar bookings — built, launched, and run for you. Trusted by 2,000+ businesses.
                </p>

                {/* Monospace Sub-note */}
                <p className="mt-3 font-mono text-[12px] font-medium tracking-[0.03em] text-slate-500">
                  The AI that never lets a high-budget lead slip away.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-wrap items-start gap-x-4 gap-y-4">
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8572a] px-6 py-3 text-[13.5px] font-semibold text-white shadow-lg shadow-[#e8572a]/25 transition-all hover:bg-[#d04920] hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <span>Deploy Operator Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <span className="text-[11.5px] text-slate-400 font-mono">1-click demo · instant pipeline access</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <a
                      href="#demo"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-[13.5px] font-semibold text-slate-800 transition-all hover:bg-slate-50 active:scale-[0.98] shadow-xs"
                    >
                      <Play className="w-4 h-4 text-[#e8572a] fill-[#e8572a]" />
                      <span>Test Live Simulator</span>
                    </a>
                    <span className="text-[11.5px] text-slate-400 font-mono">No credit card required</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Signature Interactive Agent Widget (Ravan.ai Orb Style) */}
              <div id="demo" className="relative flex flex-col items-center">
                <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl relative overflow-hidden">
                  
                  {/* Widget Topbar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                        OPERATOR · LIVE DEMO
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      5 free calls today
                    </span>
                  </div>

                  {/* Scenario Pill Selector */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                      Select Lead Scenario:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {SCENARIOS.map((sc, i) => (
                        <button
                          key={sc.id}
                          onClick={() => {
                            setSelectedScenario(i);
                            handleResetCall();
                          }}
                          className={cn(
                            'px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all text-center truncate border cursor-pointer',
                            selectedScenario === i
                              ? 'bg-[#0c0e14] text-white border-[#0c0e14] shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          )}
                        >
                          {sc.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glowing Orb Container (Ravan.ai Style) */}
                  <div className="relative my-3 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-[#0c0e14] to-[#161a24] text-white overflow-hidden shadow-inner">
                    
                    {/* Glowing Circular Orb Core */}
                    <div
                      onClick={callState === 'idle' ? handleStartCall : undefined}
                      className={cn(
                        'relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500',
                        callState === 'idle' ? 'cursor-pointer hover:scale-105' : ''
                      )}
                    >
                      {/* Radiating Amber/Orange Aura */}
                      <div className={cn(
                        'absolute inset-0 rounded-full bg-gradient-to-tr from-[#e8572a] via-[#f59e0b] to-[#ea580c] blur-xl transition-all duration-700',
                        callState === 'live' ? 'scale-125 opacity-90 animate-pulse' : 'scale-100 opacity-60'
                      )} />

                      {/* Agni Core Fire Image */}
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden flex items-center justify-center bg-black/60 shadow-[0_0_24px_rgba(232,87,42,0.7)] border border-orange-500/40">
                        <img
                          src="/images/ravan/agni-orb.png"
                          alt="Operator Live Agent Orb"
                          className={cn(
                            'w-full h-full object-cover transition-transform duration-700',
                            callState === 'live' ? 'scale-110 rotate-6' : 'scale-100'
                          )}
                        />
                      </div>

                      {/* Dynamic Frequency Audio Wave Ring around Orb */}
                      {callState === 'live' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-26 h-26 rounded-full border border-[#e8572a]/40 animate-ping" />
                        </div>
                      )}
                    </div>

                    {/* Interactive Status & Call Progress */}
                    <div className="mt-4 text-center w-full">
                      {callState === 'idle' && (
                        <>
                          <button
                            onClick={handleStartCall}
                            className="mt-1 w-full py-2.5 px-5 rounded-xl bg-[#e8572a] hover:bg-[#d04920] text-white text-xs font-bold font-mono tracking-wider transition-all shadow-lg shadow-[#e8572a]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                          >
                            <Phone className="w-3.5 h-3.5 fill-white" />
                            <span>Tap to Talk · Start Live Call</span>
                          </button>
                          <p className="text-[11px] text-slate-400 mt-2 font-mono">
                            Try Operator live · no signup required
                          </p>
                        </>
                      )}

                      {callState === 'connecting' && (
                        <div className="py-2 space-y-1 font-mono">
                          <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>CONNECTING TO OPERATOR...</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400">Allocating audio pipeline (sub-300ms)</p>
                        </div>
                      )}

                      {callState === 'live' && (
                        <div className="space-y-3 w-full">
                          {/* Live Timer & Waveform Display */}
                          <div className="flex items-center justify-between px-2 font-mono text-xs">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span>LIVE (00:{callSeconds < 10 ? `0${callSeconds}` : callSeconds})</span>
                            </div>
                            <span className="text-[10.5px] text-slate-400">142ms latency</span>
                          </div>

                          {/* Sound wave visualizer bars */}
                          <div className="flex items-center justify-center gap-1 h-8">
                            {waveHeights.map((h, i) => (
                              <span
                                key={i}
                                style={{ height: `${h}px` }}
                                className="w-1.5 rounded-full bg-[#e8572a] transition-all duration-300"
                              />
                            ))}
                          </div>

                          {/* Live In-Call Controls */}
                          <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                              onClick={() => setIsMuted(!isMuted)}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-[#e8572a]" />}
                              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                            </button>

                            <button
                              onClick={handleEndCall}
                              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-mono font-bold text-white flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                            >
                              <PhoneOff className="w-3.5 h-3.5" />
                              <span>End Call</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {callState === 'ended' && (
                        <div className="py-2 space-y-2 font-mono text-center">
                          <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>CALL CONCLUDED & MEETING BOOKED</span>
                          </p>
                          <button
                            onClick={handleResetCall}
                            className="text-[11px] text-[#e8572a] underline hover:text-[#d04920] font-semibold cursor-pointer"
                          >
                            Try another scenario &rarr;
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Live Conversation Transcript & Dossier Output */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{currentScenario.prospect}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase border',
                        callStep >= 3 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      )}>
                        {callStep >= 3 ? `Score: ${currentScenario.score}/100 🔥 HOT` : 'Awaiting Inbound'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 italic">
                      &ldquo;{currentScenario.inquiry}&rdquo;
                    </p>

                    {callStep >= 2 && (
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-[#0c0e14] bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-1 font-bold text-[#e8572a] mb-1">
                          <Bot className="w-3.5 h-3.5" /> Operator (Voice):
                        </div>
                        <p className="text-slate-700 leading-relaxed">{currentScenario.aiReply}</p>
                      </div>
                    )}

                    {callStep >= 4 && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10.5px]">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> {currentScenario.action}
                        </span>
                        <span className="font-mono text-slate-400">MEETING_BOOKED</span>
                      </div>
                    )}
                  </div>

                  {/* Live Controls Bottom Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span className="text-[11px] text-slate-500">Autonomous Sales Agent</span>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>LIVE OPERATOR RUNNING</span>
                    </div>
                  </div>

                </div>

                <a
                  href="tel:+911140566600"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-[12px] text-slate-600 shadow-sm border border-slate-200 hover:text-slate-900 transition-colors"
                >
                  <span>Prefer phone? Dial</span>
                  <span className="font-bold text-[#e8572a]">+91 11 4056 6600</span>
                </a>
              </div>

            </div>

            {/* ── METRIC TICKER BAR (RAVAN.AI STYLE) ───────────────────── */}
            <div className="mt-14 border-t border-slate-200 pt-6 md:mt-20">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono text-[12.5px] font-semibold tracking-[0.02em] text-slate-700">
                <span className="whitespace-nowrap">
                  <span className="text-[#e8572a] font-bold">100+</span> Channels & Webhooks
                </span>
                <span className="whitespace-nowrap">
                  <span className="text-[#e8572a] font-bold">&lt;5s</span> Instant First-Touch
                </span>
                <span className="whitespace-nowrap">
                  <span className="text-[#e8572a] font-bold">4-Step</span> Follow-up Sequences
                </span>
                <span className="whitespace-nowrap">
                  <span className="text-[#e8572a] font-bold">0</span> Lost Pipeline Leads
                </span>
                <span className="whitespace-nowrap">
                  from <span className="text-[#e8572a] font-bold">₹4,999/mo</span>
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 md:flex md:flex-wrap md:items-center md:justify-between text-[12px] font-mono text-slate-500 border-t border-slate-100">
                {['Inbound Webhooks', 'Autonomous Agent', 'Knowledge Bases', 'Human Handoff', 'Transcripts & Analytics', 'APIs & DLQ'].map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#e8572a]" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── SECTION 2: SOCIAL PROOF MARQUEE (RAVAN.AI CLIENT LOGOS) ──── */}
        <section className="border-y border-slate-200/60 bg-white/75 backdrop-blur-[2px] py-10" aria-label="Trusted Companies">
          <p className="mb-7 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Trusted by fast-growing digital agencies, B2B firms & high-ticket founders
          </p>
          <div className="relative mx-auto max-w-[1280px] overflow-hidden">
            <div className="flex w-max items-center gap-14 sm:gap-16 pr-14 animate-marquee">
              {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((client, idx) => (
                <div
                  key={idx}
                  className="flex h-10 shrink-0 items-center justify-center [filter:brightness(0)opacity(0.35)] transition-[filter,opacity] duration-300 hover:[filter:none] hover:opacity-100 cursor-pointer"
                  title={client.name}
                >
                  <img
                    src={client.src}
                    alt={client.name}
                    className="h-5 sm:h-6 w-auto max-w-[90px] object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        


        {/* ── SECTION 4.1: PLATFORM BUILDING BLOCKS (● PLATFORM) ── */}
        <section id="platform" className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label (Ravan.ai Continuous Rail) */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  PLATFORM
                </span>
              </div>

              {/* Section Header */}
              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" aria-hidden="true" />
                  PLATFORM
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  One platform for AI voice operations.
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  Operator gives high-growth teams the building blocks to qualify inbound leads, connect company knowledge, trigger instant voice calls, and lock discovery meetings automatically.
                </p>
              </div>

              {/* 4 Numbered Rows (01, 02, 03, 04) */}
              <div className="divide-y divide-slate-200/80 border-y border-slate-200/80">
                {[
                  {
                    num: '01',
                    title: 'Build agents',
                    desc: 'Configure qualification prompts, vernacular voices, accents, and custom objection-handling playbooks.',
                    href: '#demo'
                  },
                  {
                    num: '02',
                    title: 'Connect knowledge',
                    desc: 'Attach company FAQs, service decks, pricing tiers, and qualifying criteria for deterministic answers.',
                    href: '#how-it-works'
                  },
                  {
                    num: '03',
                    title: 'Add tools',
                    desc: 'Autonomous Google Calendar booking, instant WhatsApp confirmations, and seamless warm human handoff.',
                    href: '#how-it-works'
                  },
                  {
                    num: '04',
                    title: 'Launch inbound',
                    desc: 'Connect your website forms, Meta Ads, and WhatsApp to call and qualify every lead in <5 seconds.',
                    href: '#demo'
                  },
                  {
                    num: '05',
                    title: 'Track outcomes',
                    desc: 'Review mathematical intent scores (0–100), full bilingual call transcripts, audio recordings, and sentiment.',
                    href: '#how-it-works'
                  },
                  {
                    num: '06',
                    title: 'Sync data',
                    desc: 'Send structured lead qualification records into HubSpot, Salesforce, Zoho, Google Sheets, and Slack.',
                    href: '#how-it-works'
                  },
                ].map((row, idx) => (
                  <a
                    key={idx}
                    href={row.href}
                    className="group flex flex-col md:flex-row md:items-center justify-between py-6 px-3 -mx-3 rounded-xl hover:bg-slate-50/80 transition-all gap-4 text-left"
                  >
                    <div className="flex items-start md:items-center gap-6 md:gap-10">
                      <span className="font-mono text-xl sm:text-2xl font-bold text-slate-400 group-hover:text-[#e8572a] transition-colors w-10">
                        {row.num}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg w-48 shrink-0 group-hover:text-[#e8572a] transition-colors">
                        {row.title}
                      </h3>
                    </div>

                    <p className="text-slate-600 text-sm flex-1 md:px-6 leading-relaxed">
                      {row.desc}
                    </p>

                    <span className="text-slate-300 group-hover:text-[#e8572a] text-xl font-light transition-colors self-end md:self-center">
                      &rarr;
                    </span>
                  </a>
                ))}
              </div>

            </div>
          </div>
        </section>

        

        {/* ── SECTION 4.3: WORKFLOWS & USE CASES (● WORKFLOWS) ── */}
        <section id="use-cases" className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label (Ravan.ai Continuous Rail) */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  WORKFLOWS
                </span>
              </div>

              {/* Section Header */}
              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" aria-hidden="true" />
                  USE CASES
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Built for the workflows your teams already run by phone.
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  Deploy specialized AI agents for high-volume customer conversations across sales, support, collections, scheduling, feedback, recruitment, and commerce.
                </p>
              </div>

              {/* Rows matching Screenshot 4 */}
              <div className="divide-y divide-slate-200/80 border-y border-slate-200/80">
                {[
                  {
                    title: 'Sales & lead qualification',
                    badge: null,
                    desc: 'Call new leads in minutes, qualify intent, handle objections, and route hot prospects to your closers.',
                    tags: 'Speed-to-lead · CRM sync · Human handoff'
                  },
                  {
                    title: 'Customer support',
                    badge: null,
                    desc: 'Resolve common questions from your knowledge base and escalate complex calls with full context.',
                    tags: 'Inbound routing · Knowledge base · Escalation'
                  },
                  {
                    title: 'Collections & EMI',
                    badge: 'MOST DEPLOYED',
                    desc: 'Controlled reminder workflows with RBI-aligned call windows, retries, payment links, and settlement negotiations.',
                    tags: 'Call windows · Dispositions · Audit trail'
                  },
                  {
                    title: 'Scheduling & reminders',
                    badge: null,
                    desc: 'Automated appointment confirmations, reschedules, and timely follow-ups with real-time calendar synchronization.',
                    tags: 'Calendar sync · Rescheduling · No-show reduction'
                  },
                  {
                    title: 'Recruitment & screening',
                    badge: null,
                    desc: 'Pre-screen job applicants at scale with structured question flows, qualification scoring, and ATS synchronization.',
                    tags: 'Candidate screening · Shortlisting · ATS sync'
                  },
                  {
                    title: 'Feedback & quality',
                    badge: null,
                    desc: 'Post-call sentiment analysis, CSAT scores, customer feedback collection, and automated quality assurance.',
                    tags: 'Sentiment analysis · Dispositions · Real-time alerts'
                  },
                  {
                    title: 'High-Ticket Inbound & Drop-off Recovery',
                    badge: 'HIGH ROI',
                    desc: 'Immediate sub-5-second callback for form abandons, late-night ad clicks, and unanswered inbound inquiries.',
                    tags: 'Instant callback · 0–100 Scoring · Calendar booking'
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col lg:flex-row lg:items-center justify-between py-6 px-3 -mx-3 rounded-xl hover:bg-white/60 transition-all gap-4"
                  >
                    <div className="flex items-center gap-3 w-72 shrink-0">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-[#e8572a] transition-colors">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className="font-mono text-[9.5px] font-bold px-2 py-0.5 rounded bg-orange-100 text-[#e8572a] border border-orange-200">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 text-sm flex-1 lg:px-6 leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="flex items-center gap-2 font-mono text-xs text-slate-500 shrink-0 self-start lg:self-center">
                      <span>{item.tags}</span>
                      <span className="text-slate-400 group-hover:text-[#e8572a] transition-colors font-sans text-sm">&rarr;</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 4.5: OPERATORS + DEVELOPERS (RAVAN.AI EXACT LAYOUT) ── */}
        <section id="dashboard" className="border-b border-slate-200/60 bg-white/80 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  OPERATORS + DEVELOPERS
                </span>
              </div>

              {/* Section Header */}
              <div className="max-w-3xl mb-12 space-y-3">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" aria-hidden="true" />
                  OPERATORS + DEVELOPERS
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] leading-[1.18]">
                  A dashboard for your ops team.<br className="hidden sm:inline" /> APIs for your engineers.
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-2xl">
                  Business teams run agents, campaigns, and reviews from the workspace. Technical teams automate everything with REST APIs and after-call webhooks. Both see the same truth.
                </p>
              </div>

              {/* Two Column Grid: Left Dashboard, Right API Terminal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Left Col: Ops Dashboard */}
                <div className="flex flex-col">
                  {/* macOS Browser Mockup */}
                  <div className="rounded-2xl border border-slate-800 bg-[#0c0e14] shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#0c0e14]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 select-none">app.operator.ai/dashboard</span>
                      <div className="w-8" />
                    </div>
                    <div className="p-0 bg-white">
                      <img
                        src="/images/dashboard-exact-hd.png"
                        alt="Operator Dashboard — Campaigns, transcripts, sentiment, and spend in one workspace"
                        className="w-full max-h-[310px] object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Footnote under Left Card */}
                  <div className="mt-4 space-y-1">
                    <p className="text-[13.5px] text-slate-700 font-medium">
                      Campaigns, transcripts, sentiment, and spend in one workspace.
                    </p>
                    <a
                      href="#demo"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e8572a] hover:underline font-mono uppercase tracking-wider"
                    >
                      Platform tour &rarr;
                    </a>
                  </div>
                </div>

                {/* Right Col: Engineers Code Terminal */}
                <div className="flex flex-col">
                  {/* Terminal Card */}
                  <div className="rounded-2xl border border-slate-800 bg-[#0c0e14] shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#0c0e14]">
                      <span className="font-mono text-xs font-semibold text-slate-200">Create a call</span>
                      <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">cURL</span>
                    </div>

                    <div className="p-4 font-mono text-[10.5px] sm:text-[11px] leading-[1.65] text-slate-300 overflow-x-auto max-h-[310px] overflow-y-auto selection:bg-[#e8572a] selection:text-white">
                      <div className="text-slate-500"># Place an outbound AI call</div>
                      <div>
                        <span className="text-cyan-400 font-bold">curl</span> -X POST https://api.operator.ai/v1/calling/create-call \
                      </div>
                      <div className="pl-4 text-slate-400">
                        -H <span className="text-amber-300">"X-Api-Key: $OPERATOR_API_KEY"</span> \
                      </div>
                      <div className="pl-4 text-slate-400">
                        -d '{'{'}
                      </div>
                      <div className="pl-8">
                        <span className="text-amber-300">"type"</span>: <span className="text-emerald-400">"outbound_call"</span>,
                      </div>
                      <div className="pl-8">
                        <span className="text-amber-300">"agent_id"</span>: <span className="text-emerald-400">"&lt;your-agent-id&gt;"</span>,
                      </div>
                      <div className="pl-8">
                        <span className="text-amber-300">"from_phone_number"</span>: <span className="text-emerald-400">"+911140566600"</span>,
                      </div>
                      <div className="pl-8">
                        <span className="text-amber-300">"to_phone_number"</span>: <span className="text-emerald-400">"+919800000000"</span>
                      </div>
                      <div className="pl-4 text-slate-400">{'}'}'</div>

                      <div className="mt-5 text-slate-500"># When the call ends, your webhook gets call.completed:</div>
                      <div className="text-slate-400">{'{'}</div>
                      <div className="pl-4">
                        <span className="text-amber-300">"summary"</span>: <span className="text-emerald-400">"..."</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-amber-300">"recording_url"</span>: <span className="text-emerald-400">"..."</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-amber-300">"post_call_analysis"</span>: {'{'}
                      </div>
                      <div className="pl-8">
                        <span className="text-amber-300">"sentiment"</span>: <span className="text-emerald-400">"positive"</span>,
                      </div>
                      <div className="pl-8">
                        <span className="text-amber-300">"disposition"</span>: <span className="text-emerald-400">"..."</span>,
                      </div>
                      <div className="pl-8">
                        <span className="text-amber-300">"goals_met"</span>: <span className="text-cyan-400">true</span>
                      </div>
                      <div className="pl-4">{'}'},</div>
                      <div className="pl-4">
                        <span className="text-amber-300">"transcripts"</span>: [...]
                      </div>
                      <div className="text-slate-400">{'}'}</div>
                    </div>
                  </div>

                  {/* Footnote under Right Card */}
                  <div className="mt-4 space-y-1">
                    <p className="text-[13.5px] text-slate-700 font-medium">
                      Start calls, manage agents, receive structured outcomes.
                    </p>
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e8572a] hover:underline font-mono uppercase tracking-wider"
                    >
                      View API docs &rarr;
                    </a>
                  </div>
                </div>

              </div>

              {/* Supported Integrations Footer */}
              <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-700">Supported integrations:</span>
                  <span>GoHighLevel &bull; Cal.com &bull; HubSpot &bull; Salesforce &bull; REST APIs &amp; webhooks for everything else</span>
                </div>
                <a
                  href="#how-it-works"
                  className="text-[#e8572a] hover:underline font-bold uppercase tracking-wider whitespace-nowrap"
                >
                  see integrations &rarr;
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 5: 7-STEP WORKFLOW CAROUSEL (● ARCHITECTURE) ────── */}
        <section id="how-it-works" className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label (Ravan.ai Continuous Rail) */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  ARCHITECTURE
                </span>
              </div>

              <div className="max-w-3xl mb-14 space-y-3">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" aria-hidden="true" />
                  DETERMINISTIC INBOUND ARCHITECTURE
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] leading-[1.15]">
                  From First Inbound Click to Confirmed Google Meet. <span className="text-[#e8572a]">In &lt;5 Seconds.</span>
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  Zero manual SDR follow-up. Zero lead drop-offs after 6 PM. Operator ingests your forms, ads &amp; WhatsApp, extracts budget, scores intent 0–100, and locks discovery calls directly into your calendar — 24/7/365.
                </p>
              </div>

              <InboundArchitecturePipeline />
            </div>
          </div>
        </section>

        {/* ── SECTION 5.2: INTERACTIVE PIPELINE & REVENUE RECOVERY CALCULATOR (● ECONOMICS) ── */}
        <section id="roi" className="border-b border-slate-200/60 bg-[#f7f8fb]/85 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label (Ravan.ai Continuous Rail) */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  ECONOMICS
                </span>
              </div>

              <div className="max-w-2xl mb-8 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Interactive Pipeline Recovery Model</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight text-[#0c0e14] leading-snug">
                  See Exactly How Much Revenue Operator Recovers For Your Agency.
                </h2>
                <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed">
                  Indian agencies and B2B firms lose 35–45% of high-ticket inquiries arriving after 6 PM and on weekends. Move the sliders to calculate your recovered pipeline.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch max-w-5xl">
                
                {/* Left Column: Compact Sliders */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between">
                  
                  {/* Slider 1: Monthly Inbounds */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>Monthly Inbound Leads</span>
                      <span className="font-mono text-xs text-[#e8572a] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 font-bold">
                        {monthlyLeads} leads/mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="500"
                      step="10"
                      value={monthlyLeads}
                      onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                      className="w-full accent-[#e8572a] cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>30 (Boutique)</span>
                      <span>250 (Mid-Market)</span>
                      <span>500+ (High Growth)</span>
                    </div>
                  </div>

                  {/* Slider 2: Average Deal / Retainer Size */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>Average Client Retainer / Deal Size</span>
                      <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                        ₹{dealValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30000"
                      max="1000000"
                      step="20000"
                      value={dealValue}
                      onChange={(e) => setDealValue(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>₹30K (Setup)</span>
                      <span>₹1.5 Lakh (Retainer)</span>
                      <span>₹10 Lakh+ (Enterprise)</span>
                    </div>
                  </div>

                  {/* Slider 3: After-Hours Inbound Share */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>Inbound Share Arriving After 6 PM &amp; Weekends</span>
                      <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 font-bold">
                        {afterHoursPct}% of leads
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      step="2"
                      value={afterHoursPct}
                      onChange={(e) => setAfterHoursPct(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>20% (Low)</span>
                      <span>38% (Industry Avg)</span>
                      <span>60% (High Off-Hours)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3 h-3 text-[#e8572a]" />
                    <span>Calculated using verified benchmarks from Indian B2B runs.</span>
                  </div>

                </div>

                {/* Right Column: Compact Output Card */}
                <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-[#0c0e14] text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="pointer-events-none absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#e8572a]/15 blur-2xl" />
                  
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Projected Pipeline Lift</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold font-mono border border-emerald-500/30">
                        +{estimatedMeetings} Meetings / Mo
                      </span>
                    </div>

                    {/* Compact Highlight Number */}
                    <div className="pt-4 pb-1">
                      <span className="text-[11px] font-mono text-slate-400 block mb-0.5">Estimated Annual Revenue Unlocked:</span>
                      <div className="text-2xl sm:text-3xl md:text-[32px] font-bold text-white tracking-tight flex items-baseline gap-1.5">
                        <span className="text-[#e8572a]">₹{(estimatedPipeline * 12).toLocaleString('en-IN')}</span>
                        <span className="text-xs font-normal text-slate-400 font-mono">/ year</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-400 block">Monthly Pipeline Added</span>
                      <p className="text-sm font-bold text-white font-mono">₹{estimatedPipeline.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-400 block">Night Leads Rescued</span>
                      <p className="text-sm font-bold text-amber-400 font-mono">~{Math.round(monthlyLeads * (afterHoursPct / 100))} leads/mo</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-400 block">Human SDR Saved</span>
                      <p className="text-sm font-bold text-emerald-400 font-mono">₹13,20,000 / yr</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-400 block">ROI Multiplier</span>
                      <p className="text-sm font-bold text-[#e8572a] font-mono">
                        {Math.max(12, Math.round((estimatedPipeline * 12) / 299988))}x Return
                      </p>
                    </div>
                  </div>

                  {/* Compact CTA Button */}
                  <div className="pt-1">
                    <Link
                      href="/register"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#e8572a] hover:bg-[#d04920] text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#e8572a]/25 transition-all hover:-translate-y-0.5 active:scale-98"
                    >
                      <span>Deploy Operator &amp; Claim This Pipeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>

        

        

        {/* ── SECTION 7: SDR HEADCOUNT VS OPERATOR COST MATRIX (● SAVINGS) ── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label (Ravan.ai Continuous Rail) */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  SAVINGS
                </span>
              </div>

              <div className="max-w-3xl mb-14 space-y-3">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" aria-hidden="true" />
                  HEADCOUNT ECONOMICS
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0c0e14]">
                  The Mathematics of Autonomous SDR Replacement.
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Why modern high-ticket agencies replace bloated manual SDR teams with an autonomous AI Revenue Operator.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider font-mono">
                  <div className="md:col-span-3 p-4 text-slate-600">Metric / Dimension</div>
                  <div className="md:col-span-3 p-4 text-slate-600 border-t md:border-t-0 md:border-l border-slate-200">2 Full-Time SDRs</div>
                  <div className="md:col-span-3 p-4 text-slate-600 border-t md:border-t-0 md:border-l border-slate-200">Traditional Chatbot</div>
                  <div className="md:col-span-3 p-4 text-[#e8572a] border-t md:border-t-0 md:border-l border-slate-200 bg-orange-50/50">AI Revenue Operator</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {SDR_COMPARISON_DATA.map((row, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-12 text-xs">
                      <div className="md:col-span-3 p-4 font-bold text-slate-900 bg-slate-50/40 flex flex-col justify-center">
                        <span>{row.metric}</span>
                        <span className="text-[10.5px] font-mono text-emerald-600 font-normal mt-0.5">{row.highlight}</span>
                      </div>
                      <div className="md:col-span-3 p-4 text-slate-600 border-t md:border-t-0 md:border-l border-slate-100 flex items-center">
                        <span>{row.sdr}</span>
                      </div>
                      <div className="md:col-span-3 p-4 text-slate-500 border-t md:border-t-0 md:border-l border-slate-100 flex items-center">
                        <span>{row.chatbot}</span>
                      </div>
                      <div className="md:col-span-3 p-4 text-slate-900 font-bold border-t md:border-t-0 md:border-l border-slate-100 bg-orange-50/20 flex items-center">
                        <span className="flex items-center gap-1.5 text-slate-900">
                          <Check className="w-4 h-4 text-[#e8572a] shrink-0" />
                          <span>{row.operator}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Net Savings Summary Banner */}
              <div className="mt-8 p-6 rounded-2xl bg-[#0c0e14] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[#e8572a] font-mono text-xs font-bold uppercase tracking-wider">Net Annual Financial Advantage</span>
                  <h4 className="text-xl sm:text-2xl font-bold tracking-tight">Save ₹13,20,000+ every year while booking 3.4x more meetings.</h4>
                  <p className="text-slate-400 text-xs font-mono">Zero hiring latency &bull; Zero training time &bull; Instant multi-channel deployment</p>
                </div>
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl bg-[#e8572a] hover:bg-[#d04920] text-white font-mono text-xs font-bold uppercase tracking-wider shrink-0 transition-all shadow-md shadow-[#e8572a]/30 active:scale-98"
                >
                  Deploy Operator Free &rarr;
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 8: PRICING (● PRICING) ───────────────────────────── */}
        <section id="pricing" className="border-b border-slate-200/60 bg-[#f7f8fb]/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label (Ravan.ai Continuous Rail) */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  PRICING
                </span>
              </div>

              <div className="max-w-3xl mb-14 space-y-3">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" aria-hidden="true" />
                  TRANSPARENT PRICING
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0c0e14]">
                  Deploy Your AI Sales Employee Today.
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Full autonomy at a fraction of the cost of hiring and training manual SDRs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRICING_PLANS.map((plan, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-7 rounded-3xl border flex flex-col justify-between space-y-6 transition-all',
                      plan.popular
                        ? 'bg-white border-[#e8572a] shadow-xl relative ring-2 ring-[#e8572a]/20'
                        : 'bg-white border-slate-200 shadow-xs'
                    )}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3.5 py-0.5 rounded-full bg-[#e8572a] text-white uppercase tracking-wider font-mono shadow-sm">
                        Most Popular 🔥
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#0c0e14]">{plan.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#0c0e14] tracking-tight">{plan.price}</span>
                        <span className="text-xs text-slate-500 font-mono">{plan.period}</span>
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                        {plan.features.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#e8572a] shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className={cn(
                        'w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all block font-mono',
                        plan.popular
                          ? 'bg-[#e8572a] hover:bg-[#d04920] text-white shadow-md shadow-[#e8572a]/25'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      )}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 8.2: ENTERPRISE SLA, SECURITY & COMPLIANCE (● TRUST) ── */}
        <section id="security" className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label (Ravan.ai Continuous Rail) */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  TRUST
                </span>
              </div>

              <div className="max-w-3xl mb-14 space-y-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#e8572a]">
                  — ENTERPRISE SECURITY &amp; SLA
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0c0e14]">
                  Engineered for Zero Data Loss &amp; Bank-Grade Security.
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Every inbound prospect interaction is backed by resilient infrastructure, strict data isolation, and low-latency delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SECURITY_METRICS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#e8572a]">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200">
                            {item.badge}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#0c0e14]">{item.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Active SLA Standard</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 9: FAQ ACCORDION (● FAQ) ────────────────────────── */}
        <section id="faq" className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60 py-16 md:py-24">
              
              {/* Pin Node & Label (Ravan.ai Continuous Rail) */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  FAQ
                </span>
              </div>

              {/* 2-Column High-End Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
                
                {/* Left Column: Sticky Section Header & Support Box */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                      <span className="h-px w-5 bg-[#e8572a]" aria-hidden="true" />
                      FREQUENTLY ASKED QUESTIONS
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] leading-[1.18]">
                      Everything you need to know.
                    </h2>
                    <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                      Clear, honest answers on autonomous qualification, 18ms webhook latency, CRM sync, and DND compliance.
                    </p>
                  </div>

                  {/* Direct Solutions Architecture Support Box */}
                  <div className="p-5 rounded-2xl bg-[#0c0e14] text-white border border-slate-800 shadow-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Solutions Architects Online
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Have a custom CRM, custom telephony trunk, or private on-premise security requirement?
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

                {/* Right Column: Sleek Stripe/Linear Style Border-Bottom Accordion */}
                <div className="lg:col-span-7 divide-y divide-slate-200/80 border-t border-b border-slate-200/80">
                  {FAQS.map((faq, i) => {
                    const isOpen = activeFaq === i;
                    return (
                      <div
                        key={i}
                        className="py-4 sm:py-5 transition-colors group"
                      >
                        <button
                          onClick={() => setActiveFaq(isOpen ? null : i)}
                          className="w-full text-left flex items-start justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3.5">
                            <span className="font-mono text-xs font-bold text-slate-400 pt-0.5 select-none shrink-0 group-hover:text-[#e8572a] transition-colors">
                              0{i + 1}
                            </span>
                            <span className={cn(
                              "text-[14.5px] sm:text-[15.5px] font-semibold transition-colors leading-snug",
                              isOpen ? "text-[#e8572a]" : "text-slate-900 group-hover:text-slate-700"
                            )}>
                              {faq.q}
                            </span>
                          </div>

                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5",
                            isOpen 
                              ? "bg-[#e8572a] border-[#e8572a] text-white rotate-90" 
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

        {/* ── SECTION 10: FINAL HIGH-IMPACT CALL TO ACTION ───────────── */}
        <section className="bg-white/80 py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative flex flex-col items-center overflow-hidden rounded-[28px] bg-[#0c0e14] px-6 py-16 text-center md:px-16 md:py-20 shadow-2xl">
              {/* Top Accent Radial Glow */}
              <div className="pointer-events-none absolute inset-0" style={{
                background: 'radial-gradient(ellipse 65% 55% at 50% 20%, rgba(232,87,42,0.22), transparent 75%)'
              }} aria-hidden="true" />

              <div className="relative z-10 flex w-full flex-col items-center">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" aria-hidden="true" />
                  Ready to automate inbound revenue?
                </span>
                
                <h2 className="mt-4 max-w-[720px] text-[22px] sm:text-[28px] md:text-[32px] font-bold leading-[1.15] tracking-[-0.025em] text-white">
                  Your Inbound Leads Are Already Waiting.
                </h2>
                
                <p className="mt-4 max-w-[600px] text-[13.5px] sm:text-[14.5px] leading-relaxed text-slate-300">
                  Deploy your 24/7 AI Sales Employee today. Instantly qualify inbound inquiries in &lt;5 seconds, score buyer intent 0–100, and commit Google Meet discovery calls directly onto your calendar.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8572a] px-7 py-3.5 text-[14px] font-bold uppercase tracking-wider font-mono text-white transition-all hover:bg-[#d04920] shadow-lg shadow-[#e8572a]/30 active:scale-[0.98]"
                  >
                    Deploy Operator Free &rarr;
                  </Link>
                  <a
                    href="tel:+911140566600"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-[14px] font-semibold font-mono text-white transition-all hover:bg-white/15"
                  >
                    Talk to Sales (+91 11 4056 6600)
                  </a>
                </div>

                <div className="mt-8 flex flex-col items-center gap-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">or experience a live qualifying call right now</span>
                  <span className="text-[12.5px] text-slate-400 font-mono">Available 24/7/365 · Hindi, Hinglish, Indian English</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="relative z-30 bg-white border-t border-slate-200 text-[#0c0e14]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-12">
          
          {/* Main 6 Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-6 xl:gap-8">
            
            {/* Col 1: Brand & Socials */}
            <div className="space-y-4 sm:col-span-2 md:col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2">
                <img
                  src="/images/op-logo-arc.png"
                  alt="Operator"
                  className="h-5 w-5 object-contain shrink-0"
                />
                <span className="text-[17px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
                  operator<span className="text-[#e8572a]">.</span>
                </span>
              </div>
              
              <p className="text-[13px] text-slate-600 leading-relaxed max-w-[260px]">
                Voice AI agents for enterprise customer calls. Built for Indian conversations — 30+ languages, Hinglish native.
              </p>
              
              <div className="pt-1 space-y-2 text-[13px] font-semibold text-slate-700">
                <div className="flex items-center gap-4">
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#e8572a] transition-colors">LinkedIn</a>
                  <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-[#e8572a] transition-colors">X</a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#e8572a] transition-colors">Instagram</a>
                </div>
                <div>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#e8572a] transition-colors">Facebook</a>
                </div>
              </div>
            </div>

            {/* Col 2: PRODUCT */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                PRODUCT
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Enterprise Deployment', href: '#pricing' },
                  { label: 'Platform overview', href: '#how-it-works' },
                  { label: 'Agent Builder', href: '#demo' },
                  { label: 'Knowledge Base', href: '#how-it-works' },
                  { label: 'Inbound Calls', href: '#demo' },
                  { label: 'Outbound Campaigns', href: '#playbooks' },
                  { label: 'Call Analytics', href: '#scrubber' },
                  { label: 'APIs & Webhooks', href: '#how-it-works' },
                  { label: 'Languages & Voices', href: '#scrubber' },
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

            {/* Col 3: USE CASES */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                USE CASES
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Autonomous Revenue Operator', href: '#how-it-works' },
                  { label: 'Sales & Lead Qualification', href: '#demo' },
                  { label: '0–100 Mathematical Scoring', href: '#demo' },
                  { label: 'Google Meet Instant Booking', href: '#demo' },
                  { label: 'Multi-Touch WhatsApp Sequences', href: '#playbooks' },
                  { label: 'After-Hours Pipeline Capture', href: '#how-it-works' },
                  { label: 'High-Ticket Budget Discovery', href: '#demo' },
                  { label: 'Instant Human Rep Escalation', href: '#how-it-works' },
                  { label: 'Feedback & CSAT Quality', href: '#scrubber' },
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

            {/* Col 4: INDUSTRIES */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                INDUSTRIES
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'BFSI & NBFC', href: '#playbooks' },
                  { label: 'Digital Marketing Agencies', href: '#playbooks' },
                  { label: 'Luxury Real Estate & Builders', href: '#playbooks' },
                  { label: 'High-Ticket Consulting & SaaS', href: '#playbooks' },
                  { label: 'Healthcare & Specialized Clinics', href: '#playbooks' },
                  { label: 'EdTech & Executive Coaching', href: '#playbooks' },
                  { label: 'High-AOV Luxury D2C', href: '#playbooks' },
                  { label: 'Commercial Solar & Energy', href: '#playbooks' },
                  { label: 'Automotive & Dealerships', href: '#playbooks' },
                  { label: 'Hospitality & Travel', href: '#playbooks' },
                  { label: 'Contact Centres & BPO', href: '#playbooks' },
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

            {/* Col 5: RESOURCES */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                RESOURCES
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Documentation', href: '#faq' },
                  { label: 'Case Studies', href: '#case-studies' },
                  { label: 'Integrations', href: '#how-it-works' },
                  { label: 'ROI Calculator', href: '#pricing' },
                  { label: 'The Film & Insights', href: '#film' },
                  { label: 'FAQ', href: '#faq' },
                  { label: 'Trust Center', href: '#security' },
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

            {/* Col 6: COMPANY */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                COMPANY
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'About', href: '#hero' },
                  { label: 'Press & Media', href: '#case-studies' },
                  { label: 'Careers', href: 'mailto:careers@operator.ai' },
                  { label: 'Contact Sales', href: 'tel:+911140566600' },
                  { label: 'Sign in', href: '/login' },
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

          </div>

          {/* Compliance & Trust Bar */}
          <div className="border-t border-slate-200 mt-14 pt-6 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <p className="text-[11px] sm:text-[11.5px] font-mono text-slate-600 tracking-wide leading-relaxed">
                DND / NCPR scrubbing &middot; Consent logging &middot; Calling-window enforcement &middot; Call recordings &amp; audit trails &middot; DPDP-era consent design &middot; SOC 2 ready &middot; GDPR ready &middot; HIPAA ready
              </p>
              <a 
                href="#security" 
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#e8572a] hover:underline whitespace-nowrap self-start lg:self-auto"
              >
                Visit the Trust Center &rarr;
              </a>
            </div>
          </div>

          {/* Copyright & Legal Links Bar */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-[12px] text-slate-600">
              <div className="font-mono text-[11.5px] text-slate-600 leading-relaxed">
                &copy; 2026 AI Revenue Technologies Pvt. Ltd. &middot; New Delhi, India &middot; <a href="mailto:engineering@operator.ai" className="hover:text-slate-900 transition-colors font-semibold">engineering@operator.ai</a>
              </div>
              
              <div className="flex flex-col items-start lg:items-end gap-1.5 text-[12px] text-slate-600">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Privacy Policy</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Data Processing Addendum</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Subprocessors</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Incident Response</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Terms of Service</a>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Refund Policy</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Trust Center</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* ── FLOATING MAYA LIVE DEMO WIDGET (RAVAN.AI STYLE) ───────────── */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end select-none">
        
        {/* Expanded Quick Action Card */}
        {quickWidgetOpen && (
          <div className="mb-3 w-[310px] rounded-3xl bg-[#0c0e14] text-white p-5 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#e8572a] to-amber-500 flex items-center justify-center text-xl shadow-md">
                    👩
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0c0e14]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Maya</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-[#e8572a] border border-orange-500/30">AI Rep</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">Online · Sub-5s response</p>
                </div>
              </div>

              <button
                onClick={() => setQuickWidgetOpen(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Namaste! I&apos;m Operator&apos;s AI Sales Employee. Test my qualification &amp; meeting booking live:
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <button
                onClick={() => {
                  setQuickWidgetOpen(false);
                  handleStartCall();
                  const el = document.getElementById('demo');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#e8572a] hover:bg-[#d04920] text-white font-bold flex items-center justify-between transition-colors shadow-md shadow-[#e8572a]/20 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 fill-white" />
                  <span>Start Live Voice Call</span>
                </span>
                <span className="text-[10px] opacity-80">Free</span>
              </button>

              <a
                href="https://wa.me/911140566600?text=Hi%20Operator!%20I%20would%20like%20to%20see%20a%20live%20demo%20of%20the%20AI%20sales%20employee."
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Inbound Demo</span>
                </span>
                <span className="text-[10px] opacity-80">&rarr;</span>
              </a>

              <a
                href="tel:+911140566600"
                className="w-full py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium flex items-center justify-between transition-colors text-[11px]"
              >
                <span>Direct Hotline: +91 11 4056 6600</span>
                <span>Delhi HQ</span>
              </a>
            </div>
          </div>
        )}

        {/* Floating Bubble Pill Trigger */}
        <button
          onClick={() => setQuickWidgetOpen(!quickWidgetOpen)}
          className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-[#0c0e14] hover:bg-[#1a1f2c] text-white border-2 border-slate-800 shadow-2xl shadow-black/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e8572a] to-amber-500 flex items-center justify-center text-lg shadow-inner">
              👩
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0c0e14] animate-ping" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0c0e14]" />
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs font-bold tracking-tight">Maya</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8572a] font-bold text-white shadow-xs">
              Talk to AI
            </span>
          </div>
        </button>

      </div>

    </div>
  );
}
