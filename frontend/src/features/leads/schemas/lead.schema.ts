import { z } from 'zod';
import { BUDGET_RANGES, LEAD_STATUSES } from '@/types/lead';

export const MESSAGE_MIN_LENGTH = 20;
export const MESSAGE_MAX_LENGTH = 2000;

/**
 * The browser's copy of the API contract.
 *
 * Rules are duplicated here on purpose: the API is the authority and re-checks
 * everything, but a person should learn that a message is too short while they
 * are still typing it, not after a round trip.
 */
export const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your name')
    .max(120, 'Name cannot exceed 120 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address')
    .max(180, 'Email cannot exceed 180 characters'),
  budget: z.enum(BUDGET_RANGES, { error: 'Select a budget range' }),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN_LENGTH, `Tell us a bit more — at least ${MESSAGE_MIN_LENGTH} characters`)
    .max(MESSAGE_MAX_LENGTH, `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});
