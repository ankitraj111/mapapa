'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { agentApi } from '@/lib/api/agent';
import {
  Terminal, Send, Zap, Check, X,
  Sparkles, RefreshCw, Bot, CheckCircle2,
  Clock, Users, Calendar, TrendingUp, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  { icon: '🎯', label: 'Hot Leads Report', cmd: 'Show me hot leads from today' },
  { icon: '📅', label: 'Meetings Booked', cmd: 'How many meetings were booked this week?' },
  { icon: '⚡', label: 'Follow-Up Queue', cmd: 'Follow up with everyone who has not replied in 3 days' },
  { icon: '📊', label: 'Daily Summary', cmd: "Generate a summary of today's activity" },
];

interface ProposedAction {
  actionType: string;
  description: string;
  estimatedCount: number;
  leadIds?: string[];
}

interface CommandResult {
  interpretation: string;
  proposedActions?: ProposedAction[];
  requiresApproval?: boolean;
  actionPlanId?: string;
}

interface HistoryItem {
  command: string;
  result: CommandResult;
  timestamp: string;
}

function renderMarkdown(text: string) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px]">$1</code>')
    .replace(/^• (.+)$/gm, '<li class="flex gap-2 items-start"><span class="text-indigo-500 mt-0.5 shrink-0">•</span><span>$1</span></li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="flex gap-2 items-start text-sm leading-relaxed">$&</li>')
    .replace(/\n/g, '<br/>');
}

export default function CommandPage() {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<CommandResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [executed, setExecuted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendCommand = useMutation({
    mutationFn: (cmd: string) => agentApi.sendCommand(cmd),
    onSuccess: (data: any) => {
      const res: CommandResult = data?.data || data;
      setResult(res);
      setExecuted(false);
      setHistory(prev => [
        { command, result: res, timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
        ...prev.slice(0, 9)
      ]);
    },
  });

  const executePlan = useMutation({
    mutationFn: () => agentApi.executeActionPlan(result!.actionPlanId!),
    onSuccess: () => setExecuted(true),
  });

  const submit = () => {
    if (!command.trim() || sendCommand.isPending) return;
    sendCommand.mutate(command.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-950">AI Command Center</h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct your autonomous AI Sales Employee with natural language
            </p>
          </div>
        </div>

        {/* ── SUGGESTION CHIPS ───────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s.cmd}
              onClick={() => { setCommand(s.cmd); inputRef.current?.focus(); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-all cursor-pointer shadow-xs"
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── COMMAND INPUT ──────────────────────────────────────── */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 focus-within:border-indigo-400 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <textarea
              ref={inputRef}
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="e.g. 'Show me hot leads from today', 'Generate daily pipeline summary', 'Follow up with leads who haven't replied in 3 days'..."
              className="flex-1 resize-none text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600">Enter</kbd>
              <span>to send, </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600">Shift+Enter</kbd>
              <span>for new line</span>
            </div>
            <button
              onClick={submit}
              disabled={!command.trim() || sendCommand.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {sendCommand.isPending
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Running...</span></>
                : <><Send className="w-3.5 h-3.5" /><span>Execute</span></>
              }
            </button>
          </div>
        </div>

        {/* ── RESULT PANEL ───────────────────────────────────────── */}
        {sendCommand.isPending && (
          <div className="p-6 rounded-3xl bg-white border border-indigo-200 shadow-xs animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        )}

        {result && !sendCommand.isPending && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">

            {/* AI Response */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div
                className="flex-1 text-sm text-slate-800 leading-relaxed space-y-1"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(result.interpretation) }}
              />
            </div>

            {/* Proposed Actions */}
            {result.proposedActions && result.proposedActions.length > 0 && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Proposed Actions ({result.proposedActions.length})
                </p>
                {result.proposedActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-extrabold">
                        {action.estimatedCount}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-indigo-950">
                          {action.actionType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[11px] text-indigo-700 mt-0.5">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                  </div>
                ))}

                {/* Approval Buttons */}
                {result.requiresApproval && !executed && (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => executePlan.mutate()}
                      disabled={executePlan.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                    >
                      {executePlan.isPending
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        : <Check className="w-3.5 h-3.5" />
                      }
                      <span>Approve &amp; Execute</span>
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                )}

                {executed && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Action plan executed successfully! Monitoring results...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── COMMAND HISTORY ────────────────────────────────────── */}
        {history.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Recent Commands
            </p>
            <div className="space-y-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setCommand(item.command); setResult(item.result); setExecuted(false); inputRef.current?.focus(); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 truncate">{item.command}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
