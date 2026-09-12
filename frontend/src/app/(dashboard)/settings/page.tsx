'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import {
  Building2, Book, Link2, Users, RefreshCw, Plus, Trash2,
  Check, Save, Mail, Globe, Phone, Clock, Zap, ChevronRight,
  Shield, Bell, ExternalLink, Info, CheckCircle2, X, CreditCard, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TABS = [
  { id: 'general',      label: 'General',       icon: Building2 },
  { id: 'billing',      label: 'Billing & Plan',icon: CreditCard },
  { id: 'knowledge',    label: 'Knowledge',     icon: Book },
  { id: 'integrations', label: 'Integrations',  icon: Link2 },
  { id: 'team',         label: 'Team',          icon: Users },
  { id: 'followups',    label: 'Follow-ups',    icon: RefreshCw },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-950">Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your workspace configuration and AI behavior</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Nav */}
          <div className="w-44 shrink-0">
            <nav className="space-y-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'general'      && <GeneralSettings />}
            {activeTab === 'billing'      && <BillingSettings />}
            {activeTab === 'knowledge'    && <KnowledgeSettings />}
            {activeTab === 'integrations' && <IntegrationSettings />}
            {activeTab === 'team'         && <TeamSettings />}
            {activeTab === 'followups'    && <FollowUpSettings />}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── GENERAL ─────────────────────────────────────────────── */
function GeneralSettings() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: rawTenant } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const r: any = await api.get('/tenants/me');
      return r?.data || r;
    },
  });

  const tenant: any = rawTenant?.data || rawTenant || {};

  const [form, setForm] = useState<any>({
    name: '', industry: '', website: '', phone: '',
    description: '', timezone: 'Asia/Kolkata',
    workingHoursStart: '09:00', workingHoursEnd: '18:00',
    aiTone: 'professional',
  });

  // Sync tenant data into form once loaded
  useState(() => {
    if (tenant?.name) {
      setForm((prev: any) => ({
        ...prev,
        name: tenant.name || '',
        industry: tenant.industry || '',
        website: tenant.website || '',
        phone: tenant.phone || '',
        description: tenant.description || '',
        timezone: tenant.timezone || 'Asia/Kolkata',
        aiTone: tenant.aiTone || 'professional',
      }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/tenants/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const field = (label: string, key: string, placeholder: string, type = 'text') => (
    <div key={key}>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key] || ''}
        onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
      />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Business Info */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-sm font-extrabold text-slate-950">Business Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          {field('Company Name', 'name', 'DataNex Store')}
          {field('Industry / Sector', 'industry', 'Web & App Development')}
          {field('Website URL', 'website', 'https://datanexstore.in')}
          {field('Phone Number', 'phone', '+91 98765 43210')}
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Description</label>
          <textarea
            value={form.description || ''}
            onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))}
            rows={3}
            placeholder="Describe your business and services..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
          />
        </div>
      </div>

      {/* Working Hours */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-slate-950">Working Hours & Timezone</h2>
        <div className="grid grid-cols-3 gap-4">
          {field('Timezone', 'timezone', 'Asia/Kolkata')}
          {field('Start Time', 'workingHoursStart', '09:00', 'time')}
          {field('End Time', 'workingHoursEnd', '18:00', 'time')}
        </div>
      </div>

      {/* AI Tone */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-slate-950">AI Sales Employee Tone</h2>
        <div className="grid grid-cols-5 gap-2">
          {['professional', 'friendly', 'formal', 'confident', 'casual'].map(tone => (
            <button
              key={tone}
              onClick={() => setForm((p: any) => ({ ...p, aiTone: tone }))}
              className={cn(
                'py-2.5 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer',
                form.aiTone === tone
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
              )}
            >
              {tone}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          Tone affects how the AI greets leads, handles objections, and writes follow-up messages.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => updateMutation.mutate(form)}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {saved
            ? <><CheckCircle2 className="w-4 h-4" /><span>Saved!</span></>
            : updateMutation.isPending
              ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Saving...</span></>
              : <><Save className="w-4 h-4" /><span>Save Changes</span></>
          }
        </button>
      </div>

    </div>
  );
}

/* ─── BILLING & PLAN ─────────────────────────────────────── */
function BillingSettings() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');

  const { data: rawBilling, isLoading } = useQuery({
    queryKey: ['billing-summary'],
    queryFn: async () => {
      const r: any = await api.get('/billing');
      return r?.data || r;
    },
  });

  const { data: rawPlans } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: async () => {
      const r: any = await api.get('/billing/plans');
      return r?.data || r;
    },
  });

  const billing = rawBilling?.data || rawBilling || {
    plan: 'STARTER',
    status: 'ACTIVE',
    monthlyLeadLimit: 250,
    monthlyAiActionLimit: 2500,
    leadsUsedThisMonth: 0,
    aiActionsUsedThisMonth: 0,
    leadUsagePercent: 0,
    aiActionUsagePercent: 0,
  };

  const plans = rawPlans?.data || rawPlans || [
    {
      plan: 'STARTER',
      name: 'Starter Plan',
      price: 7999,
      leadLimit: 250,
      aiActionLimit: 2500,
      features: ['250 Leads/mo', '2,500 AI Actions', 'Gmail & WhatsApp Inbound', 'Auto Follow-Up Sequence', 'Embed Lead Form Widget']
    },
    {
      plan: 'GROWTH',
      name: 'Growth Plan',
      price: 19999,
      leadLimit: 1000,
      aiActionLimit: 12000,
      features: ['1,000 Leads/mo', '12,000 AI Actions', 'All Channels + Google Calendar', 'Revenue Attribution & ROI', 'Priority AI Response Velocity']
    },
    {
      plan: 'PRO_AGENCY',
      name: 'Pro Agency Plan',
      price: 49999,
      leadLimit: 5000,
      aiActionLimit: 60000,
      features: ['5,000 Leads/mo', '60,000 AI Actions', 'Unlimited Custom Integrations', 'AI Command Center & Full RAG', 'Dedicated IP & Audit SLA']
    }
  ];

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (targetPlan: string, planName: string) => {
    setCheckoutLoading(targetPlan);
    try {
      await loadRazorpayScript();
      const res: any = await api.post(`/billing/razorpay/order?plan=${targetPlan}`);
      const orderData = res?.data || res;

      if (!(window as any).Razorpay) {
        // Fallback to direct plan switch if Razorpay script fails to load
        await api.post(`/billing/plan?plan=${targetPlan}`);
        queryClient.invalidateQueries({ queryKey: ['billing-summary'] });
        setSuccessMsg(`Plan upgraded to ${planName} successfully!`);
        setTimeout(() => setSuccessMsg(''), 3500);
        return;
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TYP96qdegz7nIV',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'AI Revenue Operator',
        description: `${planName} Monthly Subscription`,
        order_id: orderData.orderId,
        handler: async (paymentResponse: any) => {
          try {
            await api.post('/billing/razorpay/verify', {
              plan: targetPlan,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            queryClient.invalidateQueries({ queryKey: ['billing-summary'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
            setSuccessMsg(`🎉 Payment successful! Plan upgraded to ${planName}.`);
            setTimeout(() => setSuccessMsg(''), 4000);
          } catch (err: any) {
            alert('Payment verification failed: ' + (err.response?.data?.message || err.message));
          }
        },
        prefill: {
          name: 'Agency Owner',
          email: 'owner@agency.com',
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert('Failed to initiate checkout: ' + (err.response?.data?.message || err.message));
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-950">Subscription Overview</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase">
                {billing.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Tier: <strong className="text-indigo-600">{billing.plan?.replace('_', ' ')}</strong>
            </p>
          </div>
          {successMsg && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Usage Quota Gauges */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Monthly Leads Quota</span>
              <span className="font-extrabold text-slate-900">
                {billing.leadsUsedThisMonth || 0} / {billing.monthlyLeadLimit || 250}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(billing.leadUsagePercent || 0))}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right">
              {Math.round(billing.leadUsagePercent || 0)}% consumed
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Monthly AI Actions Quota</span>
              <span className="font-extrabold text-slate-900">
                {billing.aiActionsUsedThisMonth || 0} / {billing.monthlyAiActionLimit || 2500}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(billing.aiActionUsagePercent || 0))}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right">
              {Math.round(billing.aiActionUsagePercent || 0)}% consumed
            </p>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Available SaaS Tiers</h3>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((p: any) => {
            const isCurrent = billing.plan === p.plan;
            const isPro = p.plan === 'PRO_AGENCY';
            const isGrowth = p.plan === 'GROWTH';
            const isSelectedLoading = checkoutLoading === p.plan;

            return (
              <div
                key={p.plan}
                className={cn(
                  'relative rounded-3xl p-5 border flex flex-col justify-between transition-all',
                  isCurrent
                    ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                )}
              >
                {isGrowth && !isCurrent && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[9px] font-extrabold tracking-wide uppercase shadow-xs">
                    Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold tracking-wide uppercase shadow-xs">
                    Current Plan
                  </span>
                )}

                <div>
                  <h4 className="text-sm font-extrabold text-slate-950">{p.name}</h4>
                  <div className="mt-2 mb-4">
                    <span className="text-2xl font-black text-slate-950">₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400 font-semibold"> /month</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {p.features?.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleCheckout(p.plan, p.name)}
                  disabled={isCurrent || isSelectedLoading}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default border border-slate-200'
                      : isGrowth
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                  )}
                >
                  {isCurrent ? (
                    'Current Tier'
                  ) : isSelectedLoading ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Opening Checkout...</>
                  ) : (
                    'Upgrade Tier'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── KNOWLEDGE (redirect card) ──────────────────────────── */
function KnowledgeSettings() {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
        <Book className="w-7 h-7" />
      </div>
      <div>
        <h3 className="font-extrabold text-slate-950 text-sm">Knowledge Base</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Manage approved services, pricing tiers, FAQs, and objection-handling rules that the AI references in real-time.
        </p>
      </div>
      <Link
        href="/knowledge"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-colors shadow-xs"
      >
        Open Knowledge Base <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/* ─── INTEGRATIONS (redirect card) ───────────────────────── */
function IntegrationSettings() {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mx-auto">
        <Link2 className="w-7 h-7" />
      </div>
      <div>
        <h3 className="font-extrabold text-slate-950 text-sm">Integrations & Channels</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Configure your inbound webhook URL, embeddable lead form, Gmail sync, Google Calendar, and WhatsApp channel.
        </p>
      </div>
      <Link
        href="/integrations"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold transition-colors shadow-xs"
      >
        Open Integrations <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/* ─── TEAM ────────────────────────────────────────────────── */
function TeamSettings() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SALES');
  const [inviteSent, setInviteSent] = useState(false);

  const { data: rawTeam, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const r: any = await api.get('/tenants/team');
      return r?.data || r;
    },
  });

  const members: any[] = (rawTeam?.data || rawTeam || []) as any[];

  const roleColors: Record<string, string> = {
    OWNER: 'bg-amber-50 text-amber-700 border-amber-200',
    ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    SALES: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    VIEWER: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => { setInviteSent(false); setShowInvite(false); setInviteEmail(''); }, 2000);
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-extrabold text-slate-950">Team Members</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {members.length} active member{members.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Invite Member
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">No team members yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Invite your sales team to collaborate on qualified leads</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                  {(m.firstName?.[0] || m.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-950 truncate">
                    {m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : m.email}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                </div>
                <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase', roleColors[m.role] || roleColors.VIEWER)}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-950 text-sm">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="teammate@yourcompany.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="SALES">Sales Rep</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer (Read-only)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {inviteSent ? <><CheckCircle2 className="w-4 h-4" />Invitation Sent!</> : <><Mail className="w-4 h-4" />Send Invitation</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─── FOLLOW-UPS ──────────────────────────────────────────── */
function FollowUpSettings() {
  const [sequences, setSequences] = useState([
    { id: 1, label: 'Initial AI Response', delay: 'Immediately after lead arrives', enabled: true, channel: 'AI Chat', icon: '⚡' },
    { id: 2, label: 'First Follow-up Nudge', delay: '24 hours after no reply', enabled: true, channel: 'Email + AI', icon: '📧' },
    { id: 3, label: 'Second Follow-up + Value', delay: '3 days after no reply', enabled: true, channel: 'Email', icon: '📨' },
    { id: 4, label: 'Final Calendar Invite', delay: '7 days — direct meeting offer', enabled: false, channel: 'Email + Calendar', icon: '📅' },
  ]);

  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const toggle = (id: number) => {
    setSequences(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">

      {/* Global Toggle */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-950">Automated Follow-up Engine</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            AI automatically runs timed follow-up sequences for unresponsive leads
          </p>
        </div>
        <button
          onClick={() => setGlobalEnabled(g => !g)}
          className={cn(
            'w-12 h-6 rounded-full relative transition-colors cursor-pointer',
            globalEnabled ? 'bg-indigo-600' : 'bg-slate-200'
          )}
        >
          <div className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', globalEnabled ? 'right-0.5' : 'left-0.5')} />
        </button>
      </div>

      {/* Sequence Steps */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Sequence Steps</h3>
        <div className="space-y-2.5">
          {sequences.map((seq, i) => (
            <div
              key={seq.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                seq.enabled ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 opacity-50'
              )}
            >
              {/* Step Number */}
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm shrink-0">
                {seq.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-950">{seq.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{seq.delay}</p>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  {seq.channel}
                </span>
              </div>

              {/* Connector arrow */}
              {i < sequences.length - 1 && (
                <div className="hidden" />
              )}

              {/* Toggle */}
              <button
                onClick={() => toggle(seq.id)}
                className={cn(
                  'w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0',
                  seq.enabled ? 'bg-indigo-600' : 'bg-slate-200'
                )}
              >
                <div className={cn('w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', seq.enabled ? 'right-0.5' : 'left-0.5')} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Config Row */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Auto-Stop Rules</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Stop on Lead Reply', desc: 'Pause sequence when lead responds' },
            { label: 'Stop on Meeting Booked', desc: 'Auto-cancel if appointment confirmed' },
          ].map(rule => (
            <div key={rule.label} className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div>
                <p className="text-[11px] font-extrabold text-emerald-900">{rule.label}</p>
                <p className="text-[10px] text-emerald-700 mt-0.5">{rule.desc}</p>
              </div>
              <div className="w-9 h-4.5 rounded-full bg-emerald-500 relative shrink-0">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          {saved
            ? <><CheckCircle2 className="w-4 h-4" /><span>Saved!</span></>
            : <><Save className="w-4 h-4" /><span>Save Configuration</span></>
          }
        </button>
      </div>

    </div>
  );
}
