import { apiClient } from '@/lib/api-client';
import type { DashboardStats } from '@/types/lead';

export const dashboardApi = {
  getStats(signal?: AbortSignal): Promise<DashboardStats> {
    return apiClient<DashboardStats>('/api/dashboard', { signal });
  },
};
