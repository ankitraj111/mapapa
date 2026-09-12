'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api/axios';
import { toast } from '@/components/ui/toast';
import { 
  Building2, Target, Users, Sliders, Link2, Zap,
  Check, ArrowRight, ArrowLeft, Mail, Calendar, Globe
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Company Basics', icon: Building2, description: 'Tell us about your company' },
  { id: 2, title: 'What You Sell', icon: Target, description: 'Your services and pricing' },
  { id: 3, title: 'Ideal Customer', icon: Users, description: 'Who you want to reach' },
  { id: 4, title: 'Qualification', icon: Sliders, description: 'What makes a good lead' },
  { id: 5, title: 'Connect Tools', icon: Link2, description: 'Gmail and Calendar' },
  { id: 6, title: 'Activate AI', icon: Zap, description: 'Launch your AI Sales Employee' },
];

interface FormData {
  companyName: string; industry: string; website: string; description: string;
  services: string; pricingRange: string; serviceDescription: string;
  idealCustomer: string; geography: string; companySize: string;
  minBudget: string; timeline: string; qualifyingQuestion: string;
  gmailConnected: boolean; calendarConnected: boolean;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isActivating, setIsActivating] = useState(false);
  const [form, setForm] = useState<FormData>({
    companyName: '', industry: '', website: '', description: '',
    services: '', pricingRange: '50000-200000', serviceDescription: '',
    idealCustomer: '', geography: 'India', companySize: 'Small businesses (1-50)',
    minBudget: '50000', timeline: '30', qualifyingQuestion: 'What is your primary business challenge?',
    gmailConnected: false, calendarConnected: false,
  });

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const activate = async () => {
    setIsActivating(true);
    try {
      await api.put('/tenants/me', {
        description: form.description,
        industry: form.industry,
        website: form.website,
      });
      if (form.services) {
        await api.post('/knowledge', { title: 'Services', content: form.services, category: 'SERVICES' });
      }
      if (form.serviceDescription) {
        await api.post('/knowledge', { title: 'About Us', content: form.serviceDescription, category: 'SERVICES' });
      }
      toast('AI Sales Employee activated! 🎉', 'success');
      router.push('/dashboard');
    } catch (err) {
      toast('Failed to activate. Please try again.', 'error');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">AI Revenue Operator</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Set up your AI Sales Employee</h1>
          <p className="text-muted-foreground mt-2">Takes about 3 minutes</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300',
                step > s.id ? 'bg-green-500 text-white' :
                step === s.id ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white ring-4 ring-indigo-500/20' :
                'bg-secondary text-muted-foreground'
              )}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-2 transition-all duration-500',
                  step > s.id ? 'bg-green-500/50' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 mb-6">
            {(() => { const StepIcon = STEPS[step-1].icon; return <StepIcon className="w-6 h-6 text-indigo-400" />; })()}
            <div>
              <h2 className="text-xl font-bold text-foreground">{STEPS[step-1].title}</h2>
              <p className="text-sm text-muted-foreground">{STEPS[step-1].description}</p>
            </div>
          </div>

          <div className="space-y-4 min-h-[280px]">
            {step === 1 && (
              <>
                <Field label="Company Name" value={form.companyName} onChange={v => set('companyName', v)} placeholder="Acme Digital Agency" />
                <Field label="Industry" value={form.industry} onChange={v => set('industry', v)} placeholder="Digital Marketing" />
                <Field label="Website" value={form.website} onChange={v => set('website', v)} placeholder="https://acme.com" />
                <TextArea label="Short Description" value={form.description} onChange={v => set('description', v)} placeholder="We help businesses grow their online presence..." rows={3} />
              </>
            )}
            {step === 2 && (
              <>
                <TextArea label="Services You Offer" value={form.services} onChange={v => set('services', v)} placeholder="Website development, SEO, Google Ads, Social Media Marketing..." rows={4} />
                <SelectField label="Typical Project Price Range" value={form.pricingRange} onChange={v => set('pricingRange', v)}
                  options={[
                    { value: '10000-50000', label: '₹10,000 – ₹50,000' },
                    { value: '50000-200000', label: '₹50,000 – ₹2,00,000' },
                    { value: '200000-500000', label: '₹2,00,000 – ₹5,00,000' },
                    { value: '500000+', label: '₹5,00,000+' },
                  ]} />
                <TextArea label="What makes your service unique?" value={form.serviceDescription} onChange={v => set('serviceDescription', v)} placeholder="We specialize in ROI-focused campaigns with proven results..." rows={3} />
              </>
            )}
            {step === 3 && (
              <>
                <TextArea label="Describe your ideal customer" value={form.idealCustomer} onChange={v => set('idealCustomer', v)} placeholder="Small to medium businesses looking to grow their online presence. They have a budget and are serious about growth..." rows={4} />
                <Field label="Primary Geography" value={form.geography} onChange={v => set('geography', v)} placeholder="India, USA, UK..." />
                <SelectField label="Target Company Size" value={form.companySize} onChange={v => set('companySize', v)}
                  options={[
                    { value: 'Solopreneurs', label: 'Solopreneurs' },
                    { value: 'Small businesses (1-50)', label: 'Small businesses (1-50 employees)' },
                    { value: 'Mid-market (50-500)', label: 'Mid-market (50-500 employees)' },
                    { value: 'Enterprise (500+)', label: 'Enterprise (500+ employees)' },
                  ]} />
              </>
            )}
            {step === 4 && (
              <>
                <Field label="Minimum Budget Threshold (₹)" value={form.minBudget} onChange={v => set('minBudget', v)} placeholder="50000" type="number" />
                <SelectField label="Desired Project Timeline" value={form.timeline} onChange={v => set('timeline', v)}
                  options={[
                    { value: '14', label: 'Within 2 weeks' },
                    { value: '30', label: 'Within 1 month' },
                    { value: '60', label: 'Within 2 months' },
                    { value: '90', label: 'Within 3 months' },
                    { value: '180', label: 'Within 6 months' },
                  ]} />
                <Field label="Most important qualifying question" value={form.qualifyingQuestion} onChange={v => set('qualifyingQuestion', v)} placeholder="What is your primary business goal?" />
              </>
            )}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Connect your tools to enable AI email and calendar features. You can skip these and connect later in Settings.</p>
                <IntegrationCard icon={Mail} title="Gmail" description="Let AI read and send emails for lead communication" color="text-red-400"
                  connected={form.gmailConnected}
                  onConnect={() => { toast('Gmail OAuth would open here. Configure in Settings after setup.', 'info'); set('gmailConnected', false); }}
                />
                <IntegrationCard icon={Calendar} title="Google Calendar" description="Let AI check availability and book meetings" color="text-blue-400"
                  connected={form.calendarConnected}
                  onConnect={() => { toast('Calendar OAuth would open here. Configure in Settings after setup.', 'info'); set('calendarConnected', false); }}
                />
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
                  💡 Your AI will still work without these — it can qualify leads and track conversations. Integrations unlock email automation and calendar booking.
                </div>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto shadow-[0_8px_32px_rgba(99,102,241,0.4)]">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Ready to activate!</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Your AI Sales Employee will start handling inbound leads, qualifying prospects, and booking meetings automatically.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  {[
                    '✓ Qualify every inbound lead',
                    '✓ Respond within seconds',
                    '✓ Follow up automatically',
                    '✓ Book meetings 24/7',
                  ].map(item => (
                    <div key={item} className="p-3 rounded-xl bg-secondary/50 text-sm text-foreground">{item}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button onClick={() => step > 1 && setStep(s => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm font-medium transition-all disabled:opacity-0">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
            {step < STEPS.length ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={activate} disabled={isActivating}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70">
                {isActivating ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Activating...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Activate AI Employee</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function IntegrationCard({ icon: Icon, title, description, color, connected, onConnect }: {
  icon: any; title: string; description: string; color: string; connected: boolean; onConnect: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {connected ? (
        <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
          <Check className="w-4 h-4" /> Connected
        </div>
      ) : (
        <button onClick={onConnect}
          className="px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-colors">
          Connect
        </button>
      )}
    </div>
  );
}
