'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/leads';
import { LeadFilters, LeadStatus } from '../types/lead.types';

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsApi.getLeads(filters),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getLead(id),
    enabled: !!id,
  });
}

export function usePipeline() {
  return useQuery({
    queryKey: ['pipeline'],
    queryFn: () => leadsApi.getPipeline(),
  });
}

export function useLeadMutations() {
  const queryClient = useQueryClient();
  
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['pipeline'] });
  };

  const createLead = useMutation({
    mutationFn: leadsApi.createLead,
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateLeadStatus(id, status),
    onSuccess: invalidate,
  });

  const processWithAI = useMutation({
    mutationFn: leadsApi.processWithAI,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });

  return { createLead, updateStatus, processWithAI };
}
