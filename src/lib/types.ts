export interface GeoResult {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

export interface HourlyPoint {
  time: string; // ISO local
  temperature: number | null;
  feelsLike: number | null;
  dewPoint: number | null;
  humidity: number | null;
  precipitationProbability: number | null;
  precipitation: number | null;
  cloudCover: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGusts: number | null;
  pressure: number | null;
  weatherCode: number | null;
  isDay: boolean;
  temperatureSpread?: [number, number] | null; // ensemble min/max
}

export interface DailyPoint {
  date: string; // yyyy-mm-dd
  tempMax: number | null;
  tempMin: number | null;
  tempMean: number | null;
  precipitationSum: number | null;
  precipitationProbabilityMax: number | null;
  precipitationHours: number | null;
  windSpeedMax: number | null;
  windDirectionDominant: number | null;
  windGustsMax: number | null;
  cloudCoverMean: number | null;
  daytimeCloudCover: number | null;
  pressureMean: number | null;
  uvIndexMax: number | null;
  weatherCode: number | null;
  sunrise: string | null;
  sunset: string | null;
  tempRange?: [number, number] | null; // ensemble min/max across all members & hours
}

export interface CurrentConditions {
  time: string;
  temperature: number | null;
  feelsLike: number | null;
  dewPoint: number | null;
  humidity: number | null;
  precipitation: number | null;
  cloudCover: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGusts: number | null;
  pressure: number | null;
  weatherCode: number | null;
  isDay: boolean;
  uvIndex: number | null;
  visibility: number | null;
}

export interface WeatherResponse {
  location: {
    name: string;
    admin1?: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utcOffsetSeconds: number;
  };
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  model: {
    primary: string;
    supplement: string;
  };
  generatedAt: string;
}
