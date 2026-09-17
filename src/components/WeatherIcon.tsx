"use client";

import { describeWeatherCode } from "@/lib/weather-code";

function Sun() {
  return (
    <g>
      <circle cx="24" cy="24" r="9" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 24 + Math.cos(angle) * 14;
        const y1 = 24 + Math.sin(angle) * 14;
        const x2 = 24 + Math.cos(angle) * 18.5;
        const y2 = 24 + Math.sin(angle) * 18.5;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={2.75}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function Moon() {
  return (
    <path
      d="M31 15.5c-6.6 1-11.5 6.7-11.5 13.5 0 7.6 6.1 13.7 13.7 13.7 3 0 5.8-1 8-2.6-2 .8-4.2 1.2-6.5 1.2-9.4 0-17-7.6-17-17 0-3.7 1.2-7.1 3.2-9.9-3.6 2.4-6 6.6-6 11.3 0 7.5 6.1 13.6 13.6 13.6 5.6 0 10.4-3.4 12.5-8.2-1.6-.3-3.3-.5-5-.5.7-1.5 1.2-3.1 1.4-4.8-.6-.1-1.2-.2-1.9-.3z"
      fill="currentColor"
      opacity="0"
    />
  );
}

function MoonSimple({ className }: { className?: string }) {
  return (
    <path
      className={className}
      d="M29.5 14a13 13 0 1 0 6 24.4A15 15 0 0 1 25 24c0-4 1.6-7.7 4.5-10.4Z"
      fill="currentColor"
    />
  );
}

function Cloud({ y = 20, scale = 1, opacity = 1 }: { y?: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(24 ${y}) scale(${scale})`} opacity={opacity}>
      <path
        d="M-16 6c0-4.4 3.6-8 8-8 1 0 2 .2 2.9.5C-3.8 -6 .3-9 5-9c5.8 0 10.6 4.4 11.2 10 3.3.7 5.8 3.6 5.8 7.1 0 4-3.3 7.3-7.3 7.3H-9.5c-3.6 0-6.5-2.9-6.5-6.5 0-3.1 2.1-5.7 5-6.4Z"
        fill="currentColor"
      />
    </g>
  );
}

function RainDrops({ count = 3, y = 34 }: { count?: number; y?: number }) {
  const xs = count === 3 ? [-9, 1, 11] : [-13, -3, 7, 17];
  return (
    <g>
      {xs.map((x, i) => (
        <line
          key={i}
          x1={x + 24}
          y1={y}
          x2={x + 24 - 3}
          y2={y + 7}
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="text-rain-500 dark:text-rain-300"
          opacity={0.5 + (i % 2) * 0.3}
        />
      ))}
    </g>
  );
}

function SnowDots({ count = 3, y = 35 }: { count?: number; y?: number }) {
  const xs = count === 3 ? [-9, 1, 11] : [-13, -3, 7, 17];
  return (
    <g>
      {xs.map((x, i) => (
        <circle key={i} cx={x + 24} cy={y + (i % 2 === 0 ? 0 : 5)} r={1.8} fill="currentColor" opacity={0.85} />
      ))}
    </g>
  );
}

function Bolt() {
  return (
    <path
      d="M27 27l-8 12h6l-3 8 10-13h-6l3-7Z"
      fill="currentColor"
      className="text-sun-500"
    />
  );
}

function FogLines() {
  return (
    <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" opacity={0.7}>
      <line x1="9" y1="22" x2="39" y2="22" />
      <line x1="13" y1="28" x2="35" y2="28" />
      <line x1="9" y1="34" x2="39" y2="34" />
    </g>
  );
}

export function WeatherIcon({
  code,
  isDay = true,
  className,
}: {
  code: number | null | undefined;
  isDay?: boolean;
  className?: string;
}) {
  const info = describeWeatherCode(code);
  const size = className?.includes("h-") ? undefined : 48;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {info.state === "clear" && (isDay ? <Sun /> : <MoonSimple />)}

      {info.state === "mainly-clear" && (
        <>
          {isDay ? (
            <g transform="translate(-6 -4)">
              <Sun />
            </g>
          ) : (
            <g transform="translate(-6 -4)">
              <MoonSimple />
            </g>
          )}
          <Cloud y={26} scale={0.85} />
        </>
      )}

      {(info.state === "cloudy" || info.state === "overcast") && (
        <>
          <Cloud y={14} scale={0.7} opacity={0.55} />
          <Cloud y={22} scale={1} />
        </>
      )}

      {info.state === "fog" && <FogLines />}

      {(info.state === "drizzle" || info.state === "rain") && (
        <>
          <Cloud y={16} scale={0.95} />
          <RainDrops count={info.state === "drizzle" ? 3 : 4} />
        </>
      )}

      {(info.state === "freezing-drizzle" || info.state === "freezing-rain") && (
        <>
          <Cloud y={16} scale={0.95} />
          <RainDrops count={3} />
          <SnowDots count={3} y={38} />
        </>
      )}

      {(info.state === "snow" || info.state === "snow-grains") && (
        <>
          <Cloud y={16} scale={0.95} />
          <SnowDots count={4} />
        </>
      )}

      {(info.state === "rain-showers") && (
        <>
          {isDay && <g transform="translate(-8 -6) scale(0.6)"><Sun /></g>}
          <Cloud y={17} scale={0.95} />
          <RainDrops count={4} />
        </>
      )}

      {info.state === "snow-showers" && (
        <>
          {isDay && <g transform="translate(-8 -6) scale(0.6)"><Sun /></g>}
          <Cloud y={17} scale={0.95} />
          <SnowDots count={4} />
        </>
      )}

      {(info.state === "thunderstorm" || info.state === "thunderstorm-hail") && (
        <>
          <Cloud y={14} scale={1} />
          <Bolt />
          <RainDrops count={3} y={38} />
        </>
      )}
    </svg>
  );
}
