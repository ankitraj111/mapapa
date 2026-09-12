import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(target);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-red-600 bg-red-100 border-red-200';
  if (score >= 60) return 'text-amber-600 bg-amber-100 border-amber-200';
  return 'text-gray-600 bg-gray-100 border-gray-200';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'HOT': return 'bg-red-100 text-red-800 border-red-200';
    case 'WARM': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'QUALIFIED': return 'bg-green-100 text-green-800 border-green-200';
    case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'MEETING_BOOKED': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'WON': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'LOST': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
