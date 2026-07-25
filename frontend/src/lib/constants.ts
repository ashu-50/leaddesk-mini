import type { BudgetRange, LeadStatus } from '@/types/lead';

interface StatusMeta {
  label: string;
  /** What this state means for the person reading it. */
  description: string;
  /** The next stage in the lifecycle, or null when the lead is done. */
  next: LeadStatus | null;
  /**
   * Moves the API will accept from this state. Everything can go forward and a
   * mis-click can be walked back one step; only CLOSED → NEW is refused, since
   * "new" means nobody has replied yet.
   */
  canMoveTo: readonly LeadStatus[];
  badgeClassName: string;
  dotClassName: string;
}

/**
 * One definition of the pipeline, used by the landing page, the badge, the
 * table row menu and the dashboard. Adding a stage means editing this file
 * and nothing else.
 */
export const LEAD_STATUS_META: Record<LeadStatus, StatusMeta> = {
  NEW: {
    label: 'New',
    description: 'Waiting for a first reply',
    next: 'CONTACTED',
    canMoveTo: ['CONTACTED', 'CLOSED'],
    badgeClassName: 'bg-status-new-surface text-status-new border-status-new/25',
    dotClassName: 'bg-status-new',
  },
  CONTACTED: {
    label: 'Contacted',
    description: 'Conversation in progress',
    next: 'CLOSED',
    canMoveTo: ['NEW', 'CLOSED'],
    badgeClassName:
      'bg-status-contacted-surface text-status-contacted border-status-contacted/25',
    dotClassName: 'bg-status-contacted',
  },
  CLOSED: {
    label: 'Closed',
    description: 'Won, lost or archived',
    next: null,
    canMoveTo: ['CONTACTED'],
    badgeClassName: 'bg-status-closed-surface text-status-closed border-status-closed/25',
    dotClassName: 'bg-status-closed',
  },
};

export const BUDGET_LABELS: Record<BudgetRange, string> = {
  UNDER_50K: 'Under ₹50,000',
  FROM_50K_TO_2L: '₹50,000 – ₹2,00,000',
  FROM_2L_TO_5L: '₹2,00,000 – ₹5,00,000',
  FROM_5L_TO_10L: '₹5,00,000 – ₹10,00,000',
  ABOVE_10L: '₹10,00,000+',
};

/** Shown in the filter dropdown, in lifecycle order. */
export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

export const LEADS_PER_PAGE = 10;
export const SEARCH_DEBOUNCE_MS = 300;
