import { Badge } from '@/components/ui/badge';
import { LEAD_STATUS_META } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/lead';

/** One badge, one meaning — the colours come from the shared status tokens. */
export function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const meta = LEAD_STATUS_META[status];

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', meta.badgeClassName, className)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', meta.dotClassName)} />
      {meta.label}
    </Badge>
  );
}
