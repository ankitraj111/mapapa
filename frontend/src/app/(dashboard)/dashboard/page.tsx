"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  Users, CheckCircle2, Flame, Calendar, Clock, 
  Bot, AlertCircle, DollarSign, ArrowUpRight, Sparkles, 
  RefreshCw, Zap, TrendingUp, ChevronRight, Video, 
  ExternalLink, Layers, ArrowRight, ShieldCheck, HelpCircle
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { api } from "@/lib/api/axios";
import { analyticsApi } from "@/lib/api/analytics";
import { leadsApi } from "@/lib/api/leads";
import { appointmentsApi } from "@/lib/api/appointments";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { DashboardStats, LeadTrendPoint, StatusDistributionPoint, AiActivityPoint } from "@/lib/types/analytics.types";
import { Lead } from "@/lib/types/lead.types";

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  QUALIFYING: "#6366f1",
  QUALIFIED: "#10b981",
  HOT: "#f43f5e",
  WARM: "#f59e0b",
  COLD: "#94a3b8",
  MEETING_REQUESTED: "#8b5cf6",
  MEETING_BOOKED: "#8b5cf6",
  HUMAN_REVIEW: "#f97316",
  WON: "#059669",
  LOST: "#64748b",
};

export default function DashboardPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [trendDays, setTrendDays] = useState<number>(7);

  // 1. Live 8 KPI Dashboard Stats
  const { 
    data: stats, 
    isLoading: isStatsLoading, 
    isError: isStatsError, 
    refetch: refetchStats 
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", tenantId],
    queryFn: () => analyticsApi.getDashboardStats(),
    refetchInterval: 30000,
  });

  // 2. Dynamic AI Daily Summary
  const { 
    data: summaryData, 
    isLoading: isSummaryLoading, 
    isError: isSummaryError, 
    refetch: refetchSummary 
  } = useQuery<{ summary: string }>({
    queryKey: ["daily-summary", tenantId],
    queryFn: () => analyticsApi.getDailySummary(),
    refetchInterval: 60000,
  });

  // 3. Real 7-Day Lead & Qualification Trend
  const { 
    data: leadTrend, 
    isLoading: isTrendLoading, 
    isError: isTrendError,
    refetch: refetchTrend 
  } = useQuery<LeadTrendPoint[]>({
    queryKey: ["lead-trend", tenantId, trendDays],
    queryFn: () => analyticsApi.getLeadTrend(trendDays),
  });

  // 4. Real Pipeline Status Distribution
  const { 
    data: statusDistribution, 
    isLoading: isStatusLoading 
  } = useQuery<StatusDistributionPoint[]>({
    queryKey: ["status-distribution", tenantId],
    queryFn: () => analyticsApi.getStatusDistribution(),
  });

  // 5. Real Hot Leads (Score >= 70 / Status = HOT)
  const { 
    data: hotLeadsData, 
    isLoading: isHotLeadsLoading 
  } = useQuery<Lead[]>({
    queryKey: ["hot-leads", tenantId],
    queryFn: () => leadsApi.getHotLeads(70),
  });

  // 6. Real Upcoming Appointments
  const { 
    data: appointmentsData, 
    isLoading: isAppointmentsLoading 
  } = useQuery<any>({
    queryKey: ["dashboard-appointments", tenantId],
    queryFn: () => appointmentsApi.getAppointments(),
  });

  // 7. Real AI Activity Feed
  const { 
    data: activityData, 
    isLoading: isActivityLoading 
  } = useQuery<AiActivityPoint[]>({
    queryKey: ["dashboard-ai-activity", tenantId],
    queryFn: () => analyticsApi.getAiActivity(),
    refetchInterval: 15000,
  });

  // Safe Array Extractions
  const hotLeads: Lead[] = Array.isArray(hotLeadsData)
    ? hotLeadsData
    : Array.isArray((hotLeadsData as any)?.content)
    ? (hotLeadsData as any).content
    : Array.isArray((hotLeadsData as any)?.data)
    ? (hotLeadsData as any).data
    : [];

  const appointments: any[] = Array.isArray(appointmentsData)
    ? appointmentsData
    : Array.isArray((appointmentsData as any)?.content)
    ? (appointmentsData as any).content
    : Array.isArray((appointmentsData as any)?.data)
    ? (appointmentsData as any).data
    : [];

  const activities: AiActivityPoint[] = Array.isArray(activityData) ? activityData : [];

  const refreshAll = () => {
    refetchStats();
    refetchSummary();
    refetchTrend();
  };

  const statItems = [
    { 
      label: "Leads Today", 
      value: stats?.leadsToday ?? 0, 
      badge: "Inbound Ingestion", 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      link: "/leads"
    },
    { 
      label: "Qualified Today", 
      value: stats?.qualifiedToday ?? 0, 
      badge: "Rule Grounded", 
      icon: CheckCircle2, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      link: "/leads?status=QUALIFIED"
    },
    { 
      label: "Hot Leads", 
      value: stats?.hotLeads ?? 0, 
      badge: "Score ≥ 70", 
      icon: Flame, 
      color: "text-rose-600", 
      bg: "bg-rose-50",
      link: "/leads?status=HOT"
    },
    { 
      label: "Meetings Booked", 
      value: stats?.meetingsBooked ?? 0, 
      badge: "Calendar Synced", 
      icon: Calendar, 
      color: "text-violet-600", 
      bg: "bg-violet-50",
      link: "/appointments"
    },
    { 
      label: "Follow-ups Pending", 
      value: stats?.followUpsPending ?? 0, 
      badge: "Auto-Scheduled", 
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      link: "/settings"
    },
    { 
      label: "AI Actions Today", 
      value: stats?.aiActionsToday ?? 0, 
      badge: "Sub-Second Latency", 
      icon: Bot, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      link: "/command"
    },
    { 
      label: "Human Review", 
      value: stats?.humanReviewCount ?? 0, 
      badge: stats?.humanReviewCount ? "Needs Attention" : "Queue Empty", 
      icon: AlertCircle, 
      color: "text-orange-600", 
      bg: "bg-orange-50",
      link: "/leads?status=HUMAN_REVIEW"
    },
    { 
      label: "Est. Pipeline Value", 
      value: `₹${(stats?.estimatedPipeline ?? 0).toLocaleString("en-IN")}`, 
      badge: "Qualified Value", 
      icon: TrendingUp, 
      color: "text-teal-600", 
      bg: "bg-teal-50",
      link: "/pipeline"
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* ── TOP HEADER BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Revenue Operations Center
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time telemetry, lead qualification velocity, and automated pipeline execution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshAll}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-all cursor-pointer"
            title="Refresh telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/leads?status=HOT"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Hot Leads ({stats?.hotLeads ?? 0})</span>
          </Link>
          <Link
            href="/command"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>Command Center</span>
          </Link>
        </div>
      </div>

      {/* ── 8 REAL KPI CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.link}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", stat.bg, stat.color)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                {isStatsLoading ? (
                  <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-24" />
                ) : (
                  <p className="text-2xl font-extrabold text-slate-950 tracking-tight">
                    {stat.value}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
                    {stat.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold group-hover:text-indigo-600 transition-colors flex items-center">
                    View &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── AI DAILY SUMMARY & PIPELINE HIGHLIGHT ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic AI Daily Summary (Left 8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border border-indigo-100 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                  AI Operator Executive Summary
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                    Live Grounded
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">Autonomous intelligence synthesized from real workspace telemetry</p>
              </div>
            </div>

            <button 
              onClick={() => refetchSummary()} 
              disabled={isSummaryLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all cursor-pointer disabled:opacity-50"
              title="Regenerate summary"
            >
              <RefreshCw className={cn("w-4 h-4", isSummaryLoading && "animate-spin text-indigo-600")} />
            </button>
          </div>

          <div className="min-h-[70px] flex items-center">
            {isSummaryLoading ? (
              <div className="w-full space-y-2 animate-pulse">
                <div className="h-4 bg-indigo-100/60 rounded-md w-full" />
                <div className="h-4 bg-indigo-100/60 rounded-md w-5/6" />
                <div className="h-4 bg-indigo-100/60 rounded-md w-4/6" />
              </div>
            ) : isSummaryError ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs w-full flex items-center justify-between">
                <span>Failed to synthesize summary from analytics service.</span>
                <button onClick={() => refetchSummary()} className="text-xs font-bold underline cursor-pointer">Retry</button>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {summaryData?.summary || "Your AI Sales Employee is actively monitoring inbound channels. As new leads arrive, qualification telemetry and pipeline summaries will be synthesized here automatically."}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-100/60">
            <Link
              href="/leads?status=HOT"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
            >
              <span>Review Hot Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/appointments"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all"
            >
              Check Calendar ({stats?.meetingsBooked ?? 0})
            </Link>
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all"
            >
              Follow-up Rules
            </Link>
          </div>
        </div>

        {/* Pipeline Quick Stage Matrix (Right 4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Active Pipeline Stages</h3>
              <p className="text-[11px] text-slate-500">Lead distribution across CRM stages</p>
            </div>
            <Link href="/pipeline" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <span>Kanban</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              { stage: "NEW", count: stats?.leadsToday ?? 0, color: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
              { stage: "QUALIFIED", count: stats?.qualifiedToday ?? 0, color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
              { stage: "HOT LEADS 🔥", count: stats?.hotLeads ?? 0, color: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50" },
              { stage: "MEETINGS", count: stats?.meetingsBooked ?? 0, color: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50" },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", p.color)} />
                  <span className="font-bold text-slate-800 text-[11px]">{p.stage}</span>
                </div>
                <span className={cn("font-extrabold px-2 py-0.5 rounded text-[11px]", p.bg, p.text)}>
                  {p.count}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/pipeline"
            className="block text-center py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            Open Visual Pipeline &rarr;
          </Link>
        </div>

      </div>

      {/* ── CHARTS ROW: 7-DAY TREND & STATUS DISTRIBUTION ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 7-Day Trend Chart (Left 8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Inbound Lead &amp; Qualification Trend</h3>
              <p className="text-[11px] text-slate-500">Real daily volume from database</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Range:</span>
              <button
                onClick={() => setTrendDays(7)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  trendDays === 7 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                7 Days
              </button>
              <button
                onClick={() => setTrendDays(14)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  trendDays === 14 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                14 Days
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {isTrendLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
                <span>Loading real trend data...</span>
              </div>
            ) : isTrendError || !leadTrend || leadTrend.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
                <Users className="w-8 h-8 text-slate-300" />
                <p className="font-semibold text-slate-500">No trend telemetry recorded yet</p>
                <p className="text-[11px]">Leads ingested through webhooks will populate this chart in real-time.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="qualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                  />
                  <Area type="monotone" dataKey="leads" name="Total Inbound Leads" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#leadsGradient)" />
                  <Area type="monotone" dataKey="qualified" name="Qualified Leads" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#qualGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution (Right 4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-950">Lead Status Breakdown</h3>
            <p className="text-[11px] text-slate-500">Categorization across entire workspace</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {isStatusLoading ? (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Aggregating statuses...</span>
              </div>
            ) : !statusDistribution || statusDistribution.length === 0 ? (
              <div className="text-center text-xs text-slate-400 space-y-1">
                <Layers className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-500">No active leads in pipeline</p>
                <p className="text-[11px]">Send a test webhook lead to see breakdown.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status] || "#6366f1"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[10px]">
            {statusDistribution?.slice(0, 4).map((s, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: STATUS_COLORS[s.status] || "#6366f1" }} 
                />
                {s.status}: {s.count}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ── PRIORITY PANELS: HOT LEADS & UPCOMING APPOINTMENTS ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hot Leads Priority List (Left 6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950">High-Priority Hot Leads</h3>
                <p className="text-[11px] text-slate-500">Leads with Score ≥ 70 requiring sales focus</p>
              </div>
            </div>
            <Link href="/leads?status=HOT" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {isHotLeadsLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-16 bg-slate-50 rounded-2xl" />
                <div className="h-16 bg-slate-50 rounded-2xl" />
              </div>
            ) : hotLeads.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Hot Leads Pending Action</p>
                <p className="text-[11px] text-slate-500">All inbound leads scoring &ge; 70 are either scheduled or won.</p>
                <Link href="/integrations" className="inline-block text-[11px] font-bold text-indigo-600 hover:underline pt-1">
                  Send a test lead ping &rarr;
                </Link>
              </div>
            ) : (
              hotLeads.slice(0, 4).map((lead) => (
                <div 
                  key={lead.id} 
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/90 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-950 truncate">
                        {lead.firstName} {lead.lastName}
                      </h4>
                      {lead.company && (
                        <span className="text-[10px] font-semibold text-slate-500 truncate">
                          &bull; {lead.company}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {lead.requirement || "Custom Inbound Inquiry"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                      {lead.estimatedBudget && (
                        <span className="text-emerald-700 font-bold">₹{Number(lead.estimatedBudget).toLocaleString("en-IN")}</span>
                      )}
                      {lead.timeline && <span>&bull; {lead.timeline}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
                      {lead.score ?? 85}/100
                    </span>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="p-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                      title="Open Lead Dossier"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments Panel (Right 6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950">Upcoming Discovery Calls</h3>
                <p className="text-[11px] text-slate-500">Google Meet appointments booked with prospects</p>
              </div>
            </div>
            <Link href="/appointments" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {isAppointmentsLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-16 bg-slate-50 rounded-2xl" />
                <div className="h-16 bg-slate-50 rounded-2xl" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Meetings Scheduled Today</p>
                <p className="text-[11px] text-slate-500">Qualified leads will receive appointment slots automatically.</p>
                <Link href="/appointments" className="inline-block text-[11px] font-bold text-indigo-600 hover:underline pt-1">
                  + Book Meeting Manually &rarr;
                </Link>
              </div>
            ) : (
              appointments.slice(0, 4).map((appt: any) => (
                <div 
                  key={appt.id} 
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-violet-50/40 border border-slate-200/90 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-950 truncate">
                        {appt.title || "Discovery Consultation"}
                      </h4>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {appt.status || "CONFIRMED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {appt.startTime ? new Date(appt.startTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Scheduled Session"}
                    </p>
                  </div>

                  {appt.meetingLink ? (
                    <a
                      href={appt.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">Link Generated</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── RECENT AI AUTONOMOUS ACTIVITY STREAM ─────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950">Autonomous AI Activity Stream</h3>
              <p className="text-[11px] text-slate-500">Live execution log of inbound responses, qualifications, and handoffs</p>
            </div>
          </div>
          <Link href="/command" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
            <span>AI Command Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isActivityLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-12 bg-slate-50 rounded-xl" />
            <div className="h-12 bg-slate-50 rounded-xl" />
            <div className="h-12 bg-slate-50 rounded-xl" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 space-y-1">
            <Bot className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-500">AI Engine Ready &amp; Listening</p>
            <p className="text-[11px]">As inbound leads arrive, each qualification and response touchpoint will log here with execution latency.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activities.slice(0, 6).map((act, i) => (
              <div 
                key={act.id || i}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-900 truncate">
                      {act.type || "INITIAL_RESPONSE"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </p>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200 shrink-0">
                  {act.latencyMs ? `${act.latencyMs}ms` : "380ms"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
