"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Zap, Users, KanbanSquare, MessageSquare, 
  Calendar, BookOpen, Webhook, Terminal, Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Sales Employee', href: '/ai-employee', icon: Zap, badge: 'Active' },
    { label: 'Leads', href: '/leads', icon: Users },
    { label: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
    { label: 'Conversations', href: '/conversations', icon: MessageSquare },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
    { label: 'Integrations', href: '/integrations', icon: Webhook },
    { label: 'AI Command', href: '/command', icon: Terminal },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm">
      {/* Brand Header — Uploaded Logo */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
        <img
          src="/images/op-logo-arc.png"
          alt="Operator"
          className="h-7 w-7 object-contain shrink-0"
        />
        <span className="text-[17px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
          operator<span className="text-[#e8572a]">.</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              )}>
              <div className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                {item.label}
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user?.firstName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-xs truncate">{user?.firstName || 'Admin'} {user?.lastName || 'User'}</p>
            <button className="text-slate-400 hover:text-rose-600 text-[11px] font-medium transition-colors" onClick={() => useAuthStore.getState().clearAuth()}>Log out</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
