import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { callApi } from '@/lib/server/api';
import { forwardResponse, readJsonBody } from '@/lib/server/proxy';
import type { Lead } from '@/types/lead';
import type { PaginatedData } from '@/types/api';

/** GET /api/leads — admin only; the guard lives upstream. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await callApi<PaginatedData<Lead>>('/leads', {
    authenticated: true,
    searchParams: request.nextUrl.searchParams,
  });

  return forwardResponse(result);
}

/** POST /api/leads — the public capture form. */
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJsonBody(request);
  const result = await callApi<Lead>('/leads', { method: 'POST', body });

  return NextResponse.json(result.payload, { status: result.status });
}
