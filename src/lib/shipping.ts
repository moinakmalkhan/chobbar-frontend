import type { ShippingZoneInfo } from "@/types/api";

const norm = (s: string) => s.trim().toLowerCase();

/** Mirrors orders.services.resolve_zone: city match → province match → default zone. */
export function zoneFor(zones: ShippingZoneInfo[], city?: string | null, province?: string | null) {
  if (city) {
    const hit = zones.find((z) => z.cities.some((c) => norm(c) === norm(city)));
    if (hit) return hit;
  }
  if (province) {
    const hit = zones.find((z) => z.provinces.some((p) => norm(p) === norm(province)));
    if (hit) return hit;
  }
  return zones.find((z) => z.is_default) ?? null;
}
