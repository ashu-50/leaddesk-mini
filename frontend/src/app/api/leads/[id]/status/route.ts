import type { NextResponse } from 'next/server';
import { callApi } from '@/lib/server/api';
import { forwardResponse, readJsonBody } from '@/lib/server/proxy';
import type { Lead } from '@/types/lead';

interface RouteContext {
  // Next.js 15: dynamic route params are async.
  params: Promise<{ id: string }>;
}

/** PATCH /api/leads/:id/status — moves a lead along the pipeline. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  const body = await readJsonBody(request);

  const result = await callApi<Lead>(`/leads/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    authenticated: true,
    body,
  });

  return forwardResponse(result);
}
