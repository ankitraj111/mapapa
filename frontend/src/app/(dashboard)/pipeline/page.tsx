'use client';

import { usePipeline, useLeadMutations } from '@/lib/hooks/use-leads';
import { Lead, LeadStatus } from '@/lib/types/lead.types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Users, Flame, CheckCircle, Calendar, Trophy, 
  ArrowRight, MoreHorizontal, Sparkles, Building2,
  Clock, DollarSign
} from 'lucide-react';
import { useState } from 'react';

const COLUMNS: { status: LeadStatus; label: string; icon: any; color: string; badge: string }[] = [
  { status: 'NEW', label: 'New Inbound', icon: Users, color: 'text-blue-700', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { status: 'QUALIFYING', label: 'Qualifying', icon: Clock, color: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { status: 'HOT', label: 'Hot Leads 🔥', icon: Flame, color: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  { status: 'QUALIFIED', label: 'Qualified', icon: CheckCircle, color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { status: 'MEETING_BOOKED', label: 'Meeting Set', icon: Calendar, color: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { status: 'NURTURE', label: 'Nurture (Exhausted)', icon: Clock, color: 'text-slate-700', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
  { status: 'WON', label: 'Closed Won 🎉', icon: Trophy, color: 'text-purple-700', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export default function PipelinePage() {
  const { data: pipeline = {} as any, isLoading } = usePipeline();
  const { updateStatus } = useLeadMutations();
  const [movingLeadId, setMovingLeadId] = useState<string | null>(null);

  // Safely extract columns from both { columns: {...} } and direct object
  const columnsMap = pipeline?.columns || pipeline || {};

  const handleQuickMove = async (e: React.MouseEvent, leadId: string, nextStatus: LeadStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setMovingLeadId(leadId);
    try {
      await updateStatus.mutateAsync({ id: leadId, status: nextStatus });
    } finally {
      setMovingLeadId(null);
    }
  };

  const getNextStage = (current: LeadStatus): LeadStatus | null => {
    switch (current) {
      case 'NEW': return 'QUALIFYING';
      case 'QUALIFYING': return 'HOT';
      case 'HOT': return 'QUALIFIED';
      case 'QUALIFIED': return 'MEETING_BOOKED';
      case 'MEETING_BOOKED': return 'WON';
      default: return null;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#f8fafc]">
      
      {/* Top Title & Stats Bar */}
      <div className="p-6 border-b border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-950">Sales Pipeline</h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Kanban
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-stage lead tracking &amp; automated stage progressions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Stages: <span className="font-bold text-slate-900">{COLUMNS.length} Active</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-5 h-full min-w-max pb-4">
          {COLUMNS.map(col => {
            const Icon = col.icon;
            const leads: Lead[] = columnsMap[col.status] || [];
            
            return (
              <div key={col.status} className="w-80 flex flex-col bg-slate-100/70 border border-slate-200/90 rounded-2xl p-3 shadow-xs">
                
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-2 pt-1 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", col.color)} />
                    <h3 className={cn("text-xs font-bold uppercase tracking-wider", col.color)}>
                      {col.label}
                    </h3>
                  </div>
                  <span className={cn("text-xs font-extrabold px-2 py-0.5 rounded-full border", col.badge)}>
                    {leads.length}
                  </span>
                </div>

                {/* Cards Column */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {leads.map(lead => {
                    const nextStage = getNextStage(lead.status);

                    return (
                      <Link key={lead.id} href={`/leads/${lead.id}`} className="block">
                        <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group shadow-xs space-y-3">
                          
                          {/* Card Top: Avatar & Score */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                {lead.firstName?.[0] || 'L'}{lead.lastName?.[0] || ''}
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                  {lead.firstName} {lead.lastName}
                                </p>
                                {lead.company ? (
                                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                                    {lead.company}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-slate-400">Direct Inbound</p>
                                )}
                              </div>
                            </div>

                            <ScorePill score={lead.score ?? 50} />
                          </div>

                          {/* Requirement / Scope */}
                          {lead.requirement && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {lead.requirement}
                            </p>
                          )}

                          {/* Budget & Timeline Pill */}
                          {(lead.estimatedBudget || lead.timeline) && (
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                              {lead.estimatedBudget && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  ₹{lead.estimatedBudget.toLocaleString()}
                                </span>
                              )}
                              {lead.timeline && (
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                                  {lead.timeline}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Card Footer: Date & Quick Advance Button */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                            <span>
                              {lead.createdAt && formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                            </span>

                            {nextStage && (
                              <button
                                onClick={(e) => handleQuickMove(e, lead.id, nextStage)}
                                disabled={movingLeadId === lead.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-bold transition-all border border-slate-200 hover:border-indigo-200"
                                title={`Advance to ${nextStage}`}
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                        </div>
                      </Link>
                    );
                  })}

                  {leads.length === 0 && (
                    <div className="p-8 rounded-xl border border-dashed border-slate-300 text-center bg-white/50">
                      <p className="text-xs text-slate-400 font-medium">No leads in stage</p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 
    ? 'bg-rose-50 text-rose-700 border-rose-200' 
    : score >= 60 
    ? 'bg-amber-50 text-amber-700 border-amber-200' 
    : 'bg-blue-50 text-blue-700 border-blue-200';
    
  return (
    <span className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs", color)}>
      {score}/100
    </span>
  );
}
