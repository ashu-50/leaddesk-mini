'use client';

import { useEffect, useRef } from 'react';

/**
 * Reveals an element once, the first time it scrolls into view.
 *
 * The visible state is driven by a `data-reveal` attribute so the transition
 * lives in CSS, where `prefers-reduced-motion` can neutralise it. Elements
 * start `hidden` and are never re-hidden — content that has been read does not
 * flicker away when scrolling back up.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      element.dataset.reveal = 'shown';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.dataset.reveal = 'shown';
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
