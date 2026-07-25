import { apiClient } from '@/lib/api-client';
import type { PaginatedData } from '@/types/api';
import type { Lead, LeadStatus } from '@/types/lead';
import type { CreateLeadInput } from '../schemas/lead.schema';

export interface ListLeadsParams {
  page: number;
  limit: number;
  search?: string;
  status?: LeadStatus;
}

/**
 * Every lead request the browser can make, in one typed object.
 * Components call hooks; hooks call this; nothing else touches `fetch`.
 */
export const leadsApi = {
  create(input: CreateLeadInput): Promise<Lead> {
    return apiClient<Lead>('/api/leads', { method: 'POST', body: input });
  },

  list(params: ListLeadsParams, signal?: AbortSignal): Promise<PaginatedData<Lead>> {
    return apiClient<PaginatedData<Lead>>('/api/leads', {
      searchParams: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status,
      },
      signal,
    });
  },

  updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return apiClient<Lead>(`/api/leads/${id}/status`, { method: 'PATCH', body: { status } });
  },
};
