"use client";

import { useMemo } from "react";
import { WeatherIcon } from "./WeatherIcon";
import { formatHour, temp } from "@/lib/format";
import type { HourlyPoint } from "@/lib/types";
import { Droplet } from "lucide-react";

const ITEM_WIDTH = 66;
const CHART_HEIGHT = 56;
const CHART_TOP_PAD = 10;

export function HourlyTimeline({ hourly }: { hourly: HourlyPoint[] }) {
  const points = hourly.slice(0, 30);

  const path = useMemo(() => {
    const temps = points.map((p) => p.temperature ?? 0);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = Math.max(max - min, 1);
    return points
      .map((p, i) => {
        const x = i * ITEM_WIDTH + ITEM_WIDTH / 2;
        const t = p.temperature ?? min;
        const norm = (t - min) / range;
        const y = CHART_TOP_PAD + (1 - norm) * (CHART_HEIGHT - CHART_TOP_PAD * 2);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [points]);

  return (
    <section aria-label="Hourly forecast" className="px-6 sm:px-10">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-900/60 dark:text-white/60">
        Next 30 hours
      </h2>
      <div className="scrollbar-none overflow-x-auto rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md dark:border-white/12 dark:bg-white/[0.06]">
        <div className="relative" style={{ width: points.length * ITEM_WIDTH }}>
          <svg
            className="pointer-events-none absolute left-0 top-2 text-sun-600/70 dark:text-sun-300/70"
            width={points.length * ITEM_WIDTH}
            height={CHART_HEIGHT}
          >
            <path d={path} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
          </svg>

          <div className="relative flex pt-[68px]">
            {points.map((p, i) => (
              <div
                key={p.time}
                style={{ width: ITEM_WIDTH }}
                className="flex flex-col items-center gap-1.5 py-4 text-ink-900 dark:text-white"
              >
                <span className="text-[13px] text-ink-900/65 dark:text-white/65">{i === 0 ? "Now" : formatHour(p.time)}</span>
                <WeatherIcon code={p.weatherCode} isDay={p.isDay} className="h-7 w-7" />
                <span className="text-[15px] font-medium">{temp(p.temperature)}</span>
                <span className="flex h-4 items-center gap-0.5 text-[11px] text-rain-700 dark:text-rain-300">
                  {(p.precipitationProbability ?? 0) >= 15 && (
                    <>
                      <Droplet size={10} className="fill-current" />
                      {p.precipitationProbability}%
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
