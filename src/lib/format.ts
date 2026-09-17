export function localDate(isoLike: string, timezone: string): Date {
  // Open-Meteo returns local time strings without offset, e.g. "2026-09-05T14:00".
  // We treat that string as wall-clock time in the given timezone.
  return new Date(isoLike);
}

export function formatHour(isoLike: string): string {
  const d = new Date(isoLike);
  return d.toLocaleTimeString("en-US", { hour: "numeric" });
}

export function formatWeekday(dateStr: string, opts?: { short?: boolean }): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: opts?.short ? "short" : "long" });
}

export function formatDayMonth(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatClock(isoLike: string): string {
  const d = new Date(isoLike);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

export function temp(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${Math.round(v)}°`;
}

export function tempPrecise(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${Math.round(v)}°`;
}

export function unit(v: number | null | undefined, u: string, decimals = 0): string {
  if (v == null) return "—";
  return `${decimals > 0 ? v.toFixed(decimals) : Math.round(v)}${u}`;
}
