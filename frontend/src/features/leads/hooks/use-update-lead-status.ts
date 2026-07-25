'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-error';
import { LEAD_STATUS_META } from '@/lib/constants';
import type { PaginatedData } from '@/types/api';
import type { Lead, LeadStatus } from '@/types/lead';
import { leadsApi } from '../api/leads.api';
import { dashboardKeys, leadKeys } from '../query-keys';

interface UpdateStatusVariables {
  id: string;
  status: LeadStatus;
  /** Used only for the confirmation message. */
  name: string;
}

/**
 * Moves a lead along the pipeline.
 *
 * The table is updated before the request leaves the browser, which is what
 * makes the change feel instant. If the API refuses, every cached page is put
 * back exactly as it was and the person is told why — an optimistic update
 * that cannot roll back is just a lie.
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: UpdateStatusVariables) => leadsApi.updateStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: leadKeys.lists() });

      const snapshot = queryClient.getQueriesData<PaginatedData<Lead>>({
        queryKey: leadKeys.lists(),
      });

      queryClient.setQueriesData<PaginatedData<Lead>>({ queryKey: leadKeys.lists() }, (current) =>
        current
          ? {
              ...current,
              items: current.items.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
            }
          : current,
      );

      return { snapshot };
    },

    onSuccess: (_lead, variables) => {
      toast.success(`${variables.name} moved to ${LEAD_STATUS_META[variables.status].label}`);
    },

    onError: (error, _variables, context) => {
      for (const [queryKey, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(queryKey, data);
      }

      const message =
        error instanceof ApiError ? error.displayMessage : 'The status could not be updated';
      toast.error(message);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
  });
}
