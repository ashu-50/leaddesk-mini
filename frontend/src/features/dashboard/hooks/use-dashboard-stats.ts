'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardKeys } from '@/features/leads/query-keys';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: ({ signal }) => dashboardApi.getStats(signal),
  });
}
