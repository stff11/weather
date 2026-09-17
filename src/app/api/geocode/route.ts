import { NextRequest, NextResponse } from "next/server";
import type { GeoResult } from "@/lib/types";

// Force this route to run per-request rather than risk being treated as a
// statically-cacheable GET handler at build/deploy time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=8&language=en&format=json`;

  try {
    // Only cache the upstream fetch itself (server-side, correctly keyed by
    // the full URL including the query). The response we hand back to the
    // browser is intentionally NOT publicly/CDN-cacheable — this is a live,
    // per-keystroke autocomplete endpoint, and a shared response cache here
    // previously caused every search to return whichever query was cached
    // first, regardless of what was actually typed.
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Geocoding upstream error ${res.status}`);
    const data = await res.json();
    const results: GeoResult[] = (data.results ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      countryCode: r.country_code,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      population: r.population,
    }));
    return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Geocoding failed", results: [] },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
