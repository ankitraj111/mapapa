'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { CheckSquare, Square, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  URGENT: { label: 'Urgent', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  HIGH: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  MEDIUM: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  LOW: { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

export default function TasksPage() {
  const [filter, setFilter] = useState<'OPEN' | 'COMPLETED'>('OPEN');
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => tasksApi.getTasks(filter),
  });

  const completeTask = useMutation({
    mutationFn: tasksApi.completeTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const grouped = tasks.reduce((acc: Record<string, any[]>, task: any) => {
    const p = task.priority || 'MEDIUM';
    acc[p] = [...(acc[p] || []), task];
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">Human action items escalated by your AI Sales Employee</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6 border border-slate-200">
        {(['OPEN', 'COMPLETED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
              filter === f ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
            )}>
            {f === 'OPEN' ? 'Open' : 'Completed'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">All caught up!</h3>
          <p className="text-slate-500 text-sm">Tasks requiring salesperson attention will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(priority => {
            const items = grouped[priority];
            if (!items?.length) return null;
            const cfg = priorityConfig[priority];
            return (
              <div key={priority}>
                <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <span className={cfg.color}>{cfg.label} Priority</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-bold">{items.length}</span>
                </h2>
                <div className="space-y-2">
                  {items.map((task: any) => (
                    <div key={task.id} className={cn(
                      'flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all',
                      task.status === 'COMPLETED' && 'opacity-60 bg-slate-50'
                    )}>
                      <button onClick={() => task.status !== 'COMPLETED' && completeTask.mutate(task.id)}
                        className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-600 transition-colors">
                        {task.status === 'COMPLETED'
                          ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                          : <Square className="w-5 h-5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-bold text-slate-900', task.status === 'COMPLETED' && 'line-through text-slate-400')}>
                          {task.title}
                        </p>
                        {task.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>}
                        <div className="flex items-center gap-3 mt-2 pt-1 border-t border-slate-100">
                          {task.dueAt && (
                            <span className={cn('flex items-center gap-1 text-xs font-medium', new Date(task.dueAt) < new Date() ? 'text-rose-600' : 'text-slate-500')}>
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(task.dueAt), 'MMM d')}
                            </span>
                          )}
                          {task.type && <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium">{task.type}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
