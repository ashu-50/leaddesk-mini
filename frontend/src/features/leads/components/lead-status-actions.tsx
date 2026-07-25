'use client';

import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { LEAD_STATUS_META } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { LEAD_STATUSES, type Lead, type LeadStatus } from '@/types/lead';

interface LeadStatusActionsProps {
  lead: Lead;
  isUpdating: boolean;
  onChange: (status: LeadStatus) => void;
}

/**
 * The status control.
 *
 * The next stage in the lifecycle is offered as a one-click button because it
 * is what happens 90% of the time; the menu beside it exists for corrections,
 * including moving a lead backwards after a mis-click.
 */
export function LeadStatusActions({ lead, isUpdating, onChange }: LeadStatusActionsProps) {
  const meta = LEAD_STATUS_META[lead.status];
  const nextStatus = meta.next;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {nextStatus ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isUpdating}
          onClick={() => onChange(nextStatus)}
          aria-label={`Move ${lead.name} to ${LEAD_STATUS_META[nextStatus].label}`}
        >
          {isUpdating ? <Spinner data-icon="inline-start" /> : null}
          Mark {LEAD_STATUS_META[nextStatus].label.toLowerCase()}
        </Button>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            disabled={isUpdating}
            aria-label={`Change status for ${lead.name}`}
          >
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {LEAD_STATUSES.map((status) => {
              const option = LEAD_STATUS_META[status];
              const isCurrent = status === lead.status;
              // Offering a move the API would reject with a 422 is worse than
              // not offering it, so unavailable states are shown but disabled.
              const isAllowed = meta.canMoveTo.includes(status);

              return (
                <DropdownMenuItem
                  key={status}
                  disabled={isCurrent || !isAllowed}
                  onSelect={() => onChange(status)}
                  className="gap-2"
                >
                  <span aria-hidden className={cn('size-1.5 rounded-full', option.dotClassName)} />
                  <span className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-muted-foreground text-xs">{option.description}</span>
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
