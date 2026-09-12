'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { conversationsApi } from '@/lib/api/conversations';
import { 
  MessageSquare, Clock, ArrowRight, Send, Bot, User, 
  Sparkles, ExternalLink, Search, RefreshCw, CheckCircle2,
  Building2, Phone, Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types/conversation.types';

export default function ConversationsPage() {
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations for tenant
  const { data: rawConvs, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res: any = await api.get('/conversations');
      return (res?.data || res || []) as any[];
    },
    refetchInterval: 15000,
  });

  const conversations = Array.isArray(rawConvs) ? rawConvs : [];

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['messages', selectedConvId],
    queryFn: async () => {
      if (!selectedConvId) return [];
      const res: any = await conversationsApi.getMessages(selectedConvId);
      return (res?.data || res || []) as Message[];
    },
    enabled: !!selectedConvId,
    refetchInterval: 10000,
  });

  // Send Human Reply Mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ content, type }: { content: string; type: string }) =>
      conversationsApi.sendMessage(selectedConvId!, content, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConvId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setReplyText('');
    },
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedConvId || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({ content: replyText.trim(), type: 'HUMAN' });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConv = conversations.find((c: any) => c.id === selectedConvId);

  const filteredConversations = conversations.filter((c: any) => {
    const name = c.leadName || '';
    const comp = c.company || '';
    const search = searchTerm.toLowerCase();
    return name.toLowerCase().includes(search) || comp.toLowerCase().includes(search);
  });

  return (
    <div className="h-[calc(100vh-64px)] flex bg-[#f8fafc] overflow-hidden">
      
      {/* ── LEFT PANE: CONVERSATION LIST ──────────────────────────── */}
      <div className="w-80 sm:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Conversations
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {conversations.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {convsLoading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading inbox...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-semibold">No conversations found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Inbound leads will appear here automatically</p>
            </div>
          ) : (
            filteredConversations.map((conv: any) => {
              const isSelected = conv.id === selectedConvId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={cn(
                    "w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer",
                    isSelected 
                      ? "bg-indigo-50/70 border-l-4 border-l-indigo-600 border-b border-b-indigo-100" 
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    {(conv.leadName?.[0] || 'L').toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={cn("text-xs font-bold truncate", isSelected ? "text-indigo-950" : "text-slate-900")}>
                        {conv.leadName || 'Inbound Lead'}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {conv.updatedAt && formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false })}
                      </span>
                    </div>

                    {conv.company && (
                      <p className="text-[11px] text-slate-500 font-medium truncate mb-1">
                        {conv.company}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-600 truncate leading-snug">
                      {conv.summary || 'Click to view message thread...'}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border",
                        conv.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      )}>
                        {conv.status}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {conv.channel || 'WEBHOOK'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* ── RIGHT PANE: ACTIVE THREAD & REPLY BOX ─────────────────── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedConv ? (
          <>
            {/* Thread Header */}
            <div className="p-4 sm:px-6 sm:py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-extrabold text-sm">
                  {(selectedConv.leadName?.[0] || 'L').toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-950">
                      {selectedConv.leadName || 'Inbound Prospect'}
                    </h2>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> AI Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedConv.company ? `${selectedConv.company} • ` : ''}Channel: {selectedConv.channel || 'Website Form'}
                  </p>
                </div>
              </div>

              {selectedConv.leadId && (
                <Link
                  href={`/leads/${selectedConv.leadId}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors"
                >
                  <span>Lead Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Message Thread Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
              {messagesLoading ? (
                <div className="py-16 text-center">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading conversation history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto">
                  <Bot className="w-8 h-8 text-indigo-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-900">No messages in thread yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">Send a message below to initiate manual contact.</p>
                </div>
              ) : (
                messages.map((m: any) => {
                  const isAI = m.type === 'AI';
                  const isHuman = m.type === 'HUMAN';
                  const isCustomer = m.type === 'CUSTOMER';

                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-3 max-w-2xl",
                        (isAI || isHuman) ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-2xs",
                        isAI ? "bg-indigo-600 text-white" :
                        isHuman ? "bg-violet-600 text-white" :
                        "bg-slate-200 text-slate-700"
                      )}>
                        {isAI ? <Bot className="w-4 h-4" /> :
                         isHuman ? <User className="w-4 h-4" /> :
                         <User className="w-4 h-4" />}
                      </div>

                      {/* Bubble */}
                      <div className={cn(
                        "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs space-y-1",
                        isAI 
                          ? "bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-tr-none" 
                          : isHuman 
                          ? "bg-violet-50 border border-violet-200 text-violet-950 rounded-tr-none"
                          : "bg-white border border-slate-200 text-slate-900 rounded-tl-none"
                      )}>
                        <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-1 mb-1.5">
                          <span className="font-extrabold text-[10px] uppercase tracking-wider opacity-75">
                            {isAI ? "🤖 AI Sales Employee (Alex)" : isHuman ? "👤 Human Representative" : "Prospect"}
                          </span>
                          <span className="text-[10px] opacity-60">
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>

                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Human Intervention Reply Box */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type a human response to prospect... (Enter to send)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sendMessageMutation.isPending}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {sendMessageMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900">Select a conversation</h3>
            <p className="text-xs text-slate-500 mt-1">Choose a thread from the left to view messages and reply</p>
          </div>
        )}
      </div>

    </div>
  );
}
