import { NextRequest, NextResponse } from "next/server";
import { ensembleMean, ensembleMinMax, ensembleMode, round } from "@/lib/ensemble";
import { deriveDaytimeCondition, groupHourlyByLocalDate } from "@/lib/daytime-condition";
import type { WeatherResponse, HourlyPoint, DailyPoint, CurrentConditions } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ENSEMBLE_HOURLY = [
  "temperature_2m",
  "precipitation",
  "cloud_cover",
  "cloud_cover_low",
  "cloud_cover_mid",
  "cloud_cover_high",
  "wind_speed_10m",
  "wind_direction_10m",
  "pressure_msl",
  "surface_pressure",
  "weather_code",
  "is_day",
].join(",");

const ENSEMBLE_DAILY = [
  "temperature_2m_max",
  "temperature_2m_min",
  "temperature_2m_mean",
  "precipitation_sum",
  "precipitation_hours",
  "wind_speed_10m_max",
  "wind_direction_10m_dominant",
  "cloud_cover_mean",
  "pressure_msl_mean",
].join(",");

const SUPPLEMENT_HOURLY = [
  "apparent_temperature",
  "relative_humidity_2m",
  "dew_point_2m",
  "precipitation_probability",
  "wind_gusts_10m",
  "uv_index",
  "visibility",
].join(",");

const SUPPLEMENT_DAILY = [
  "weather_code",
  "sunrise",
  "sunset",
  "uv_index_max",
  "precipitation_probability_max",
].join(",");

