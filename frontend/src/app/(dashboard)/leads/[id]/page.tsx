'use client';
import { useParams } from 'next/navigation';
import { useLead } from '@/lib/hooks/use-leads';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/conversations';
import { leadsApi } from '@/lib/api/leads';
import { api } from '@/lib/api/axios';
import { cn } from '@/lib/utils';
import { 
  Brain, Send, StickyNote, Phone, Mail, Building2, 
  MapPin, DollarSign, Clock, Tag, Star, Calendar,
  CheckSquare, Activity, RefreshCw, User, Zap
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Message, MessageType } from '@/lib/types/conversation.types';
import { Lead } from '@/lib/types/lead.types';
import { useState, useRef, useEffect } from 'react';

export default function LeadDetailPage() {
  const routeParams = useParams();
  const id = typeof routeParams?.id === 'string' ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : '';
  const { data: lead, isLoading } = useLead(id);
  const [activeTab, setActiveTab] = useState('info');
  const [message, setMessage] = useState('');
  const [isNote, setIsNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ['lead-conversations', id],
    queryFn: () => conversationsApi.getLeadConversations(id),
    enabled: !!id,
  });

  const conversationId = conversations?.[0]?.id;

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationsApi.getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 30_000,
  });

  const sendMessage = useMutation({
    mutationFn: ({ content, type }: { content: string; type: string }) =>
      conversationsApi.sendMessage(conversationId!, content, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      setMessage('');
    },
  });

  const processWithAI = useMutation({
    mutationFn: () => leadsApi.processWithAI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!lead) return <div className="p-8 text-muted-foreground">Lead not found</div>;

  const scoreColor = lead.score >= 80 ? 'text-red-400' : lead.score >= 60 ? 'text-amber-400' : 'text-gray-400';
  const scoreBg = lead.score >= 80 ? 'bg-red-500/10 border-red-500/30' : lead.score >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-gray-500/10 border-gray-500/30';

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel - Conversation */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0">
        {/* Lead Header */}
        <div className="p-6 border-b border-border bg-card/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                {lead.firstName[0]}{lead.lastName?.[0] || ''}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{lead.firstName} {lead.lastName}</h1>
                <p className="text-muted-foreground text-sm">{lead.email} {lead.company && `• ${lead.company}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("px-3 py-1.5 rounded-full border text-sm font-semibold", scoreBg, scoreColor)}>
                {lead.score} pts
              </div>
              <StatusBadge status={lead.status} />
              <button
                onClick={() => processWithAI.mutate()}
                disabled={processWithAI.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50"
              >
                {processWithAI.isPending ? (
                  <><div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><Brain className="w-3.5 h-3.5" /> Process with AI</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messagesLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Brain className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No messages yet. Process with AI to start.</p>
            </div>
          ) : (
            messages.map((msg: any) => <MessageBubble key={msg.id} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        <div className="p-4 border-t border-border bg-card/30">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setIsNote(false)} className={cn("text-xs px-3 py-1 rounded-lg font-medium transition-colors", !isNote ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground")}>
              Reply
            </button>
            <button onClick={() => setIsNote(true)} className={cn("flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-medium transition-colors", isNote ? "bg-amber-600 text-white" : "text-muted-foreground hover:text-foreground")}>
              <StickyNote className="w-3 h-3" /> Add Note
            </button>
          </div>
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey && message.trim()) { sendMessage.mutate({ content: message, type: isNote ? 'NOTE' : 'HUMAN' }); }}}
              placeholder={isNote ? "Add an internal note..." : "Type a reply... (⌘+Enter to send)"}
              rows={3}
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 resize-none"
            />
            <button
              onClick={() => message.trim() && sendMessage.mutate({ content: message, type: isNote ? 'NOTE' : 'HUMAN' })}
              disabled={!message.trim() || sendMessage.isPending}
              className="self-end px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-96 flex flex-col overflow-hidden bg-card/30">
        {/* Tabs */}
        <div className="flex border-b border-border px-4">
          {['info', 'ai', 'appointments', 'activity'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
                activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              {tab === 'ai' ? 'AI Summary' : tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'info' && <LeadInfoPanel lead={lead} />}
          {activeTab === 'ai' && <AISummaryPanel lead={lead} />}
          {activeTab === 'appointments' && <AppointmentsPanel leadId={id} />}
          {activeTab === 'activity' && <ActivityPanel leadId={id} />}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.type === 'AI';
  const isCustomer = message.type === 'CUSTOMER';
  const isSystem = message.type === 'SYSTEM';
  const isNote = message.type === 'NOTE';

  if (isSystem) return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground px-2">{message.content}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );

  if (isNote) return (
    <div className="mx-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <p className="text-xs font-medium text-amber-400 mb-1">📝 Note by {message.senderName || 'Team'}</p>
      <p className="text-sm text-foreground">{message.content}</p>
    </div>
  );

  return (
    <div className={cn("flex gap-3", isAI || !isCustomer ? "justify-end" : "justify-start")}>
      {isCustomer && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">
          {message.senderName?.[0] || 'C'}
        </div>
      )}
      <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm", 
        isAI ? "rounded-tr-sm bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 shadow-[0_4px_24px_rgba(99,102,241,0.1)]" :
        isCustomer ? "rounded-tl-sm bg-secondary text-foreground" :
        "rounded-tr-sm bg-blue-600/20 border border-blue-500/30"
      )}>
        {isAI && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-medium text-indigo-300">AI Sales Employee</span>
          </div>
        )}
        <p className="text-foreground leading-relaxed">{message.content}</p>
        <p className="text-xs text-muted-foreground mt-1.5">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</p>
      </div>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    HOT: 'bg-red-500/20 text-red-400 border-red-500/30',
    WARM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    QUALIFIED: 'bg-green-500/20 text-green-400 border-green-500/30',
    NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    COLD: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    MEETING_BOOKED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    WON: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    LOST: 'bg-red-900/20 text-red-600 border-red-900/30',
    HUMAN_REVIEW: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  return (
    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", colors[status] || colors.NEW)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function LeadInfoPanel({ lead }: { lead: Lead }) {
  const fields = [
    { icon: Mail, label: 'Email', value: lead.email },
    { icon: Phone, label: 'Phone', value: lead.phone },
    { icon: Building2, label: 'Company', value: lead.company },
    { icon: MapPin, label: 'Location', value: lead.location },
    { icon: Tag, label: 'Source', value: lead.source?.replace(/_/g, ' ') },
    { icon: DollarSign, label: 'Budget', value: lead.estimatedBudget ? `₹${lead.estimatedBudget?.toLocaleString()}` : undefined },
    { icon: Clock, label: 'Timeline', value: lead.timeline },
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Lead Information</h3>
      {fields.filter(f => f.value).map(f => (
        <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
          <f.icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">{f.label}</p>
            <p className="text-sm text-foreground">{f.value}</p>
          </div>
        </div>
      ))}
      {lead.requirement && (
        <div className="p-3 rounded-xl bg-secondary/30">
          <p className="text-xs text-muted-foreground mb-1">Requirement</p>
          <p className="text-sm text-foreground">{lead.requirement}</p>
        </div>
      )}
    </div>
  );
}

function AISummaryPanel({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">AI Summary</h3>
      {lead.aiSummary ? (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">Generated by AI</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{lead.aiSummary}</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-secondary/30 text-center">
          <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No AI summary yet. Process with AI to generate one.</p>
        </div>
      )}
      {lead.qualificationStatus && (
        <div className="p-3 rounded-xl bg-secondary/30">
          <p className="text-xs text-muted-foreground mb-1">Qualification Status</p>
          <p className="text-sm text-foreground">{lead.qualificationStatus}</p>
        </div>
      )}
    </div>
  );
}

function AppointmentsPanel({ leadId }: { leadId: string }) {
  const { data: appointments = [] } = useQuery({
    queryKey: ['lead-appointments', leadId],
    queryFn: () => fetch(`/api/appointments/lead/${leadId}`).then(r => r.json()).then(r => r.data || []),
  });
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Appointments</h3>
      {appointments.length === 0 ? (
        <div className="p-4 text-center rounded-xl bg-secondary/30">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No appointments yet</p>
        </div>
      ) : (
        appointments.map((apt: any) => (
          <div key={apt.id} className="p-3 rounded-xl bg-secondary/30">
            <p className="text-sm font-medium text-foreground">{apt.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{apt.startTime && format(new Date(apt.startTime), 'MMM d, yyyy • h:mm a')}</p>
            <span className={cn("inline-block mt-2 text-xs px-2 py-0.5 rounded-full", apt.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground')}>
              {apt.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function ActivityPanel({ leadId }: { leadId: string }) {
  const { data: activities = [] } = useQuery({
    queryKey: ['lead-activity', leadId],
    queryFn: () => api.get('/audit/leads/' + leadId).then(r => r.data?.data || []).catch(() => []),
  });
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Activity</h3>
      {activities.length === 0 ? (
        <div className="p-4 text-center rounded-xl bg-secondary/30">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((act: any) => (
            <div key={act.id} className="flex gap-3 p-3 rounded-xl bg-secondary/30">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">{act.action || act.actionType}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{act.createdAt && formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
