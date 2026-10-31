"use client";

import { useSyncExternalStore } from "react";

interface DeviceInfo {
  /** True on low-memory / few-core / data-saver devices or when the user prefers reduced motion. */
  lowEnd: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
  ready: boolean;
}

const SERVER: DeviceInfo = { lowEnd: false, reducedMotion: false, isMobile: false, ready: false };
let cached: DeviceInfo | null = null;

function detect(): DeviceInfo {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowCores = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const saveData = Boolean(nav.connection?.saveData) || ["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "");
  return { lowEnd: reducedMotion || saveData || (lowCores && lowMemory), reducedMotion, isMobile: window.innerWidth < 768, ready: true };
}

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia("(max-width: 767px)"), window.matchMedia("(prefers-reduced-motion: reduce)")];
  const handler = () => {
    cached = null;
    onChange();
  };
  queries.forEach((q) => q.addEventListener("change", handler));
  return () => queries.forEach((q) => q.removeEventListener("change", handler));
}

function snapshot(): DeviceInfo {
  if (!cached) cached = detect();
  return cached;
}

/** Device capability hints, resolved once on the client (SSR-safe). */
export function useDevice(): DeviceInfo {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER);
}

export function useMediaQuery(query: string) {
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
