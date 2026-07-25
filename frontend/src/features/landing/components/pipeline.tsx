import { Reveal } from '@/components/shared/reveal';
import { LEAD_STATUS_META } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/lead';

interface Step {
  status: LeadStatus;
  headline: string;
  body: string;
}

/**
 * The only numbered section on the page — and it is numbered because the
 * content genuinely is a sequence: a lead cannot be closed before it has been
 * contacted. The numbers carry information, not decoration.
 */
const STEPS: Step[] = [
  {
    status: 'NEW',
    headline: 'It arrives',
    body: 'Someone fills in the form on your site. The enquiry is validated, stored and marked new — nobody has to remember to forward an email.',
  },
  {
    status: 'CONTACTED',
    headline: 'You reply',
    body: 'You open the admin, find the enquiry by name or email, and move it to contacted the moment you answer. The change is saved without a page reload.',
  },
  {
    status: 'CLOSED',
    headline: 'It ends',
    body: 'Won or lost, the enquiry moves to closed and leaves your working list. The dashboard keeps the count so you can see what the month actually produced.',
  },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
        <Reveal className="flex max-w-2xl flex-col gap-4">
          <p className="eyebrow">The lifecycle</p>
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            Three states, in one direction
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">
            Most CRMs ask you to design a pipeline before you can use them. This one has already
            made the decision, and the whole team means the same thing by each word.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const meta = LEAD_STATUS_META[step.status];

            return (
              <Reveal key={step.status} delay={index * 90}>
                <li className="flex h-full flex-col gap-3 border-t pt-5">
                  <div className="flex items-center gap-2.5">
                    <span className="tabular font-mono text-xs tracking-widest">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden className={cn('h-px flex-1', 'bg-border')} />
                    <span aria-hidden className={cn('size-1.5 rounded-full', meta.dotClassName)} />
                    <span className="eyebrow">{meta.label}</span>
                  </div>

                  <h3 className="font-display text-xl font-semibold">{step.headline}</h3>
                  <p className="text-muted-foreground text-sm text-pretty">{step.body}</p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
