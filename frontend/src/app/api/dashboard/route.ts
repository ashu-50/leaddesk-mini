import type { NextResponse } from 'next/server';
import { callApi } from '@/lib/server/api';
import { forwardResponse } from '@/lib/server/proxy';
import type { DashboardStats } from '@/types/lead';

/** GET /api/dashboard — aggregated metrics for the admin overview. */
export async function GET(): Promise<NextResponse> {
  const result = await callApi<DashboardStats>('/dashboard', { authenticated: true });

  return forwardResponse(result);
}
