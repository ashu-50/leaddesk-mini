export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'CLOSED'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const BUDGET_RANGES = [
  'UNDER_50K',
  'FROM_50K_TO_2L',
  'FROM_2L_TO_5L',
  'FROM_5L_TO_10L',
  'ABOVE_10L',
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export interface Lead {
  id: string;
  name: string;
  email: string;
  budget: BudgetRange;
  message: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  byStatus: {
    new: number;
    contacted: number;
    closed: number;
  };
  leadsToday: number;
  leadsThisWeek: number;
  conversionRate: number;
  recentLeads: Lead[];
}
