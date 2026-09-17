"use client";

import { WeatherIcon } from "./WeatherIcon";
import { describeWeatherCode } from "@/lib/weather-code";
import { temp } from "@/lib/format";
import type { CurrentConditions, DailyPoint } from "@/lib/types";

export function CurrentHero({
  current,
  today,
  locationLabel,
  timezone,
}: {
  current: CurrentConditions;
  today?: DailyPoint;
  locationLabel: string;
  timezone: string;
}) {
  const info = describeWeatherCode(current.weatherCode);
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="animate-rise px-6 pb-10 pt-6 sm:px-10 sm:pt-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-sans text-[15px] font-semibold uppercase tracking-wide text-ink-900/70 dark:text-white/70">
            {locationLabel}
          </h1>
          <p className="mt-0.5 text-sm text-ink-900/55 dark:text-white/55">{dateLabel}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <WeatherIcon code={current.weatherCode} isDay={current.isDay} className="h-20 w-20 text-ink-900 dark:text-white sm:h-24 sm:w-24" />
          <div>
            <div className="font-display text-[5.5rem] font-medium leading-none tracking-tight text-ink-900 dark:text-white sm:text-[7rem]">
              {temp(current.temperature)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:items-end">
          <p className="text-xl font-medium text-ink-900 dark:text-white">{info.label}</p>
          <p className="text-[15px] text-ink-900/70 dark:text-white/70">
            Feels like {temp(current.feelsLike)}
            {today && (
              <>
                {" · "}
                H:{temp(today.tempMax)} L:{temp(today.tempMin)}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
