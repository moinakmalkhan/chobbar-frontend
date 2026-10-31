"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole page: any element with `data-reveal`
 * fades/rises in once when it scrolls into view. Pure CSS transition, so it is
 * cheap on low-end phones; content stays visible if JS never runs.
 */
export function useRevealObserver(pathKey: string) {
  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window)) return;
    root.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    const observe = () =>
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));
    observe();
    // Catch elements rendered after data loads.
    const mo = new MutationObserver(() => observe());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathKey]);
}
