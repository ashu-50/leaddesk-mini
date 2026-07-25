'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BUDGET_LABELS } from '@/lib/constants';
import { formatAbsoluteTime, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types/lead';
import { LeadStatusActions } from './lead-status-actions';
import { LeadStatusBadge } from './lead-status-badge';

interface LeadsTableProps {
  leads: Lead[];
  updatingLeadId: string | null;
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
  /** Dimmed while a background refresh is in flight. */
  isRefreshing: boolean;
}

export function LeadsTable({
  leads,
  updatingLeadId,
  onStatusChange,
  isRefreshing,
}: LeadsTableProps) {
  return (
    <div
      className={cn(
        'overflow-x-auto transition-opacity duration-200',
        isRefreshing && 'opacity-60',
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[13rem]">Lead</TableHead>
            <TableHead className="hidden lg:table-cell">Message</TableHead>
            <TableHead className="hidden md:table-cell">Budget</TableHead>
            <TableHead className="hidden sm:table-cell">Received</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="align-top">
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{lead.name}</span>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-muted-foreground hover:text-foreground w-fit text-xs transition-colors"
                  >
                    {lead.email}
                  </a>
                  <span className="text-muted-foreground sm:hidden mt-1 font-mono text-[0.625rem]">
                    {formatRelativeTime(lead.createdAt)} · {BUDGET_LABELS[lead.budget]}
                  </span>
                </div>
              </TableCell>

              <TableCell className="hidden max-w-sm lg:table-cell">
                <p className="text-muted-foreground line-clamp-2 text-sm text-pretty">
                  {lead.message}
                </p>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <span className="tabular font-mono text-xs">{BUDGET_LABELS[lead.budget]}</span>
              </TableCell>

              <TableCell className="hidden sm:table-cell">
                <time
                  dateTime={lead.createdAt}
                  title={formatAbsoluteTime(lead.createdAt)}
                  className="text-muted-foreground tabular text-xs"
                >
                  {formatRelativeTime(lead.createdAt)}
                </time>
              </TableCell>

              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>

              <TableCell>
                <LeadStatusActions
                  lead={lead}
                  isUpdating={updatingLeadId === lead.id}
                  onChange={(status) => onStatusChange(lead, status)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
