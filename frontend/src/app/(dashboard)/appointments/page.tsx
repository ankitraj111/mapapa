'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';
import { leadsApi } from '@/lib/api/leads';
import { 
  Calendar as CalendarIcon, Clock, Video, User, Plus, 
  CheckCircle2, XCircle, AlertCircle, X, ExternalLink,
  ChevronRight, Sparkles, Building2, Phone
} from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  
  // Form State for Booking
  const [formData, setFormData] = useState({
    leadId: '',
    title: 'Product Demo & Strategy Consultation',
    description: '30-minute discovery call to review requirements and custom pricing tier.',
    startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow same time
    endTime: new Date(Date.now() + 86400000 + 1800000).toISOString().slice(0, 16), // +30m
    meetingLink: 'https://meet.google.com/new',
    timezone: 'Asia/Kolkata',
  });

  // Fetch Appointments
  const { data: rawAppointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res: any = await appointmentsApi.getAppointments();
      return (res?.data || res || []) as any[];
    },
  });

  const appointments = Array.isArray(rawAppointments) ? rawAppointments : [];

  // Fetch Leads for Dropdown Selection
  const { data: leadsData } = useQuery({
    queryKey: ['leads-dropdown'],
    queryFn: () => leadsApi.getLeads(),
  });
  const leads = (leadsData as any)?.content || (leadsData as any)?.data || (Array.isArray(leadsData) ? leadsData : []);

  // Create Appointment Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => appointmentsApi.createAppointment({
      ...data,
      startTime: data.startTime ? `${data.startTime}:00` : undefined,
      endTime: data.endTime ? `${data.endTime}:00` : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowModal(false);
    },
  });

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const filteredAppointments = appointments.filter((a: any) => {
    if (filterTab === 'UPCOMING') {
      return a.startTime && isFuture(new Date(a.startTime));
    }
    if (filterTab === 'PAST') {
      return a.startTime && isPast(new Date(a.startTime));
    }
    return true;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950">Appointments &amp; Meetings</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated calendar scheduling synced with Google Calendar &amp; AI qualification
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (leads.length > 0 && !formData.leadId) {
              setFormData(f => ({ ...f, leadId: leads[0].id }));
            }
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Meeting</span>
        </button>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          {(['ALL', 'UPCOMING', 'PAST'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                filterTab === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              {tab === 'ALL' ? 'All Meetings' : tab === 'UPCOMING' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filteredAppointments.length} meeting(s)
        </span>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mx-auto">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No appointments in this view</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              When the AI Sales Employee qualifies an inbound lead or when you schedule a call manually, meetings appear here.
            </p>
          </div>
          <button
            onClick={() => {
              if (leads.length > 0 && !formData.leadId) {
                setFormData(f => ({ ...f, leadId: leads[0].id }));
              }
              setShowModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule Test Meeting
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt: any) => (
            <AppointmentCard 
              key={apt.id} 
              appointment={apt} 
              onStatusChange={(status) => statusMutation.mutate({ id: apt.id, status })}
            />
          ))}
        </div>
      )}

      {/* ── BOOK MEETING MODAL ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-950 text-base">Schedule New Appointment</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Select Lead */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Prospect / Lead *</label>
                <select
                  value={formData.leadId}
                  onChange={e => setFormData({ ...formData, leadId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="">-- Choose a lead --</option>
                  {leads.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.firstName} {l.lastName} {l.company ? `(${l.company})` : ''} - Score: {l.score}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Meeting Title *</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Strategy Discovery & Demo Call"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Google Meet / Zoom URL</label>
                <input
                  value={formData.meetingLink}
                  onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abc-def"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Agenda &amp; Notes</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Meeting agenda..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
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
                disabled={!formData.leadId || !formData.title || !formData.startTime || createMutation.isPending}
                onClick={() => createMutation.mutate(formData)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {createMutation.isPending ? 'Scheduling...' : 'Confirm Appointment'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function AppointmentCard({ 
  appointment: apt,
  onStatusChange 
}: { 
  appointment: any;
  onStatusChange: (status: string) => void;
}) {
  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const parsedDate = apt.startTime ? new Date(apt.startTime) : null;
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all shadow-xs">
      
      {/* Date badge */}
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
        <span className="text-[10px] text-indigo-600 font-extrabold uppercase">
          {isValidDate ? format(parsedDate, 'MMM') : 'APT'}
        </span>
        <span className="text-lg font-extrabold text-indigo-950 leading-tight">
          {isValidDate ? format(parsedDate, 'd') : '—'}
        </span>
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-950 text-sm truncate">
            {apt.title || 'Sales Discovery Meeting'}
          </h3>
          <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-full border', statusColors[apt.status] || statusColors.PENDING)}>
            {apt.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {isValidDate && (
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {format(parsedDate, 'EEEE, h:mm a')}
            </span>
          )}

          {apt.leadId && (
            <Link 
              href={`/leads/${apt.leadId}`}
              className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              <span>View Lead Details &rarr;</span>
            </Link>
          )}
        </div>

        {apt.description && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{apt.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
        {apt.meetingLink && (
          <a
            href={apt.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Join Meeting</span>
          </a>
        )}

        {apt.status !== 'COMPLETED' && (
          <button
            onClick={() => onStatusChange('COMPLETED')}
            className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs font-semibold transition-all"
            title="Mark as Completed"
          >
            Done
          </button>
        )}
      </div>

    </div>
  );
}
