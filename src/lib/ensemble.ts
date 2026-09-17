// The Open-Meteo /v1/ensemble endpoint returns one column per ensemble member,
// e.g. temperature_2m_member01 .. temperature_2m_member64 for WeatherNext 2.
// These helpers collapse those columns into a mean series (and a min/max
// spread, useful for showing forecast uncertainty) per timestamp.

type Row = Record<string, Array<number | null>>;

function memberKeys(data: Row, base: string): string[] {
  const re = new RegExp(`^${base}_member\\d+$`);
  return Object.keys(data).filter((k) => re.test(k));
}

export function ensembleMean(data: Row, base: string, length: number): (number | null)[] {
  const keys = memberKeys(data, base);
  if (keys.length === 0) {
    // Not an ensemble variable (or single-member) — fall back to the raw key.
    return (data[base] as (number | null)[]) ?? new Array(length).fill(null);
  }
  const out: (number | null)[] = new Array(length).fill(null);
  for (let i = 0; i < length; i++) {
    let sum = 0;
    let count = 0;
    for (const k of keys) {
      const v = data[k]?.[i];
      if (v != null && !Number.isNaN(v)) {
        sum += v;
        count++;
      }
    }
    out[i] = count > 0 ? sum / count : null;
  }
  return out;
}

export function ensembleMinMax(
  data: Row,
  base: string,
  length: number
): [(number | null)[], (number | null)[]] {
  const keys = memberKeys(data, base);
  const min: (number | null)[] = new Array(length).fill(null);
  const max: (number | null)[] = new Array(length).fill(null);
  if (keys.length === 0) return [min, max];
  for (let i = 0; i < length; i++) {
    let lo = Infinity;
    let hi = -Infinity;
    let found = false;
    for (const k of keys) {
      const v = data[k]?.[i];
      if (v != null && !Number.isNaN(v)) {
        found = true;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    min[i] = found ? lo : null;
    max[i] = found ? hi : null;
  }
  return [min, max];
}

export function round(v: number | null | undefined, decimals = 0): number | null {
  if (v == null || Number.isNaN(v)) return null;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

/**
 * WMO weather codes are categorical, not a continuous scale — code 61 ("rain")
 * isn't "between" 45 ("fog") and 95 ("thunderstorm") in any meaningful sense.
 * Averaging them across ensemble members and rounding (as ensembleMean does)
 * routinely lands on a number that isn't a real code at all, which then falls
 * through to a fallback state — previously defaulting to "clear sky", so a
 * genuinely overcast/rainy hour could render as a bright sun icon whenever
 * members disagreed even slightly.
 *
 * The statistically correct way to summarise a categorical ensemble is the
 * mode: whichever code the most members agree on at that timestep.
 */
export function ensembleMode(data: Row, base: string, length: number): (number | null)[] {
  const keys = memberKeys(data, base);
  if (keys.length === 0) {
    const raw = (data[base] as (number | null)[]) ?? new Array(length).fill(null);
    return raw.map((v) => (v != null ? Math.round(v) : null));
  }
  const out: (number | null)[] = new Array(length).fill(null);
  for (let i = 0; i < length; i++) {
    const counts = new Map<number, number>();
    for (const k of keys) {
      const v = data[k]?.[i];
      if (v == null || Number.isNaN(v)) continue;
      const code = Math.round(v);
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    if (counts.size === 0) {
      out[i] = null;
      continue;
    }
    let bestCode: number | null = null;
    let bestCount = -1;
    for (const [code, count] of counts) {
      // Ties broken toward the higher (generally more severe/cautious) code
      // rather than an arbitrary insertion order, consistent with this app
      // preferring to under-promise rather than under-warn.
      if (count > bestCount || (count === bestCount && bestCode != null && code > bestCode)) {
        bestCode = code;
        bestCount = count;
      }
    }
    out[i] = bestCode;
  }
  return out;
}
