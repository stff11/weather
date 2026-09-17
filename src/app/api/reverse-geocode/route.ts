import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Reverse geocoding upstream error ${res.status}`);
    const data = await res.json();
    const name = data.city || data.locality || data.principalSubdivision || "Your location";
    return NextResponse.json(
      {
        name,
        admin1: data.principalSubdivision ?? undefined,
        country: data.countryName ?? "",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    // Fall back to a generic label rather than failing the whole geolocation flow.
    return NextResponse.json(
      { name: "Your location", admin1: undefined, country: "" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
