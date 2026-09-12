'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '@/lib/api/knowledge';
import { 
  BookOpen, Plus, Trash2, Search, Sparkles, 
  X, Check, HelpCircle, DollarSign, Briefcase, 
  ShieldAlert, FileText, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Documents', icon: BookOpen },
  { id: 'SERVICES', label: 'Services & Scope', icon: Briefcase },
  { id: 'PRICING', label: 'Pricing & Retainers', icon: DollarSign },
  { id: 'FAQ', label: 'FAQs', icon: HelpCircle },
  { id: 'QUALIFICATION', label: 'Qualification Rules', icon: CheckCircle2 },
  { id: 'OBJECTION_HANDLING', label: 'Objection Handling', icon: ShieldAlert },
  { id: 'POLICY', label: 'Policies & SLA', icon: FileText },
];

export default function KnowledgePage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'SERVICES',
    content: '',
  });

  const { data: rawDocs = [], isLoading } = useQuery<KnowledgeDoc[]>({
    queryKey: ['knowledge'],
    queryFn: async () => {
      const res: any = await knowledgeApi.getDocuments();
      return (res?.data || res || []) as KnowledgeDoc[];
    },
  });

  const docs = Array.isArray(rawDocs) ? rawDocs : [];

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => knowledgeApi.createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      setShowModal(false);
      setForm({ title: '', category: 'SERVICES', content: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });

  const filteredDocs = docs.filter(d => {
    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesSearch = !search.trim() || 
      d.title.toLowerCase().includes(search.toLowerCase()) || 
      d.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const CATEGORY_COLORS: Record<string, string> = {
    SERVICES: 'bg-blue-50 text-blue-700 border-blue-200',
    PRICING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAQ: 'bg-violet-50 text-violet-700 border-violet-200',
    POLICY: 'bg-amber-50 text-amber-700 border-amber-200',
    QUALIFICATION: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    OBJECTION_HANDLING: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-950">Business Knowledge Base</h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  AI Grounding Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official documents, packages, and pricing rules referenced by your AI Sales Employee
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search knowledge documents by keyword, pricing, or objection handling..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Document Feed */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading knowledge base...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No knowledge documents found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Add your approved services, pricing structures, and FAQ answers to ground your AI sales assistant.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={cn('text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider', CATEGORY_COLORS[doc.category] || 'bg-slate-100 text-slate-600 border-slate-200')}>
                    {doc.category.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(doc.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-extrabold text-slate-950 text-sm leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {doc.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active in AI Prompts
                </span>
                <span>Grounding Doc</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD DOCUMENT MODAL ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-950 text-base">Add Business Knowledge</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Standard Website Pricing & Sprints"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {CATEGORIES.filter(c => c.id !== 'ALL').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Content &amp; Rules *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  placeholder="Enter the exact approved business facts, pricing ranges, scope limitations, or objection handling rules the AI Sales Employee should use when speaking with leads..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!form.title.trim() || !form.content.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate(form)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {createMutation.isPending ? 'Saving...' : 'Publish to AI'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
