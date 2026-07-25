'use client';

import { useMemo, useState } from 'react';
import { InboxIcon, RotateCcwIcon, SearchXIcon, TriangleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useDebouncedValue } from '@/hooks/use-debounce';
import { ApiError } from '@/lib/api-error';
import { LEADS_PER_PAGE, SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import type { Lead, LeadStatus } from '@/types/lead';
import { useLeads } from '../hooks/use-leads';
import { useUpdateLeadStatus } from '../hooks/use-update-lead-status';
import { LeadsPagination } from './leads-pagination';
import { LeadsTable } from './leads-table';
import { LeadsTableSkeleton } from './leads-table-skeleton';
import { LeadsToolbar, type StatusFilter } from './leads-toolbar';

/**
 * The working surface of the admin.
 *
 * Filter state lives here rather than in the URL: this is a single-screen tool
 * where nobody bookmarks "page 3 of contacted leads", and keeping it in React
 * state avoids a router round trip on every keystroke.
 */
export function LeadsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  // Narrowing the result set while sitting on page 4 would show an empty
  // table, so changing a filter returns to the first page. Handled in the
  // event handlers rather than an effect: it is a reaction to what the person
  // did, not state that needs synchronising after the fact.
  const changeSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const changeStatus = (next: StatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  const params = useMemo(
    () => ({
      page,
      limit: LEADS_PER_PAGE,
      search: debouncedSearch.trim() || undefined,
      status: status === 'ALL' ? undefined : status,
    }),
    [page, debouncedSearch, status],
  );

  const { data, isPending, isFetching, isError, error, refetch } = useLeads(params);
  const updateStatus = useUpdateLeadStatus();

  const hasFilters = debouncedSearch.trim().length > 0 || status !== 'ALL';
  const leads = data?.items ?? [];

  const handleStatusChange = (lead: Lead, next: LeadStatus) => {
    if (lead.status === next) {
      return;
    }

    updateStatus.mutate({ id: lead.id, status: next, name: lead.name });
  };

  const clearFilters = () => {
    changeSearch('');
    changeStatus('ALL');
  };

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-col gap-4 border-b py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Leads</CardTitle>
            <CardDescription>
              Newest first. Changes save immediately — there is no save button.
            </CardDescription>
          </div>

          {data ? (
            <p className="text-muted-foreground tabular font-mono text-xs tracking-wide">
              {data.meta.total} total
            </p>
          ) : null}
        </div>

        <LeadsToolbar
          searchTerm={searchTerm}
          onSearchChange={changeSearch}
          status={status}
          onStatusChange={changeStatus}
          resultCount={data?.meta.total}
        />
      </CardHeader>

      <CardContent className="p-0">
        {isError ? (
          <div className="p-4">
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>Leads could not be loaded</AlertTitle>
              <AlertDescription className="flex flex-col items-start gap-3">
                <span>
                  {error instanceof ApiError
                    ? error.displayMessage
                    : 'The API did not respond. Check that the server is running.'}
                </span>
                <Button variant="outline" size="sm" onClick={() => void refetch()}>
                  <RotateCcwIcon data-icon="inline-start" />
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : isPending ? (
          <LeadsTableSkeleton />
        ) : leads.length === 0 ? (
          <Empty className="py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {hasFilters ? <SearchXIcon /> : <InboxIcon />}
              </EmptyMedia>
              <EmptyTitle>{hasFilters ? 'No matching leads' : 'No leads yet'}</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? 'Nothing matches this search and filter combination.'
                  : 'Enquiries submitted through the website form will appear here within a second of being sent.'}
              </EmptyDescription>
            </EmptyHeader>

            {hasFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </Empty>
        ) : (
          <>
            <LeadsTable
              leads={leads}
              updatingLeadId={updateStatus.isPending ? (updateStatus.variables?.id ?? null) : null}
              onStatusChange={handleStatusChange}
              isRefreshing={isFetching && !updateStatus.isPending}
            />

            {data.meta.totalPages > 1 ? (
              <LeadsPagination meta={data.meta} onPageChange={setPage} isFetching={isFetching} />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
