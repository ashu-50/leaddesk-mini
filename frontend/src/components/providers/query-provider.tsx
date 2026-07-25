'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError } from '@/lib/api-error';

/**
 * TanStack Query owns all server state in the admin app: caching, background
 * refresh, optimistic updates and request de-duplication. React state is left
 * for genuinely local concerns (open menus, form fields).
 */
export function QueryProvider({ children }: { children: ReactNode }): ReactNode {
  // Created inside state so each browser session gets exactly one client and
  // server renders never share a cache between requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            // Retrying a 401 or a 400 only delays the error the person needs
            // to see. Server faults are worth one more attempt.
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status < 500) {
                return false;
              }

              return failureCount < 2;
            },
          },
          mutations: { retry: false },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
