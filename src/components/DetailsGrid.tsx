"use client";

import {
  Droplets,
  Thermometer,
  Sun,
  Gauge,
  Eye,
  Wind,
  Cloud,
  Sunrise,
  Sunset,
} from "lucide-react";
import type { CurrentConditions, DailyPoint } from "@/lib/types";
import { windDirectionLabel, uvRiskLabel } from "@/lib/weather-code";
import { formatClock } from "@/lib/format";
import type { ReactNode } from "react";

function Readout({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-black/10 px-5 py-5 dark:border-white/10 sm:border-t sm:[&:nth-child(-n+3)]:border-t-0">
      <div className="flex items-center gap-2 text-ink-900/55 dark:text-white/55">
        {icon}
        <span className="text-[12.5px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="font-display text-[1.7rem] leading-none text-ink-900 dark:text-white">{value}</div>
      {sub && <div className="text-[13px] text-ink-900/55 dark:text-white/55">{sub}</div>}
    </div>
  );
}

export function DetailsGrid({
  current,
  today,
}: {
  current: CurrentConditions;
  today?: DailyPoint;
}) {
  return (
    <section aria-label="Weather details" className="px-6 sm:px-10">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-900/60 dark:text-white/60">
        Conditions
      </h2>
      <div className="grid grid-cols-2 divide-x divide-black/10 rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md dark:divide-white/10 dark:border-white/12 dark:bg-white/[0.06] sm:grid-cols-3">
        <Readout
          icon={<Wind size={15} />}
          label="Wind"
          value={`${current.windSpeed ?? "—"} km/h`}
          sub={`${windDirectionLabel(current.windDirection)} · gusts ${current.windGusts ?? "—"} km/h`}
        />
        <Readout
          icon={<Droplets size={15} />}
          label="Humidity"
          value={`${current.humidity ?? "—"}%`}
          sub={`Dew point ${current.dewPoint ?? "—"}°`}
        />
        <Readout
          icon={<Sun size={15} />}
          label="UV index"
          value={`${current.uvIndex ?? "—"}`}
          sub={uvRiskLabel(current.uvIndex)}
        />
        <Readout
          icon={<Gauge size={15} />}
          label="Pressure"
          value={`${current.pressure ?? "—"}`}
          sub="hPa at sea level"
        />
        <Readout
          icon={<Cloud size={15} />}
          label="Cloud cover"
          value={`${current.cloudCover ?? "—"}%`}
          sub={today ? `${today.precipitationSum ?? 0} mm expected today` : undefined}
        />
        <Readout
          icon={<Eye size={15} />}
          label="Visibility"
          value={current.visibility != null ? `${(current.visibility / 1000).toFixed(1)} km` : "—"}
        />
        <Readout
          icon={<Sunrise size={15} />}
          label="Sunrise"
          value={today?.sunrise ? formatClock(today.sunrise) : "—"}
        />
        <Readout
          icon={<Sunset size={15} />}
          label="Sunset"
          value={today?.sunset ? formatClock(today.sunset) : "—"}
        />
        <Readout
          icon={<Thermometer size={15} />}
          label="Precipitation"
          value={`${current.precipitation ?? 0} mm`}
          sub="in the last hour"
        />
      </div>
    </section>
  );
}
