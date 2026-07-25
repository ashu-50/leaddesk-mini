'use client';

import { useMutation } from '@tanstack/react-query';
import { leadsApi } from '../api/leads.api';
import type { CreateLeadInput } from '../schemas/lead.schema';

/** Public form submission — no cache to update, the visitor sees no list. */
export function useCreateLead() {
  return useMutation({
    mutationFn: (input: CreateLeadInput) => leadsApi.create(input),
  });
}
