'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '@/lib/api/integrations';
import { 
  Webhook, Mail, Calendar, Check, Copy, ExternalLink, 
  ShieldCheck, Send, Zap, MessageSquare, Terminal, 
  Code, RefreshCw, CheckCircle2, AlertCircle, Trash2, KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedWidgetScript, setCopiedWidgetScript] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testLeadSending, setTestLeadSending] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // WhatsApp configuration modal state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waPhoneId, setWaPhoneId] = useState('');
  const [waToken, setWaToken] = useState('');
  const [waSaving, setWaSaving] = useState(false);

  // Fetch Integrations List
  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await integrationsApi.getIntegrations();
      return Array.isArray(res) ? res : [];
    },
  });

  // Fetch Health
  const { data: health } = useQuery({
    queryKey: ['integrations-health'],
    queryFn: async () => {
      return await integrationsApi.getHealth();
    },
  });

  // Fetch dynamic Webhook URL & Slug from backend
  const { data: webhookData } = useQuery({
    queryKey: ['webhook-url'],
    queryFn: async () => {
      return await integrationsApi.getWebhookUrl();
    },
  });

  const webhookUrl = webhookData?.webhookUrl || 'http://localhost:8080/api/v1/webhooks/leads/datanex-store';
  const tenantSlug = webhookData?.tenantSlug || 'datanex-store';
  const whatsappWebhookUrl = webhookData?.whatsappWebhookUrl || `http://localhost:8080/api/v1/webhooks/whatsapp/${tenantSlug}`;
  const widgetScript = `<script src="http://localhost:8080/api/v1/webhooks/widget.js" data-tenant="${tenantSlug}" async></script>`;

  const isGmailConnected = integrations.some((i: any) => i.type === 'GMAIL' && i.isActive);
  const isCalendarConnected = integrations.some((i: any) => i.type === 'GOOGLE_CALENDAR' && i.isActive);
  const isWhatsAppConnected = integrations.some((i: any) => i.type === 'WHATSAPP' && i.isActive);

  const gmailIntegration = integrations.find((i: any) => i.type === 'GMAIL' && i.isActive);
  const calendarIntegration = integrations.find((i: any) => i.type === 'GOOGLE_CALENDAR' && i.isActive);
  const whatsAppIntegration = integrations.find((i: any) => i.type === 'WHATSAPP' && i.isActive);

  const handleConnectGoogle = async (type: 'GMAIL' | 'GOOGLE_CALENDAR') => {
    try {
      const res = await integrationsApi.getGoogleAuthUrl(type);
      if (res?.authUrl) {
        window.location.href = res.authUrl;
      }
    } catch (err: any) {
      alert('Failed to initialize Google OAuth: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    await integrationsApi.deleteIntegration(id);
    queryClient.invalidateQueries({ queryKey: ['integrations'] });
    queryClient.invalidateQueries({ queryKey: ['integrations-health'] });
  };

  const handleSaveWhatsApp = async () => {
    if (!waPhoneId || !waToken) {
      alert('Please provide Phone Number ID and Permanent Access Token');
      return;
    }
    setWaSaving(true);
    try {
      await integrationsApi.saveWhatsAppConfig(waPhoneId, waToken);
      setShowWhatsAppModal(false);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integrations-health'] });
    } catch (err: any) {
      alert('Failed to save WhatsApp config: ' + (err.response?.data?.message || err.message));
    } finally {
      setWaSaving(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'webhook') { setCopiedWebhook(true); setTimeout(() => setCopiedWebhook(false), 2000); }
    if (type === 'embed') { setCopiedEmbed(true); setTimeout(() => setCopiedEmbed(false), 2000); }
    if (type === 'widget') { setCopiedWidgetScript(true); setTimeout(() => setCopiedWidgetScript(false), 2000); }
    if (type === 'curl') { setCopiedCurl(true); setTimeout(() => setCopiedCurl(false), 2000); }
  };

  const handleSendTestLead = async () => {
    setTestLeadSending(true);
    setTestResult(null);
    try {
      const samplePayload = {
        firstName: "Test Inbound",
        lastName: "Prospect",
        email: "test.lead@example.com",
        company: "Acme Sample Corp",
        phone: "+919988776655",
        requirement: "Live integration test payload sent from dashboard integrations console.",
        estimatedBudget: 500000,
        timeline: "15 days",
      };

      const response = await axios.post(webhookUrl, samplePayload);
      setTestResult({
        success: true,
        message: "Lead captured & autonomous AI processing started!",
        leadId: response.data?.data?.leadId || "generated",
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || "Failed to trigger webhook",
      });
    } finally {
      setTestLeadSending(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-950">Real Integrations &amp; Channels</h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Production Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect Gmail, Google Calendar, Meta WhatsApp, and embeddable Web lead forms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            Connected Channels: <strong className="text-indigo-600 font-extrabold">{integrations.filter((i: any) => i.isActive).length} Active</strong>
          </span>
        </div>
      </div>

      <div className="grid gap-6">

        {/* ── 1. CHANNELS GRID (GMAIL, CALENDAR, WHATSAPP) ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Gmail */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <Mail className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
                  gmailIntegration?.status === 'RECONNECT_REQUIRED'
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : isGmailConnected
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {gmailIntegration?.status === 'RECONNECT_REQUIRED' ? "Reconnect Required" : isGmailConnected ? "Connected" : "Not Linked"}
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-950 text-sm">Gmail OAuth</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Receive customer emails, parse requirements, and send threaded AI replies via official Gmail API.
                </p>
                {gmailIntegration?.lastErrorMessage && (
                  <p className="text-[11px] text-amber-600 mt-1 font-medium">
                    ⚠️ {gmailIntegration.lastErrorMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {gmailIntegration?.status === 'RECONNECT_REQUIRED' ? (
                <button
                  onClick={() => handleConnectGoogle('GMAIL')}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Reconnect Gmail
                </button>
              ) : isGmailConnected ? (
                <button
                  onClick={() => handleDisconnect(gmailIntegration.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnectGoogle('GMAIL')}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                >
                  Connect Gmail
                </button>
              )}
            </div>
          </div>

          {/* Google Calendar */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
                  calendarIntegration?.status === 'RECONNECT_REQUIRED'
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : isCalendarConnected
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {calendarIntegration?.status === 'RECONNECT_REQUIRED' ? "Reconnect Required" : isCalendarConnected ? "Connected" : "Not Linked"}
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-950 text-sm">Google Calendar</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Live Free/Busy availability detection and Google Meet link generation for qualified prospects.
                </p>
                {calendarIntegration?.lastErrorMessage && (
                  <p className="text-[11px] text-amber-600 mt-1 font-medium">
                    ⚠️ {calendarIntegration.lastErrorMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {calendarIntegration?.status === 'RECONNECT_REQUIRED' ? (
                <button
                  onClick={() => handleConnectGoogle('GOOGLE_CALENDAR')}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Reconnect Calendar
                </button>
              ) : isCalendarConnected ? (
                <button
                  onClick={() => handleDisconnect(calendarIntegration.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnectGoogle('GOOGLE_CALENDAR')}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                >
                  Connect Calendar
                </button>
              )}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
                  isWhatsAppConnected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {isWhatsAppConnected ? "Connected" : "Not Linked"}
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-slate-950 text-sm">Meta WhatsApp Cloud</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Instant mobile qualification, score calculation, and automated drip nudges over WhatsApp.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {isWhatsAppConnected ? (
                <button
                  onClick={() => handleDisconnect(whatsAppIntegration.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect
                </button>
              ) : (
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                >
                  Configure WhatsApp
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── 2. INBOUND REST WEBHOOK CONNECTOR ──────────────────────────── */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Webhook className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-950 text-sm">Inbound Webhook API (HMAC Verified)</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  POST form submissions from WordPress, Webflow, React, Formspree, or Zapier directly to AI
                </p>
              </div>
            </div>

            <button
              onClick={handleSendTestLead}
              disabled={testLeadSending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              {testLeadSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send Test Lead Ping</span>
            </button>
          </div>

          {testResult && (
            <div className={cn(
              "p-4 rounded-2xl border text-xs font-medium flex items-start gap-3 transition-all",
              testResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
            )}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="font-bold">{testResult.message}</p>
                {testResult.leadId && (
                  <p className="text-[11px] font-mono mt-0.5 text-emerald-600">Lead ID: {testResult.leadId}</p>
                )}
              </div>
            </div>
          )}

          {/* Webhook URL Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Your Unique Webhook Endpoint URL</label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <input
                readOnly
                value={webhookUrl}
                className="flex-1 bg-transparent text-xs text-slate-900 font-mono focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. 1-CLICK EMBEDDABLE JAVASCRIPT WIDGET ──────────────────── */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">1-Click Website JavaScript Widget</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste this 1-line script tag before closing &lt;/body&gt; on any website to enable AI chat lead capture
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Script Tag Snippet</label>
              <button
                onClick={() => copyToClipboard(widgetScript, 'widget')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                {copiedWidgetScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWidgetScript ? 'Copied Snippet' : 'Copy Script Tag'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {widgetScript}
            </pre>
          </div>
        </div>

        {/* Security Isolation Banner */}
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3.5">
          <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
          <div>
            <h5 className="font-bold text-indigo-950 text-xs">Multi-Tenant Data Isolation &amp; Encryption</h5>
            <p className="text-[11px] text-indigo-700/90 mt-0.5 leading-relaxed">
              Every integration channel and webhook token is encrypted and strictly scoped to workspace (<span className="font-mono font-bold text-indigo-950">{tenantSlug}</span>).
            </p>
          </div>
        </div>

      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Configure Meta WhatsApp Cloud API</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Webhook Callback URL</label>
                <input readOnly value={whatsappWebhookUrl} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Verify Token</label>
                <input readOnly value={tenantSlug + "_whatsapp_secret"} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone Number ID</label>
                <input value={waPhoneId} onChange={e => setWaPhoneId(e.target.value)} placeholder="e.g. 104857291048571" className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Meta Permanent Access Token</label>
                <input type="password" value={waToken} onChange={e => setWaToken(e.target.value)} placeholder="EAAB..." className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowWhatsAppModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleSaveWhatsApp} disabled={waSaving} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">
                {waSaving ? 'Saving...' : 'Save & Link WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
