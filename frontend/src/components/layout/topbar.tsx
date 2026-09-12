'use client';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ai-employee': 'AI Sales Employee',
  '/leads': 'Inbound Leads',
  '/pipeline': 'Sales Pipeline',
  '/conversations': 'Conversations',
  '/appointments': 'Appointments',
  '/knowledge': 'Knowledge Base',
  '/integrations': 'Integrations',
  '/command': 'AI Command Center',
  '/tasks': 'Tasks',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export function Topbar() {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname === k || pathname.startsWith(k + '/'))?.[1] || 'AI Sales Employee';

  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex-shrink-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

    </div>
  );
}
