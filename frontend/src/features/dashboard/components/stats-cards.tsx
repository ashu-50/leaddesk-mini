'use client';

import { CheckCircle2Icon, InboxIcon, MessagesSquareIcon, TrendingUpIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types/lead';
import { useDashboardStats } from '../hooks/use-dashboard-stats';

interface StatDefinition {
  key: string;
  label: string;
  icon: LucideIcon;
  accentClassName?: string;
  value: (stats: DashboardStats) => string;
  hint: (stats: DashboardStats) => string;
}

const STATS: StatDefinition[] = [
  {
    key: 'total',
    label: 'Total leads',
    icon: InboxIcon,
    value: (stats) => String(stats.totalLeads),
    hint: (stats) => `${stats.leadsThisWeek} in the last 7 days`,
  },
  {
    key: 'new',
    label: 'Waiting on you',
    icon: MessagesSquareIcon,
    // The only amber number in the app: something needs a human.
    accentClassName: 'text-signal',
    value: (stats) => String(stats.byStatus.new),
    hint: (stats) => `${stats.leadsToday} arrived today`,
  },
  {
    key: 'contacted',
    label: 'In conversation',
    icon: MessagesSquareIcon,
    value: (stats) => String(stats.byStatus.contacted),
    hint: () => 'Replied, not yet resolved',
  },
  {
    key: 'closed',
    label: 'Closed',
    icon: CheckCircle2Icon,
    value: (stats) => String(stats.byStatus.closed),
    hint: (stats) => `${stats.conversionRate}% of all leads`,
  },
];

export function StatsCards() {
  const { data, isPending, isError } = useDashboardStats();

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistics are unavailable</CardTitle>
          <CardDescription>
            The dashboard figures could not be loaded. The lead table below still works.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.key} className="gap-3">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between gap-2">
              <CardDescription className="eyebrow">{stat.label}</CardDescription>
              <stat.icon aria-hidden className="text-muted-foreground size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {isPending || !data ? (
              <>
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <p
                  className={cn(
                    'tabular font-display text-3xl leading-none font-semibold',
                    stat.accentClassName,
                  )}
                >
                  {stat.value(data)}
                </p>
                <p className="text-muted-foreground text-xs">{stat.hint(data)}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ConversionSummary() {
  const { data } = useDashboardStats();

  if (!data || data.totalLeads === 0) {
    return null;
  }

  return (
    <p className="text-muted-foreground flex items-center gap-2 text-sm">
      <TrendingUpIcon aria-hidden className="size-4" />
      <span>
        <span className="tabular text-foreground font-medium">{data.conversionRate}%</span> of
        enquiries have reached closed.
      </span>
    </p>
  );
}
