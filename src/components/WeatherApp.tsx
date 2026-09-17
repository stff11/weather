"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { SkyBackground } from "./SkyBackground";
import { CurrentHero } from "./CurrentHero";
import { HourlyTimeline } from "./HourlyTimeline";
import { DailyForecast } from "./DailyForecast";
import { DetailsGrid } from "./DetailsGrid";
import { Footer } from "./Footer";
import { LoadingSkeleton } from "./Skeleton";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getSkyMood } from "@/lib/sky-theme";
import type { GeoResult, WeatherResponse } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

const STORAGE_KEY = "skycast:last-location";

const DEFAULT_LOCATION: GeoResult = {
  id: 0,
  name: "Bielsko-Biała",
  admin1: "Silesian Voivodeship",
  country: "Poland",
  latitude: 49.8224,
  longitude: 19.0444,
  timezone: "Europe/Warsaw",
};

function locationLabel(loc: GeoResult): string {
  const parts = [loc.name];
  if (loc.admin1 && loc.admin1 !== loc.name) parts.push(loc.admin1);
  if (loc.country) parts.push(loc.country);
  return parts.join(", ");
}

export function WeatherApp() {
  const [location, setLocation] = useState<GeoResult>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locate, loading: locating, error: geoError } = useGeolocation();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLocation(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  const fetchWeather = useCallback(async (loc: GeoResult) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: String(loc.latitude),
        lon: String(loc.longitude),
        name: loc.name,
        admin1: loc.admin1 ?? "",
        country: loc.country ?? "",
      });
      const res = await fetch(`/api/weather?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Couldn't load the forecast for this location.");
      const data: WeatherResponse = await res.json();
      setWeather(data);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(location);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } catch {
      /* ignore */
    }
  }, [location, fetchWeather]);

  const handleUseLocation = useCallback(async () => {
    const coords = await locate();
    if (!coords) return;
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${coords.latitude}&lon=${coords.longitude}`);
      const data = await res.json();
      setLocation({
        id: -1,
        name: data.name ?? "Your location",
        admin1: data.admin1,
        country: data.country ?? "",
        latitude: coords.latitude,
        longitude: coords.longitude,
        timezone: "auto",
      });
    } catch {
      setLocation({
        id: -1,
        name: "Your location",
        country: "",
        latitude: coords.latitude,
        longitude: coords.longitude,
        timezone: "auto",
      });
    }
  }, [locate]);

  const mood = getSkyMood(weather?.current.weatherCode, weather?.current.isDay ?? true);
  const today = weather?.daily[0];

  return (
    <div className="relative min-h-screen">
      <SkyBackground mood={mood} />

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
        <header className="flex items-center justify-between gap-4 px-6 pt-6 sm:px-10">
          <SearchBar onSelect={setLocation} onUseLocation={handleUseLocation} locating={locating} />
          <ThemeToggle />
        </header>

        {geoError && (
          <p className="mx-6 mt-3 flex items-center gap-1.5 text-[13px] text-ink-900/70 dark:text-white/70 sm:mx-10">
            <AlertTriangle size={13} /> {geoError}
          </p>
        )}

        <main className="flex-1">
          {loading && !weather && <LoadingSkeleton />}

          {error && !weather && (
            <div className="mx-6 mt-10 flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white/45 px-6 py-10 text-center text-ink-900 dark:border-white/15 dark:bg-white/10 dark:text-white sm:mx-10">
              <AlertTriangle size={22} />
              <p className="text-[15px]">{error}</p>
              <button
                onClick={() => fetchWeather(location)}
                className="rounded-full bg-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/20 dark:bg-white/20 dark:hover:bg-white/30"
              >
                Try again
              </button>
            </div>
          )}

          {weather && (
            <div className="flex flex-col gap-8 pb-4">
              <CurrentHero
                current={weather.current}
                today={today}
                locationLabel={locationLabel(location)}
                timezone={weather.location.timezone}
              />
              <HourlyTimeline hourly={weather.hourly} />
              <DailyForecast daily={weather.daily} />
              <DetailsGrid current={weather.current} today={today} />
            </div>
          )}
        </main>

        <Footer generatedAt={weather?.generatedAt} />
      </div>
    </div>
  );
}
