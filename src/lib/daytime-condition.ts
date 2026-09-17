// Turns a day's hourly forecast into a single representative weather code,
// weighted toward *daytime* hours rather than a flat 24-hour blend.
//
// Why this exists: WeatherNext (like most models) doesn't predict cloud cover
// directly — it's derived from relative humidity at different altitude
// bands. Coastal spots very commonly get a moist, low-cloud or hazy signal
// overnight and at dawn (radiative cooling, a marine layer) that clears
// completely by mid-morning without ever producing real cloud. A single
// weather code blended across all 24 hours — the usual approach — gets
// dragged toward "cloudy" by hours nobody is outside for. This derives the
// day's icon from daylight hours only, so a clear afternoon isn't hidden
// behind a damp night.
//
// Genuine hazards are never suppressed this way: thunderstorms, freezing
// rain, and heavy snow during the day always win regardless of how briefly
// they appear, because under-warning is worse than over-warning.

import type { HourlyPoint } from "./types";
import { describeWeatherCode } from "./weather-code";

const HIGH_SEVERITY_CODES = new Set([95, 96, 99, 66, 67, 75, 65]);

function cloudCoverToCode(avgCloud: number): number {
  if (avgCloud <= 15) return 0; // clear
  if (avgCloud <= 35) return 1; // mainly clear
  if (avgCloud <= 70) return 2; // partly cloudy
  return 3; // overcast
}

export function deriveDaytimeCondition(dayHours: HourlyPoint[]): {
  weatherCode: number | null;
  daytimeCloudCover: number | null;
} {
  if (dayHours.length === 0) return { weatherCode: null, daytimeCloudCover: null };

  const daytime = dayHours.filter((h) => h.isDay);
  // Fall back to the full day if, for some reason, no hour is flagged as
  // daytime (e.g. polar night).
  const pool = daytime.length > 0 ? daytime : dayHours;

  // 1. Never hide genuine hazards that occur during daylight hours.
  const hazardCodes = pool
    .map((h) => h.weatherCode)
    .filter((c): c is number => c != null && HIGH_SEVERITY_CODES.has(c));
  if (hazardCodes.length > 0) {
    // Use the most severe hazard code present.
    const worst = hazardCodes.sort((a, b) => b - a)[0];
    return { weatherCode: worst, daytimeCloudCover: avgCloud(pool) };
  }

  // 2. Meaningful precipitation during daylight — keep it, but don't let a
  //    single noisy hour flip the whole day.
  const precipHours = pool.filter(
    (h) => (h.precipitationProbability ?? 0) >= 35 || (h.precipitation ?? 0) >= 0.3
  );
  if (precipHours.length >= Math.max(2, Math.ceil(pool.length * 0.2))) {
    const avgTemp = average(pool.map((h) => h.temperature ?? 10));
    const maxProb = Math.max(...precipHours.map((h) => h.precipitationProbability ?? 0));
    const isSnow = avgTemp <= 0.5;
    const heavy = maxProb >= 70;
    const scattered = precipHours.length < pool.length * 0.5;

    let code: number;
    if (isSnow) code = heavy ? 75 : 71;
    else if (scattered) code = heavy ? 82 : 80; // showers
    else code = heavy ? 63 : 61; // steadier rain

    return { weatherCode: code, daytimeCloudCover: avgCloud(pool) };
  }

  // 3. Fog — only keep it if it persists through a real chunk of daylight,
  //    not just a fleeting early-morning hour.
  const fogHours = pool.filter((h) => h.weatherCode === 45 || h.weatherCode === 48);
  if (fogHours.length >= Math.max(2, pool.length * 0.4)) {
    return { weatherCode: 45, daytimeCloudCover: avgCloud(pool) };
  }

  // 4. Otherwise, classify purely by average daytime cloud cover.
  const cloud = avgCloud(pool);
  return { weatherCode: cloudCoverToCode(cloud ?? 0), daytimeCloudCover: cloud };
}

function avgCloud(hours: HourlyPoint[]): number | null {
  const vals = hours.map((h) => h.cloudCover).filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return average(vals);
}

function average(vals: number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function groupHourlyByLocalDate(hourly: HourlyPoint[]): Record<string, HourlyPoint[]> {
  const groups: Record<string, HourlyPoint[]> = {};
  for (const h of hourly) {
    const date = h.time.slice(0, 10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(h);
  }
  return groups;
}
