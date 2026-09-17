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
