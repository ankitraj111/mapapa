"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Zap, Activity, CheckCircle, XCircle, Clock, Users, Calendar, TrendingUp, AlertTriangle, Play, Pause, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string; type: string; status: string; createdAt: string; latencyMs: number;
}
interface DashboardStats {
  leadsToday: number; qualifiedToday: number; hotLeads: number;
  meetingsBooked: number; followUpsPending: number; aiActionsToday: number; humanReviewCount: number;
}

const ACTION_LABELS: Record<string, string> = {
  INITIAL_RESPONSE: "Sent initial response to lead",
  QUALIFY_RESPONSE: "Continued qualification conversation",
  SCORE_UPDATE: "Updated lead score",
  MEETING_OFFER: "Offered meeting to lead",
  FOLLOW_UP: "Sent follow-up message",
  ESCALATION: "Escalated to human review",
};

export default function AIEmployeePage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [isActive, setIsActive] = useState(true);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", tenantId],
    queryFn: async () => {
      const r: any = await api.get(`/analytics/dashboard`);
      return r.data;
    },
    refetchInterval: 30000,
  });

  const { data: activityData } = useQuery<ActivityItem[]>({
    queryKey: ["ai-activity", tenantId],
    queryFn: async () => {
      const r: any = await api.get(`/analytics/ai-activity`);
      return r.data || [];
    },
    refetchInterval: 15000,
  });

  const metrics = [
    { label: "Leads Today", value: stats?.leadsToday ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Qualified", value: stats?.qualifiedToday ?? 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Hot Leads", value: stats?.hotLeads ?? 0, icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Meetings Booked", value: stats?.meetingsBooked ?? 0, icon: Calendar, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Follow-ups Pending", value: stats?.followUpsPending ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Needs Attention", value: stats?.humanReviewCount ?? 0, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "AI Actions Today", value: stats?.aiActionsToday ?? 0, icon: Bot, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Light Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/90 border border-indigo-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Zap className="w-8 h-8 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Alex</h1>
            <p className="text-slate-500 text-sm">AI Sales Employee</p>
            <div className={cn("flex items-center gap-2 mt-1", isActive ? "text-emerald-600" : "text-slate-400")}>
              <span className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
              <span className="text-xs font-bold">{isActive ? "Active — Handling inbound sales" : "Paused"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm",
              isActive
                ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            )}
          >
            {isActive ? <><Pause className="w-4 h-4" /> Pause AI</> : <><Play className="w-4 h-4" /> Activate AI</>}
          </button>
        </div>
      </div>

      {/* Performance metrics */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Today&apos;s Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", m.bg, m.color)}>
                  <m.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">{m.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed — Clean White Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            AI Real-Time Activity Log
          </h2>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
            Live Stream
          </span>
        </div>
        <div>
          {activityData && activityData.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activityData.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                    item.status === "SUCCESS" ? "bg-emerald-500" : item.status === "FAILED" ? "bg-rose-500" : "bg-amber-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium">{ACTION_LABELS[item.type] || item.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleTimeString()} · {item.latencyMs}ms latency</p>
                  </div>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-bold",
                    item.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    item.status === "FAILED" ? "bg-rose-50 text-rose-700 border border-rose-200" : 
                    "bg-amber-50 text-amber-700 border border-amber-200"
                  )}>{item.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Bot className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 text-sm font-medium">AI is active and monitoring lead channels</p>
              <p className="text-slate-400 text-xs mt-1">Actions will log here automatically when inquiries arrive</p>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Status — Clean White Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4">AI Employee Readiness</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600">Lead qualification: <span className="font-bold text-slate-900">Active</span></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600">Auto follow-up: <span className="font-bold text-slate-900">Active</span></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600">Meeting booking: <span className="font-bold text-slate-900">Active</span></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600">Knowledge base: <span className="font-bold text-slate-900">Configured</span></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600">Website webhook: <span className="font-bold text-emerald-600">Ready</span></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600">Lead Scoring: <span className="font-bold text-slate-900">Deterministic</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
