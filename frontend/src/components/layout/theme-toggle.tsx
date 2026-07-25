'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Renders a stable placeholder until mounted: the server cannot know the
 * stored theme, and swapping the icon after hydration would shift the header.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Reads false on the server and during hydration, true afterwards — without
  // a setState inside an effect, which triggers a cascading render.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={mounted ? `Switch to ${isDark ? 'light' : 'dark'} theme` : 'Switch theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted && isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
