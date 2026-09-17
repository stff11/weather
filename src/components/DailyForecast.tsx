"use client";

import { useMemo } from "react";
import { WeatherIcon } from "./WeatherIcon";
import { formatWeekday, temp } from "@/lib/format";
import type { DailyPoint } from "@/lib/types";
import { Droplet } from "lucide-react";
import clsx from "clsx";

export function DailyForecast({ daily }: { daily: DailyPoint[] }) {
  const { globalMin, globalMax } = useMemo(() => {
    const mins = daily.map((d) => d.tempMin ?? 0);
    const maxs = daily.map((d) => d.tempMax ?? 0);
    return { globalMin: Math.min(...mins), globalMax: Math.max(...maxs) };
  }, [daily]);

  const range = Math.max(globalMax - globalMin, 1);

  return (
    <section aria-label="10-day forecast" className="px-6 sm:px-10">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-900/60 dark:text-white/60">
        10-day forecast
      </h2>
      <div className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md dark:divide-white/10 dark:border-white/12 dark:bg-white/[0.06]">
        {daily.map((d, i) => {
          const lo = d.tempMin ?? globalMin;
          const hi = d.tempMax ?? globalMax;
          const left = ((lo - globalMin) / range) * 100;
          const width = Math.max(((hi - lo) / range) * 100, 6);

          return (
            <div
              key={d.date}
              className="grid grid-cols-[64px_36px_1fr_auto] items-center gap-3 px-4 py-3.5 text-ink-900 dark:text-white sm:grid-cols-[110px_36px_1fr_auto] sm:gap-4 sm:px-5"
            >
              <span className="text-[15px] font-medium">
                {i === 0
                  ? `Today ${new Date(d.date).getDate()}`
                  : `${formatWeekday(d.date, { short: true })} ${new Date(d.date).getDate()}`}
              </span>

              <WeatherIcon code={d.weatherCode} isDay className="h-6 w-6 justify-self-center" />

              <div className="flex items-center gap-3">
                <span className="flex w-11 items-center gap-0.5 text-[12px] text-rain-700 dark:text-rain-300">
                  {(d.precipitationProbabilityMax ?? 0) >= 15 && (
                    <>
                      <Droplet size={10} className="fill-current" />
                      {d.precipitationProbabilityMax}%
                    </>
                  )}
                </span>
                <span className="w-8 text-right text-[14px] text-ink-900/55 dark:text-white/55">{temp(d.tempMin)}</span>
                <div className="relative h-1.5 flex-1 rounded-full bg-black/10 dark:bg-white/15">
                  <div
                    className={clsx(
                      "absolute h-full rounded-full bg-gradient-to-r from-rain-500 via-sun-300 to-sun-600"
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
              </div>

              <span className="w-8 text-right text-[15px] font-medium">{temp(d.tempMax)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
