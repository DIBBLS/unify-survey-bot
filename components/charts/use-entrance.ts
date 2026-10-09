'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type EntrancePhase = 'armed' | 'play' | 'static';

/**
 * Grows content from its resting state the first time it scrolls into view.
 * Pass `{ play: true }` to skip the entrance and render the final state
 * (also used when animation is disabled). With `prefers-reduced-motion`
 * the final state renders immediately with no transition.
 *
 * @returns a ref callback to observe, and the current phase.
 */
export function useEntrance<T extends HTMLElement = HTMLDivElement>({
  play,
}: {
  play?: boolean;
} = {}): [(node: T | null) => void, EntrancePhase] {
  const [phase, setPhase] = useState<EntrancePhase>(play ? 'static' : 'armed');
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => () => ioRef.current?.disconnect(), []);

  const observe = useCallback(
    (node: T | null) => {
      ioRef.current?.disconnect();
      ioRef.current = null;
      if (!node) return;
      if (play) {
        setPhase('static');
        return;
      }
      if (typeof IntersectionObserver === 'undefined') {
        setPhase('play');
        return;
      }
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setPhase('static');
          return;
        }
      } catch {
        // matchMedia unavailable: fall through to the observer.
      }
      setPhase('armed');
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setPhase('play');
            io.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      io.observe(node);
      ioRef.current = io;
    },
    [play]
  );

  return [observe, phase];
}