const FORECAST_DAYS = 10;

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upstream error ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const name = searchParams.get("name") ?? undefined;
  const admin1 = searchParams.get("admin1") ?? undefined;
  const country = searchParams.get("country") ?? undefined;

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const ensembleUrl =
    `https://ensemble-api.open-meteo.com/v1/ensemble?latitude=${lat}&longitude=${lon}` +
    `&models=google_weathernext2_ensemble&hourly=${ENSEMBLE_HOURLY}&daily=${ENSEMBLE_DAILY}` +
    `&forecast_days=${FORECAST_DAYS}&timezone=auto&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm`;

  const supplementUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=${SUPPLEMENT_HOURLY}&daily=${SUPPLEMENT_DAILY}` +
    `&forecast_days=${FORECAST_DAYS}&timezone=auto&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm`;

  try {
    const [ensemble, supplement] = await Promise.all([
      fetchJson(ensembleUrl),
      fetchJson(supplementUrl),
    ]);

    const hTime: string[] = ensemble.hourly.time;
    const len = hTime.length;

    const temp = ensembleMean(ensemble.hourly, "temperature_2m", len);
    const [tempMin, tempMax] = ensembleMinMax(ensemble.hourly, "temperature_2m", len);
    const precip = ensembleMean(ensemble.hourly, "precipitation", len);
    const cloud = ensembleMean(ensemble.hourly, "cloud_cover", len);
    const windSpeed = ensembleMean(ensemble.hourly, "wind_speed_10m", len);
    const windDir = ensembleMean(ensemble.hourly, "wind_direction_10m", len);
    const pressure = ensembleMean(ensemble.hourly, "pressure_msl", len);
    const weatherCode = ensembleMode(ensemble.hourly, "weather_code", len);
    const isDay = ensembleMean(ensemble.hourly, "is_day", len);

    const sTime: string[] = supplement.hourly.time;
    const sLen = sTime.length;
    const feelsLike: (number | null)[] = supplement.hourly.apparent_temperature ?? new Array(sLen).fill(null);
    const humidity: (number | null)[] = supplement.hourly.relative_humidity_2m ?? new Array(sLen).fill(null);
    const dewPoint: (number | null)[] = supplement.hourly.dew_point_2m ?? new Array(sLen).fill(null);
    const precipProb: (number | null)[] = supplement.hourly.precipitation_probability ?? new Array(sLen).fill(null);
    const windGusts: (number | null)[] = supplement.hourly.wind_gusts_10m ?? new Array(sLen).fill(null);
    const uvIndex: (number | null)[] = supplement.hourly.uv_index ?? new Array(sLen).fill(null);
    const visibility: (number | null)[] = supplement.hourly.visibility ?? new Array(sLen).fill(null);

    const hourly: HourlyPoint[] = hTime.map((t, i) => ({
      time: t,
      temperature: round(temp[i], 1),
      feelsLike: round(feelsLike[i], 1),
      dewPoint: round(dewPoint[i], 1),
      humidity: round(humidity[i]),
      precipitationProbability: round(precipProb[i]),
      precipitation: round(precip[i], 1),
      cloudCover: round(cloud[i]),
      windSpeed: round(windSpeed[i], 1),
      windDirection: round(windDir[i]),
      windGusts: round(windGusts[i], 1),
      pressure: round(pressure[i]),
      weatherCode: weatherCode[i],
      isDay: (isDay[i] ?? 1) >= 0.5,
      temperatureSpread:
        tempMin[i] != null && tempMax[i] != null ? [round(tempMin[i], 1)!, round(tempMax[i], 1)!] : null,
    }));

    const dDates: string[] = ensemble.daily.time;
    const dLen = dDates.length;
    const dTempMax = ensembleMean(ensemble.daily, "temperature_2m_max", dLen);
    const dTempMin = ensembleMean(ensemble.daily, "temperature_2m_min", dLen);
    const dTempMean = ensembleMean(ensemble.daily, "temperature_2m_mean", dLen);
    const dPrecipSum = ensembleMean(ensemble.daily, "precipitation_sum", dLen);
    const dPrecipHours = ensembleMean(ensemble.daily, "precipitation_hours", dLen);
    const dWindMax = ensembleMean(ensemble.daily, "wind_speed_10m_max", dLen);
    const dWindDir = ensembleMean(ensemble.daily, "wind_direction_10m_dominant", dLen);
    const dCloud = ensembleMean(ensemble.daily, "cloud_cover_mean", dLen);
    const dPressure = ensembleMean(ensemble.daily, "pressure_msl_mean", dLen);
    const [dTempMinSpread] = ensembleMinMax(ensemble.daily, "temperature_2m_min", dLen);
    const [, dTempMaxSpread] = ensembleMinMax(ensemble.daily, "temperature_2m_max", dLen);

    const sDates: string[] = supplement.daily.time;
    const sSunrise: (string | null)[] = supplement.daily.sunrise ?? [];
    const sSunset: (string | null)[] = supplement.daily.sunset ?? [];
    const sUvMax: (number | null)[] = supplement.daily.uv_index_max ?? [];
    const sPrecipProbMax: (number | null)[] = supplement.daily.precipitation_probability_max ?? [];

    const hoursByDate = groupHourlyByLocalDate(hourly);

    const daily: DailyPoint[] = dDates.map((d, i) => {
      const sIdx = sDates.indexOf(d);
      const { weatherCode: daytimeCode, daytimeCloudCover } = deriveDaytimeCondition(
        hoursByDate[d] ?? []
      );
      return {
        date: d,
        tempMax: round(dTempMax[i], 1),
        tempMin: round(dTempMin[i], 1),
        tempMean: round(dTempMean[i], 1),
        precipitationSum: round(dPrecipSum[i], 1),
        precipitationProbabilityMax: sIdx >= 0 ? round(sPrecipProbMax[sIdx]) : null,
        precipitationHours: round(dPrecipHours[i]),
        windSpeedMax: round(dWindMax[i], 1),
        windDirectionDominant: round(dWindDir[i]),
        windGustsMax: null,
        cloudCoverMean: round(dCloud[i]),
        daytimeCloudCover: round(daytimeCloudCover),
        pressureMean: round(dPressure[i]),
        uvIndexMax: sIdx >= 0 ? round(sUvMax[sIdx], 1) : null,
        weatherCode: daytimeCode,
        sunrise: sIdx >= 0 ? sSunrise[sIdx] : null,
        sunset: sIdx >= 0 ? sSunset[sIdx] : null,
        tempRange:
          dTempMinSpread[i] != null && dTempMaxSpread[i] != null
            ? [round(dTempMinSpread[i], 1)!, round(dTempMaxSpread[i], 1)!]
            : null,
      };
    });

    // Find "now" index using the location's utc offset.
    const utcOffsetSeconds: number = ensemble.utc_offset_seconds ?? 0;
    const nowLocal = new Date(Date.now() + utcOffsetSeconds * 1000);
    const nowKey = nowLocal.toISOString().slice(0, 13); // yyyy-mm-ddTHH
    let nowIdx = hTime.findIndex((t) => t.slice(0, 13) === nowKey);
    if (nowIdx === -1) nowIdx = 0;

    const current: CurrentConditions = {
      time: hTime[nowIdx],
      temperature: hourly[nowIdx]?.temperature ?? null,
      feelsLike: hourly[nowIdx]?.feelsLike ?? null,
      dewPoint: hourly[nowIdx]?.dewPoint ?? null,
      humidity: hourly[nowIdx]?.humidity ?? null,
      precipitation: hourly[nowIdx]?.precipitation ?? null,
      cloudCover: hourly[nowIdx]?.cloudCover ?? null,
      windSpeed: hourly[nowIdx]?.windSpeed ?? null,
      windDirection: hourly[nowIdx]?.windDirection ?? null,
      windGusts: hourly[nowIdx]?.windGusts ?? null,
      pressure: hourly[nowIdx]?.pressure ?? null,
      weatherCode: hourly[nowIdx]?.weatherCode ?? null,
      isDay: hourly[nowIdx]?.isDay ?? true,
      uvIndex: round(uvIndex[nowIdx], 1),
      visibility: round((visibility[nowIdx] ?? null) as number | null, 0),
    };

    const payload: WeatherResponse = {
      location: {
        name: name ?? "Current location",
        admin1,
        country: country ?? "",
        latitude: ensemble.latitude,
        longitude: ensemble.longitude,
        timezone: ensemble.timezone,
        utcOffsetSeconds,
      },
      current,
      hourly: hourly.slice(nowIdx, nowIdx + 48),
      daily,
      model: {
        primary: "Google WeatherNext 2 (AI ensemble, 64 members)",
        supplement: "Open-Meteo best-match blend",
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      // Intentionally NOT publicly/CDN-cacheable — this endpoint's response
      // varies entirely by lat/lon query params. A shared cache here (as
      // "public, max-age=300" previously was) risks serving one location's
      // forecast back for every other location, exactly like the earlier
      // /api/geocode bug. The upstream Open-Meteo fetches below already have
      // their own server-side, correctly-keyed caching for efficiency.
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to fetch weather" }, { status: 502 });
  }
}
