'use client';
import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export function toast(message: string, type: ToastType = 'info') {
  const id = Date.now().toString();
  toasts = [...toasts, { id, type, message }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, 4000);
}

export function useToast() {
  const [currentToasts, setToasts] = useState<Toast[]>([]);
  
  useCallback(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter(l => l !== setToasts); };
  }, [])();

  return { toasts: currentToasts, toast };
}
