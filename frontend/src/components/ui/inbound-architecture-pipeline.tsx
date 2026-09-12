"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Webhook,
  PhoneCall,
  Sparkles,
  CalendarCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  MessageSquare,
  Check,
  Flame,
  Volume2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineStep {
  id: number;
  time: string;
  tag: string;
  title: string;
  desc: string;
  metric: string;
  metricLabel: string;
  icon: React.ElementType;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    time: "00:00.2s",
    tag: "INGESTION",
    title: "Instant Inbound Ingestion",
    desc: "Webhook payload captured from WhatsApp, Meta Ads, or website form. Sanitized & deduplicated.",
    metric: "18ms",
    metricLabel: "Webhook Execution",
    icon: Webhook,
  },
  {
    id: 2,
    time: "00:01.8s",
    tag: "VOICE AI CALL",
    title: "Vernacular Voice AI Call",
    desc: "Sub-300ms speech-to-speech agent initiates phone call in customer's preferred Indian language.",
    metric: "<300ms",
    metricLabel: "Response Latency",
    icon: PhoneCall,
  },
  {
    id: 3,
    time: "00:03.2s",
    tag: "QUALIFICATION",
    title: "Mathematical Intent Scoring",
    desc: "Extracts budget, timeline & requirements to compute 0–100 buying intent scorecard.",
    metric: "96 / 100",
    metricLabel: "Intent Score",
    icon: Sparkles,
  },
  {
    id: 4,
    time: "00:04.9s",
    tag: "CALENDAR & CRM",
    title: "Calendar Lock & CRM Sync",
    desc: "High-intent prospect locked into closer's Google Calendar with WhatsApp confirmation & CRM sync.",
    metric: "100%",
    metricLabel: "Sync Complete",
    icon: CalendarCheck,
  },
];

