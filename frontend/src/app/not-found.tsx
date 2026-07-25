import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="font-display text-4xl font-semibold">This page does not exist</h1>
      <p className="text-muted-foreground max-w-md text-balance">
        The link may be out of date, or the page may have moved. The lead form and the admin
        dashboard are both still where you left them.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to the website</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Open the admin</Link>
        </Button>
      </div>
    </main>
  );
}
