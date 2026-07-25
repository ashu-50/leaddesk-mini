'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leadsApi } from '../api/leads.api';
import type { ListLeadsParams } from '../api/leads.api';
import { leadKeys } from '../query-keys';

/**
 * `keepPreviousData` holds the current page on screen while the next one
 * loads, so paging and searching never collapse the table to a skeleton.
 */
export function useLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: ({ signal }) => leadsApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}
