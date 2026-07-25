import { StatsCards } from '@/features/dashboard/components/stats-cards';
import { LeadsPanel } from '@/features/leads/components/leads-panel';

/**
 * The dashboard.
 *
 * A server component that renders two client islands: the figures and the
 * table. Both fetch through this app's own route handlers, so the API token
 * stays in the httpOnly cookie and never reaches the browser.
 */
export default function AdminDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1.5">
        <p className="eyebrow">Dashboard</p>
        <h1 className="font-display text-2xl font-semibold">Your desk</h1>
        <p className="text-muted-foreground text-sm">
          Everything that came in, and what still needs a reply.
        </p>
      </div>

      <StatsCards />
      <LeadsPanel />
    </div>
  );
}
