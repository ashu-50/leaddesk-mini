import type { ListLeadsParams } from './api/leads.api';

/**
 * Hierarchical cache keys: invalidating `leadKeys.lists()` refreshes every
 * page and filter combination without touching unrelated queries.
 */
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: ListLeadsParams) => [...leadKeys.lists(), params] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};
