import { NextRequest, NextResponse } from "next/server";
import type { GeoResult } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=8&language=en&format=json`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
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
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Geocoding failed", results: [] }, { status: 502 });
  }
}
