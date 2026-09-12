'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

// Simple global event bus
const subscribers = new Set<(t: ToastItem[]) => void>();
let toastList: ToastItem[] = [];

function emit() {
  subscribers.forEach(fn => fn([...toastList]));
}

export function toast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).slice(2);
  toastList = [...toastList, { id, type, message }];
  emit();
  setTimeout(() => {
    toastList = toastList.filter(t => t.id !== id);
    emit();
  }, 4000);
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  info: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    subscribers.add(setToasts);
    return () => { subscribers.delete(setToasts); };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg pointer-events-auto min-w-[280px] max-w-sm',
            colors[t.type]
          )}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium text-foreground flex-1">{t.message}</p>
            <button onClick={() => { toastList = toastList.filter(x => x.id !== t.id); emit(); }}>
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
