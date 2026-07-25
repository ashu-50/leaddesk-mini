import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadsTableSkeleton } from '@/features/leads/components/leads-table-skeleton';

/**
 * Shown while the layout verifies the session on the server. It mirrors the
 * real page's structure so the transition is a fill, not a jump.
 */
export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="gap-3">
            <CardHeader className="pb-0">
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="flex flex-col gap-4 border-b py-5">
          <Skeleton className="h-5 w-24" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-full sm:w-44" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <LeadsTableSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