export function InboundArchitecturePipeline() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(25);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSimulating) return;

    timerRef.current = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 4) {
          setIsSimulating(false);
          return 4;
        }
        return prev + 1;
      });
    }, 2200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating]);

  useEffect(() => {
    setSimulationProgress((activeStep / 4) * 100);
  }, [activeStep]);

  const handleStartSimulation = () => {
    setActiveStep(1);
    setIsSimulating(true);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setActiveStep(1);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#e8572a]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                End-to-End Pipeline
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                4.87s TOTAL LATENCY
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Interactive timeline of what happens from visitor click to confirmed Google Meet.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isSimulating ? handleResetSimulation : handleStartSimulation}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98",
              isSimulating
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-[#e8572a] text-white hover:bg-[#d04920] shadow-orange-500/20"
            )}
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run 5s Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Pipeline Stage Tabs (Clickable Stepper) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isPassed = activeStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                setIsSimulating(false);
                setActiveStep(step.id);
              }}
              className={cn(
                "group text-left p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4",
                isActive
                  ? "bg-white border-[#e8572a] shadow-lg ring-2 ring-[#e8572a]/20 -translate-y-0.5"
                  : isPassed
                  ? "bg-slate-50/80 border-slate-200 hover:bg-white"
                  : "bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
              )}
            >
              {/* Header: Number & Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors",
                      isActive
                        ? "bg-[#e8572a] text-white"
                        : isPassed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    )}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : `0${step.id}`}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-400">
                    {step.time}
                  </span>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                    isActive
                      ? "bg-orange-100 text-[#e8572a] border border-orange-200"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {step.tag}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4
                  className={cn(
                    "text-sm font-bold transition-colors",
                    isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                  )}
                >
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Metric Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 text-[11px]">{step.metricLabel}</span>
                <span
                  className={cn(
                    "font-bold",
                    isActive ? "text-[#e8572a]" : "text-slate-700"
                  )}
                >
                  {step.metric}
                </span>
              </div>

              {/* Active Pointer Arrow on Desktop */}
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-[#e8572a] rotate-45 hidden lg:block" />
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Detail Showcase (What actually runs at this stage) */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Step 1: Inbound Webhook Ingestion */}
        {activeStep === 1 && (
          <div className="divide-y divide-slate-100">
            <div className="p-6 sm:p-8 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#e8572a] font-mono text-[10.5px] font-bold">
                    STAGE 01 · 00:00.200s
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    HTTP 200 OK &bull; Idempotency Verified
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Sub-second Inbound Webhook Capture
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  Lead submits form or sends WhatsApp inquiry. Operator verifies webhook signatures, sanitizes payload, deduplicates across a 7-day memory cache, and dispatches the voice engine in &lt;200ms.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 font-mono text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ingestion Latency: 18ms</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Deduplication: 7-Day Window Active
                </div>
              </div>
            </div>

            {/* Code / Ingestion Payload Display */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0c0e14] text-white">
              <div className="lg:col-span-8 font-mono text-xs leading-relaxed space-y-2 overflow-x-auto">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span>https://api.operator.ai/v1/inbound/webhook</span>
                </div>
                <pre className="text-slate-300 font-mono text-[12px] pt-2">
{`// Verified Inbound Webhook Payload (Sunday 8:42 PM IST)
{
  "event": "lead.inbound_captured",
  "source": "WhatsApp Business API",
  "tenant_id": "org_growth_capital",
  "lead": {
    "name": "Rahul Verma",
    "phone": "+91 98112 40566",
    "company": "Verma Logistics & Infra",
    "city": "Gurugram, Haryana",
    "requirement": "Require 10,000 monthly voice calls for EMI recovery",
    "budget_range": "₹3,00,000 - ₹5,00,000 / month",
    "source_campaign": "Google Ads - High Ticket Inbound"
  },
  "timestamp": "2026-09-06T20:42:11.412+05:30",
  "routing": "DISPATCH_VOICE_AGENT_IMMEDIATE"
}`}
                </pre>
              </div>

              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#161a23] border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="font-mono text-[11px] text-[#e8572a] font-bold uppercase tracking-wider block">
                    Security &amp; Isolation
                  </span>
                  <div className="space-y-2 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>HMAC SHA-256 Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>XSS &amp; SQLi Sanitized</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tenant Row Isolation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Loss Guarantee</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0c0e14] border border-slate-800 font-mono text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-bold block mb-0.5">Automated Action:</span>
                  Triggering outbound AI phone operator to +91 98112 ••••• in 1.2s...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vernacular Voice AI Call */}
        {activeStep === 2 && (
          <div className="divide-y divide-slate-100">
            <div className="p-6 sm:p-8 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#e8572a] font-mono text-[10.5px] font-bold">
                    STAGE 02 · 00:01.800s
                  </span>
                  <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE CALL CONNECTED
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Sub-300ms Native Voice Dialogue
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  Agni dials the prospect immediately. Speaks fluent Hindi, Hinglish, Marathi, Tamil, or English with human pauses, empathy, and objection handling.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 font-mono text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-[#e8572a] font-bold">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speech-to-Speech: 278ms</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Dialect: hi-IN (Hinglish Native)
                </div>
              </div>
            </div>

            {/* Simulated Live Call Card */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
              {/* Dialogue Transcript */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-3 font-sans">
                  {/* Lead Message */}
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      RV
                    </span>
                    <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-100 text-slate-800 text-xs sm:text-sm space-y-1 max-w-xl">
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-500">
                        <span className="font-bold">Rahul Verma (Prospect)</span>
                        <span>00:04</span>
                      </div>
                      <p className="font-medium leading-relaxed">
                        &ldquo;हाँ जी बोलिए, मैंने अभी WhatsApp पर एक इन्क्वायरी डाली थी AI कॉलिंग के बारे में?&rdquo;
                      </p>
                      <p className="font-mono text-[11px] text-slate-500 italic">
                        Haan ji boliye, maine abhi WhatsApp par enquiry daali thi...
                      </p>
                    </div>
                  </div>

                  {/* Agni Message */}
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#e8572a] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      AG
                    </span>
                    <div className="p-4 rounded-2xl rounded-tl-xs bg-orange-50/70 border border-orange-200/80 text-slate-900 text-xs sm:text-sm space-y-1 max-w-xl">
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-[#e8572a]">
                        <span className="font-bold">Agni (AI Operator)</span>
                        <span>00:08 · Latency 280ms</span>
                      </div>
                      <p className="font-medium leading-relaxed">
                        &ldquo;नमस्ते राहुल जी! बिल्कुल, मैं आपकी रिक्वायरमेंट देख रही हूँ। आप 10,000 मंथली कॉल्स EMI रिकवरी के लिए प्लान कर रहे हैं। क्या हम कल सुबह 11:30 बजे सीनियर क्लोज़र के साथ एक क्विक 15-मिनट डेमो सेट करें?&rdquo;
                      </p>
                      <p className="font-mono text-[11px] text-slate-500 italic">
                        Namaste Rahul ji! Bilkul, aapki requirement 10,000 monthly calls ki hai...
                      </p>
                    </div>
                  </div>

                  {/* Lead Confirmation */}
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      RV
                    </span>
                    <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-100 text-slate-800 text-xs sm:text-sm space-y-1 max-w-xl">
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-500">
                        <span className="font-bold">Rahul Verma (Prospect)</span>
                        <span>00:15</span>
                      </div>
                      <p className="font-medium leading-relaxed">
                        &ldquo;हाँ, कल 11:30 AM ठीक रहेगा। मुझे लिंक भेज दीजिए।&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call Telemetry Card */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0c0e14] text-white flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>SPEECH STREAM ACTIVE</span>
                    </div>
                    <span className="font-mono text-xs text-[#e8572a] font-bold">00:24</span>
                  </div>

                  {/* Waveform graphic */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <span className="font-mono text-[10.5px] text-slate-400 block">Neural Audio Packet Telemetry</span>
                    <div className="flex items-center justify-between gap-1 h-8">
                      {[18, 28, 45, 60, 32, 22, 54, 70, 85, 42, 65, 30, 48, 20, 52, 68, 38].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h * 0.3}px` }}
                          className="w-1.5 rounded-full bg-[#e8572a] animate-pulse"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emotion Detected:</span>
                      <span className="text-emerald-400 font-bold">High Interest · Collaborative</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Code-Switching:</span>
                      <span>Hindi ↔ English Seamless</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Background Noise:</span>
                      <span>Filtered &amp; Suppressed (99.8%)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  Triggering qualification scoring node...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Mathematical Intent Scoring */}
        {activeStep === 3 && (
          <div className="divide-y divide-slate-100">
            <div className="p-6 sm:p-8 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#e8572a] font-mono text-[10.5px] font-bold">
                    STAGE 03 · 00:03.200s
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    96/100 Intent Score Calculated
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Instant Mathematical Dossier &amp; Intent Scoring
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  While on the call, Operator extracts exact budget tiers, verifies decision-maker authority, and generates a structured scorecard with zero manual SDR note-taking.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 font-mono text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Tier-1 Hot Lead</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Budget Confirmed: ₹3L–₹5L/mo
                </div>
              </div>
            </div>

            {/* Scorecard Matrix Display */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
              {/* Score Breakdown Bar */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-6 rounded-2xl bg-[#f7f8fb] border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                        Dossier Intent Score
                      </span>
                      <div className="text-3xl font-extrabold text-slate-900 mt-0.5 font-mono">
                        96 <span className="text-sm font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                      HIGH TICKET FIT
                    </span>
                  </div>

                  {/* 4 Factor Progress Bars */}
                  <div className="space-y-3 pt-2">
                    {[
                      { name: "Budget Verification (₹3L–₹5L/mo)", score: "25/25", pct: "100%", color: "bg-emerald-500" },
                      { name: "Authority Level (Managing Director / Owner)", score: "20/20", pct: "100%", color: "bg-emerald-500" },
                      { name: "Timeline Urgency (Immediate / <14 Days)", score: "20/20", pct: "100%", color: "bg-emerald-500" },
                      { name: "Call Volume Requirement (10,000 calls/mo)", score: "18/20", pct: "90%", color: "bg-[#e8572a]" },
                      { name: "Objection Resolution (Zero blockers)", score: "13/15", pct: "86%", color: "bg-indigo-500" },
                    ].map((f, fi) => (
                      <div key={fi} className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between text-slate-600">
                          <span>{f.name}</span>
                          <span className="font-bold text-slate-800">{f.score}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            style={{ width: f.pct }}
                            className={cn("h-full rounded-full", f.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dossier Structured JSON / Key-Value */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0c0e14] text-white flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#e8572a]">
                    Extracted Lead Intelligence
                  </span>
                  <div className="space-y-2.5 font-mono text-xs text-slate-300">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10.5px] text-slate-400 block">Verified Decision Maker</span>
                      <p className="font-bold text-white">Rahul Verma (Managing Director)</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10.5px] text-slate-400 block">Projected Monthly Value</span>
                      <p className="font-bold text-emerald-400">₹4,20,000 / month (₹50.4L ARR)</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10.5px] text-slate-400 block">Target Workflow</span>
                      <p className="text-white">EMI Reminders + Recovery Automation</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-center font-mono text-xs font-bold">
                    ✓ Approved for Instant Calendar Booking
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Calendar Lock & CRM Sync */}
        {activeStep === 4 && (
          <div className="divide-y divide-slate-100">
            <div className="p-6 sm:p-8 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#e8572a] font-mono text-[10.5px] font-bold">
                    STAGE 04 · 00:04.870s
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    MEETING CONFIRMED &bull; CRM SYNCED
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Google Meet Locked. WhatsApp Confirmation Dispatched.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  In under 5 seconds from the prospect's initial click, the slot is committed on your closer's calendar, an instant WhatsApp reminder with Google Meet link is delivered, and the deal row is created in HubSpot or Salesforce.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 font-mono text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Total Time: 4.87 Seconds</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Human SDR Effort: 0 Seconds
                </div>
              </div>
            </div>

            {/* Calendar Card + WhatsApp Message Showcase */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
              {/* Google Meet Invite Card */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-700 font-bold">
                    <CalendarCheck className="w-4 h-4 text-[#e8572a]" />
                    <span>Google Calendar &bull; Confirmed Slot</span>
                  </div>
                  <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    SLOT COMMITTED
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900 text-base">
                      AI Operator Architecture Demo · Rahul Verma
                    </h5>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                      Tomorrow · 11:30 AM – 12:00 PM (IST)
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Meeting Link:</span>
                      <span className="text-indigo-600 font-bold">meet.google.com/rvk-yzae-qpx</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Host (Closer):</span>
                      <span>Arun Verma (Enterprise Head)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guest:</span>
                      <span>rahul@vermalogistics.in</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Calendar invite automatically pushed to Rahul's Google Calendar</span>
                </div>
              </div>

              {/* WhatsApp Message Confirmation Card */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0c0e14] text-white space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold">
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Business &bull; Instant Confirmation</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">DELIVERED</span>
                  </div>

                  {/* WhatsApp Chat Bubble */}
                  <div className="p-4 rounded-2xl rounded-tr-xs bg-[#161a23] border border-slate-800 text-xs text-slate-200 space-y-2 max-w-md">
                    <p className="font-semibold text-emerald-400 text-[11px] font-mono">
                      OPERATOR AI &bull; OFFICIAL VERIFIED
                    </p>
                    <p className="leading-relaxed">
                      नमस्ते <strong>राहुल वर्मा जी</strong>, आपका 30-मिनट का AI वॉइस ऑपरेटर डेमो सेशन कल <strong>सुबह 11:30 AM</strong> पर कन्फर्म हो चुका है।
                    </p>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 font-mono text-[11px] text-slate-300">
                      📅 कल, 11:30 AM IST<br />
                      🔗 Google Meet: <span className="text-indigo-400 underline">meet.google.com/rvk-yzae-qpx</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Sent at 8:42 PM &bull; Double blue tick
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>HubSpot / CRM Deal:</span>
                  <span className="text-emerald-400 font-bold">₹50,40,000 Pipeline Added</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 3 Verified Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#e8572a] shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">&lt;5 Seconds First Touch</span>
            <span className="text-slate-500 font-mono text-[11px]">Sub-5s vs 4.2 hours human avg</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">24/7/365 Zero Drop-off</span>
            <span className="text-slate-500 font-mono text-[11px]">Never lose after-6 PM or weekend leads</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Direct Calendar Commits</span>
            <span className="text-slate-500 font-mono text-[11px]">83.33% discovery show-up rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InboundArchitecturePipeline;
