import { api } from './axios';

export const agentApi = {
  sendCommand: (command: string) => api.post('/agents/command', { command }).then((r: any) => r?.data || r),
  executeActionPlan: (actionPlanId: string) => api.post('/agents/command/execute', { actionPlanId }).then((r: any) => r?.data || r),
};
