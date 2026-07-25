'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';
import type { LeadStatus } from '@/types/lead';

export type StatusFilter = LeadStatus | 'ALL';

interface LeadsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  resultCount: number | undefined;
}

export function LeadsToolbar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  resultCount,
}: LeadsToolbarProps) {
  const hasFilters = searchTerm.length > 0 || status !== 'ALL';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search leads by name or email"
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
        <SelectTrigger aria-label="Filter by status" className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearchChange('');
            onStatusChange('ALL');
          }}
        >
          <XIcon data-icon="inline-start" />
          Clear
          {resultCount === undefined ? null : (
            <span className="text-muted-foreground tabular ml-1 font-mono text-xs">
              {resultCount}
            </span>
          )}
        </Button>
      ) : null}
    </div>
  );
}
