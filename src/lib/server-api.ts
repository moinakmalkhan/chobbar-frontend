/**
 * Server-side fetch helper for public, cacheable endpoints (catalog, categories).
 * Used by React Server Components for SEO-critical pages; the client takes over
 * with React Query for anything personalised.
 */
import { env } from "@/lib/env";

export async function serverGet<T>(path: string, init?: { revalidate?: number; searchParams?: Record<string, string | number | undefined> }): Promise<T | null> {
  const url = new URL(`${env.apiUrl}${path}`);
  for (const [key, value] of Object.entries(init?.searchParams ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  try {
    const res = await fetch(url, { next: { revalidate: init?.revalidate ?? 300 }, headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
