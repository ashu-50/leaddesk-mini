'use client';

import { useEffect, useState } from 'react';

/**
 * Holds a value still for `delay` ms. Used by the lead search so typing does
 * not fire a request per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
