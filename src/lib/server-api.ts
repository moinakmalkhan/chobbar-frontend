/**
 * Server-side fetch for public, cacheable endpoints (catalog, content) used by
 * React Server Components for SEO pages. The client takes over with React Query.
 */
import "server-only";

import { env } from "@/lib/env";

// Shared secret so the API doesn't rate-limit server-side rendering (all SSR traffic comes from one IP).
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN ?? "";

export async function serverGet<T>(
  path: string,
  init?: { revalidate?: number; searchParams?: Record<string, string | number | undefined>; locale?: string },
): Promise<T | null> {
  const url = new URL(`${env.apiUrl}${path}`);
  for (const [key, value] of Object.entries(init?.searchParams ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  try {
    const res = await fetch(url, {
      next: { revalidate: init?.revalidate ?? 300, tags: [path.split("/")[1] ?? "api"] },
      headers: {
        Accept: "application/json",
        "X-Language": init?.locale ?? "en",
        ...(INTERNAL_TOKEN ? { "X-Internal-Token": INTERNAL_TOKEN } : {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
