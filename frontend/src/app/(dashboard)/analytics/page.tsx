'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { 
  DollarSign, TrendingUp, Calendar, Bot, Zap, 
  ArrowRight, AlertTriangle, CheckCircle2, Clock, 
  Sparkles, Target, ShieldCheck, Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { data: attributionRes, isLoading: isAttributionLoading } = useQuery({
    queryKey: ['intelligence-attribution'],
    queryFn: async () => {
      const res: any = await api.get('/intelligence/attribution');
      return res?.data?.data || res?.data || {};
    },
  });

  const { data: actionsRes, isLoading: isActionsLoading } = useQuery({
    queryKey: ['intelligence-next-actions'],
    queryFn: async () => {
      const res: any = await api.get('/intelligence/next-actions');
      return res?.data?.data || res?.data || [];
    },
  });

  const { data: pipelineRes } = useQuery({
    queryKey: ['intelligence-pipeline-insights'],
    queryFn: async () => {
      const res: any = await api.get('/intelligence/pipeline-insights');
      return res?.data?.data || res?.data || {};
    },
  });

  const attribution = attributionRes || {};
  const nextActions: any[] = Array.isArray(actionsRes) ? actionsRes : [];
  const pipelineInsights = pipelineRes || {};
  const highVelocityDeals: any[] = pipelineInsights.highVelocityDeals || [];
  const stagnantDeals: any[] = pipelineInsights.stagnantDeals || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* ── TOP HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-950">AI Revenue Intelligence</h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              Live ROI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time revenue attribution, deal velocity tracking, and prioritized Next Best Actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/command"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Open AI Command Center</span>
          </Link>
        </div>
      </div>

      {/* ── 1. REVENUE ATTRIBUTION CARDS ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Pipeline */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">AI Managed Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-950">
            ₹{(attribution.totalPipelineValue || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {attribution.totalLeads || 0} active leads
          </p>
        </div>

        {/* Won Deals Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">AI Closed Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-950">
            ₹{(attribution.aiGeneratedRevenue || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {attribution.dealsWon || 0} deals closed won
          </p>
        </div>

        {/* Meetings Booked */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Meetings Scheduled</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-950">
            {attribution.meetingsBooked || 0}
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold">
            Google Meet auto-synced
          </p>
        </div>

        {/* AI Response Velocity */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Avg AI Response Time</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {attribution.avgAiResponseSpeed || "1.8s"}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {attribution.aiActions30d || 0} AI actions in 30d
          </p>
        </div>

      </div>

      {/* ── 2. NEXT BEST ACTION QUEUE ──────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-950 text-sm">Next Best Action Queue</h2>
              <p className="text-xs text-slate-500">AI-recommended next steps for each lead to accelerate closing</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {nextActions.length} Actions Queued
          </span>
        </div>

        <div className="space-y-3">
          {isActionsLoading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Calculating next best actions...</p>
          ) : nextActions.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-500 font-medium">No active leads requiring action</p>
            </div>
          ) : (
            nextActions.slice(0, 5).map((action: any, i: number) => (
              <div 
                key={i}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider",
                      action.priority === "URGENT" ? "bg-rose-100 text-rose-800" :
                      action.priority === "HIGH" ? "bg-amber-100 text-amber-800" :
                      "bg-indigo-100 text-indigo-800"
                    )}>
                      {action.priority} Priority
                    </span>
                    <span className="text-xs font-bold text-slate-900">{action.leadName}</span>
                    <span className="text-xs text-slate-400">({action.company})</span>
                  </div>
                  <p className="text-xs text-slate-600">{action.rationale}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-extrabold text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-2xs">
                    {action.recommendedAction.replace(/_/g, ' ')}
                  </span>
                  <Link 
                    href={`/leads/${action.leadId}`}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-bold transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── 3. PIPELINE INTELLIGENCE & STAGNATION ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Closest to Closing */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className="font-extrabold text-slate-950 text-sm">Deals Closest to Closing</h3>
          </div>

          <div className="space-y-2.5">
            {highVelocityDeals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No high-velocity deals in stage</p>
            ) : (
              highVelocityDeals.slice(0, 4).map((deal: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{deal.name}</p>
                    <p className="text-[11px] text-slate-500">{deal.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-emerald-600">₹{deal.budget?.toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-indigo-600">Score {deal.score}/100</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stagnant Deals Alert */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-slate-950 text-sm">Pipeline Stagnation Risks (&gt; 48h)</h3>
          </div>

          <div className="space-y-2.5">
            {stagnantDeals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No stagnant leads. Great follow-up velocity!</p>
            ) : (
              stagnantDeals.slice(0, 4).map((deal: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{deal.name}</p>
                    <p className="text-[11px] text-amber-800">{deal.warning}</p>
                  </div>
                  <Link 
                    href={`/leads/${deal.leadId}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    Nudge →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
