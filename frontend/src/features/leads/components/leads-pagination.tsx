'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types/api';

interface LeadsPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  isFetching: boolean;
}

export function LeadsPagination({ meta, onPageChange, isFetching }: LeadsPaginationProps) {
  const firstRow = (meta.page - 1) * meta.limit + 1;
  const lastRow = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
      <p className="text-muted-foreground tabular text-sm">
        Showing {firstRow}–{lastRow} of {meta.total}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasPreviousPage || isFetching}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Previous
        </Button>

        <span className="text-muted-foreground tabular px-1 font-mono text-xs">
          {meta.page} / {Math.max(meta.totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasNextPage || isFetching}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
