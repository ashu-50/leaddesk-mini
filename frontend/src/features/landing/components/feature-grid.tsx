import { BellIcon, DatabaseIcon, KeyRoundIcon, SearchIcon, ShieldCheckIcon, ZapIcon } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FEATURES = [
  {
    icon: ZapIcon,
    title: 'Status changes without a reload',
    description:
      'Move a lead to contacted and the table, the counts and the badge update in the same instant. If the server rejects it, the row rolls back on its own.',
  },
  {
    icon: SearchIcon,
    title: 'Search that runs on the server',
    description:
      'Type a name or part of an email. Matching happens in PostgreSQL, case-insensitively, so it still works on the ten-thousandth lead.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Every field checked twice',
    description:
      'The browser validates as you type; the API validates again before anything is written. A malformed budget or a two-word message never reaches the database.',
  },
  {
    icon: KeyRoundIcon,
    title: 'Sessions the browser cannot read',
    description:
      'Sign-in tokens are hashed, signed and stored in an httpOnly cookie. No script on the page can reach them, so one XSS bug is not one stolen account.',
  },
  {
    icon: DatabaseIcon,
    title: 'One table, indexed for the way you read it',
    description:
      'Newest first, filtered by status, searched by email — the three queries the admin actually runs each have an index behind them.',
  },
  {
    icon: BellIcon,
    title: 'A dashboard that answers one question',
    description:
      'How many came in, how many are still waiting, and what share ended up closed. No charts you have to interpret before breakfast.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-muted/40 border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
        <Reveal className="flex max-w-2xl flex-col gap-4">
          <p className="eyebrow">What you get</p>
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            Small surface, serious plumbing
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">
            The product is deliberately narrow. What sits underneath it is not.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 3) * 80}>
              <Card className="h-full">
                <CardHeader>
                  <feature.icon aria-hidden className="text-primary size-5" />
                  <CardTitle className="mt-3 text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-pretty">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
