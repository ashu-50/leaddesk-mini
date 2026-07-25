'use client';

import { useEffect } from 'react';
import { RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Route-level error boundary. It reports the failure and offers the one action
 * that can actually help — retrying the render — rather than apologising.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled UI error:', error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="eyebrow">Something broke</p>
      <h1 className="font-display text-3xl font-semibold">This page could not be displayed</h1>
      <p className="text-muted-foreground max-w-md text-balance">
        The error has been logged. Try again — if it keeps happening, the API may be unreachable.
      </p>
      {error.digest ? (
        <code className="text-muted-foreground bg-muted rounded-md px-2 py-1 font-mono text-xs">
          {error.digest}
        </code>
      ) : null}
      <Button onClick={reset}>
        <RotateCcwIcon />
        Try again
      </Button>
    </main>
  );
}
