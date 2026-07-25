import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUDGET_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { BudgetRange, LeadStatus } from '@/types/lead';

interface BoardCard {
  name: string;
  company: string;
  budget: BudgetRange;
  waiting: string;
}

interface Lane {
  status: LeadStatus;
  label: string;
  accent: string;
  cards: BoardCard[];
}

/**
 * The desk itself: three lanes holding real-looking enquiries.
 *
 * This is the page's thesis. Rather than describing the product, the hero
 * shows the exact object the product manages, with the one card that is still
 * waiting on a human marked by a pulsing signal — the same amber used
 * everywhere else in the app for the same meaning.
 */
const LANES: Lane[] = [
  {
    status: 'NEW',
    label: 'New',
    accent: 'bg-status-new',
    cards: [
      { name: 'Sofia Bianchi', company: 'Casa Verde', budget: 'FROM_2L_TO_5L', waiting: '4m' },
      { name: 'Tom Okafor', company: 'Brightside', budget: 'FROM_50K_TO_2L', waiting: '3h' },
    ],
  },
  {
    status: 'CONTACTED',
    label: 'Contacted',
    accent: 'bg-status-contacted',
    cards: [
      { name: 'Ananya Sharma', company: 'Northlight', budget: 'FROM_5L_TO_10L', waiting: '1d' },
      { name: 'Kabir Malhotra', company: 'Stackfin', budget: 'ABOVE_10L', waiting: '2d' },
    ],
  },
  {
    status: 'CLOSED',
    label: 'Closed',
    accent: 'bg-status-closed',
    cards: [{ name: 'Priya Raghunathan', company: 'Quilt Health', budget: 'ABOVE_10L', waiting: '6d' }],
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:py-28">
        <div className="flex flex-col items-start gap-6">
          <p className="eyebrow animate-rise">Lead management for small studios</p>

          <h1
            className="animate-rise text-4xl font-semibold text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]"
            style={{ animationDelay: '80ms' }}
          >
            Every enquiry lands on one desk.
          </h1>

          <p
            className="animate-rise text-muted-foreground max-w-lg text-lg text-pretty"
            style={{ animationDelay: '160ms' }}
          >
            LeadDesk Mini catches the enquiries your website already receives, keeps them in three
            plain states, and shows you which ones are still waiting on a reply. No pipeline
            builder, no fourteen custom fields.
          </p>

          <div
            className="animate-rise flex flex-wrap items-center gap-3"
            style={{ animationDelay: '240ms' }}
          >
            <Button asChild size="lg">
              <Link href="#enquiry">
                Send an enquiry
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin">Open the admin</Link>
            </Button>
          </div>

          <dl
            className="animate-rise mt-4 flex flex-wrap gap-x-10 gap-y-4 border-t pt-6"
            style={{ animationDelay: '320ms' }}
          >
            {[
              { value: '3', label: 'States, not thirty' },
              { value: '1', label: 'Form to embed' },
              { value: '0', label: 'Spreadsheets to keep' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <dt className="tabular font-display text-2xl font-semibold">{stat.value}</dt>
                <dd className="text-muted-foreground text-xs">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <DeskBoard />
      </div>
    </section>
  );
}

/**
 * Entrance order for the board, flattened across lanes so the cards animate in
 * one continuous sweep. Computed once at module scope — deriving it by
 * mutating a counter during render breaks under the React Compiler.
 */
const CARD_ORDER = LANES.flatMap((lane) => lane.cards.map((card) => card.name));
const cardDelay = (name: string): number => 320 + (CARD_ORDER.indexOf(name) + 1) * 90;

function DeskBoard() {
  return (
    <div
      className="bg-card animate-settle rounded-xl border p-4 shadow-sm sm:p-5"
      style={{ animationDelay: '200ms' }}
      aria-label="Example of the admin board: five enquiries across three states"
      role="img"
    >
      <div className="flex items-center justify-between gap-3 pb-4">
        <p className="font-display text-sm font-semibold">This week</p>
        <p className="text-muted-foreground tabular font-mono text-[0.6875rem] tracking-wide">
          5 enquiries · 2 waiting
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {LANES.map((lane) => (
          <div key={lane.status} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <span aria-hidden className={cn('size-1.5 rounded-full', lane.accent)} />
              <span className="eyebrow truncate">{lane.label}</span>
              <span className="text-muted-foreground tabular ml-auto font-mono text-[0.6875rem]">
                {lane.cards.length}
              </span>
            </div>

            {lane.cards.map((card) => {
              const isWaiting = lane.status === 'NEW';

              return (
                <article
                  key={card.name}
                  className="bg-background animate-rise flex flex-col gap-1.5 rounded-lg border p-2.5 sm:p-3"
                  style={{ animationDelay: `${cardDelay(card.name)}ms` }}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="truncate text-[0.8125rem] font-medium">{card.name}</p>
                    {isWaiting ? (
                      <span
                        aria-hidden
                        className="bg-signal animate-breathe mt-1 size-1.5 shrink-0 rounded-full"
                      />
                    ) : null}
                  </div>
                  <p className="text-muted-foreground truncate text-xs">{card.company}</p>
                  <p className="text-muted-foreground tabular truncate font-mono text-[0.625rem]">
                    {BUDGET_LABELS[card.budget]}
                  </p>
                  <p className="text-muted-foreground/70 tabular font-mono text-[0.625rem]">
                    {card.waiting} ago
                  </p>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
