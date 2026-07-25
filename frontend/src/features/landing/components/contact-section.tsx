import { Reveal } from '@/components/shared/reveal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadForm } from '@/features/leads/components/lead-form';
import { LEAD_STATUS_META } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/lead';

const WHAT_HAPPENS: { status: LeadStatus; text: string }[] = [
  { status: 'NEW', text: 'Your enquiry appears on the desk, marked as waiting.' },
  { status: 'CONTACTED', text: 'A human replies — usually within one working day.' },
  { status: 'CLOSED', text: 'We agree on next steps, or we tell you it is not a fit.' },
];

export function ContactSection() {
  return (
    <section id="enquiry" className="relative border-t">
      <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:py-24">
        <Reveal className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <p className="eyebrow">Send an enquiry</p>
            <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
              Try the form that feeds the desk
            </h2>
            <p className="text-muted-foreground text-lg text-pretty">
              This is the same form a visitor to your site would use. Submit it and the enquiry
              lands in the admin dashboard immediately, marked new.
            </p>
          </div>

          <ol className="flex flex-col gap-4 border-t pt-6">
            {WHAT_HAPPENS.map((step, index) => {
              const meta = LEAD_STATUS_META[step.status];

              return (
                <li key={step.status} className="flex items-start gap-3">
                  <span className="tabular text-muted-foreground mt-0.5 font-mono text-xs">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden className={cn('mt-1.5 size-1.5 rounded-full', meta.dotClassName)} />
                  <span className="text-sm text-pretty">{step.text}</span>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <Reveal delay={100}>
          <Card>
            <CardHeader>
              <CardTitle>Tell us about the project</CardTitle>
              <CardDescription>
                Four fields. Everything is validated here and again on the server.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadForm />
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
