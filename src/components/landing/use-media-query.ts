"use client";

import { useSyncExternalStore } from "react";

/**
 * Mobile-first media query — the server snapshot and the pre-hydration
 * client snapshot both report `false` (mobile), so phones never paint a
 * desktop layout that then jumps. Desktop users get at most one frame of
 * the mobile layout before the effect-less subscription corrects it.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** `(min-width: 768px)` — the landing's desktop/mobile split. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}
