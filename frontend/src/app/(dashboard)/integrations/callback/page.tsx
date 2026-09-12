'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { integrationsApi } from '@/lib/api/integrations';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setStatus('error');
      setErrorMsg('Missing authorization code from Google OAuth.');
      return;
    }

    const type = (state && state.includes('CALENDAR')) ? 'GOOGLE_CALENDAR' : 'GMAIL';
    const redirectUri = window.location.origin + '/integrations/callback';

    integrationsApi.handleGoogleCallback(code, type, redirectUri)
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/integrations'), 1500);
      })
      .catch((err: any) => {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to link Google account.');
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-center space-y-4">
        {status === 'loading' && (
          <>
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Connecting Google Integration...</h2>
            <p className="text-xs text-slate-500">Securing tokens and linking your workspace account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Integration Connected!</h2>
            <p className="text-xs text-slate-500">Redirecting back to Integrations dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Connection Failed</h2>
            <p className="text-xs text-rose-600">{errorMsg}</p>
            <button
              onClick={() => router.push('/integrations')}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Back to Integrations
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsCallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading OAuth status...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
