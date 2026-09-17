// WMO weather interpretation codes -> human label + icon family
// https://open-meteo.com/en/docs (WMO Weather interpretation codes)

export type SkyState =
  | "clear"
  | "mainly-clear"
  | "cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "freezing-drizzle"
  | "rain"
  | "freezing-rain"
  | "snow"
  | "snow-grains"
  | "rain-showers"
  | "snow-showers"
  | "thunderstorm"
  | "thunderstorm-hail";

export interface WeatherCodeInfo {
  label: string;
  state: SkyState;
  precipitation: "none" | "drizzle" | "rain" | "snow" | "mixed";
}

const CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { label: "Clear sky", state: "clear", precipitation: "none" },
  1: { label: "Mainly clear", state: "mainly-clear", precipitation: "none" },
  2: { label: "Partly cloudy", state: "cloudy", precipitation: "none" },
  3: { label: "Overcast", state: "overcast", precipitation: "none" },
  45: { label: "Fog", state: "fog", precipitation: "none" },
  48: { label: "Rime fog", state: "fog", precipitation: "none" },
  51: { label: "Light drizzle", state: "drizzle", precipitation: "drizzle" },
  53: { label: "Drizzle", state: "drizzle", precipitation: "drizzle" },
  55: { label: "Dense drizzle", state: "drizzle", precipitation: "drizzle" },
  56: { label: "Light freezing drizzle", state: "freezing-drizzle", precipitation: "mixed" },
  57: { label: "Freezing drizzle", state: "freezing-drizzle", precipitation: "mixed" },
  61: { label: "Light rain", state: "rain", precipitation: "rain" },
  63: { label: "Rain", state: "rain", precipitation: "rain" },
  65: { label: "Heavy rain", state: "rain", precipitation: "rain" },
  66: { label: "Light freezing rain", state: "freezing-rain", precipitation: "mixed" },
  67: { label: "Freezing rain", state: "freezing-rain", precipitation: "mixed" },
  71: { label: "Light snow", state: "snow", precipitation: "snow" },
  73: { label: "Snow", state: "snow", precipitation: "snow" },
  75: { label: "Heavy snow", state: "snow", precipitation: "snow" },
  77: { label: "Snow grains", state: "snow-grains", precipitation: "snow" },
  80: { label: "Light rain showers", state: "rain-showers", precipitation: "rain" },
  81: { label: "Rain showers", state: "rain-showers", precipitation: "rain" },
  82: { label: "Violent rain showers", state: "rain-showers", precipitation: "rain" },
  85: { label: "Light snow showers", state: "snow-showers", precipitation: "snow" },
  86: { label: "Heavy snow showers", state: "snow-showers", precipitation: "snow" },
  95: { label: "Thunderstorm", state: "thunderstorm", precipitation: "rain" },
  96: { label: "Thunderstorm with hail", state: "thunderstorm-hail", precipitation: "mixed" },
  99: { label: "Severe thunderstorm with hail", state: "thunderstorm-hail", precipitation: "mixed" },
};

export function describeWeatherCode(code: number | null | undefined): WeatherCodeInfo {
  if (code == null || !(code in CODE_MAP)) {
    // Defaulting an unrecognized/missing code to "clear sky" was itself part
    // of a real bug: it silently rendered as false sunshine. A neutral,
    // slightly-cloudy default is a safer failure mode than implying it's
    // sunny when we simply don't know.
    return { label: "—", state: "cloudy", precipitation: "none" };
  }
  return CODE_MAP[code];
}

export function windDirectionLabel(deg: number | null | undefined): string {
  if (deg == null || Number.isNaN(deg)) return "—";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

export function uvRiskLabel(uv: number | null | undefined): string {
  if (uv == null) return "—";
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

export function aqiPlaceholder() {
  return null;
}
