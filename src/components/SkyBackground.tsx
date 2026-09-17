"use client";

import { useMemo } from "react";
import { SKY_GRADIENTS, isNightMood, type SkyMood } from "@/lib/sky-theme";
import clsx from "clsx";

export function SkyBackground({ mood }: { mood: SkyMood }) {
  const night = isNightMood(mood);
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 55,
        r: Math.random() * 1.1 + 0.3,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className={clsx("absolute inset-0 bg-gradient-to-b", SKY_GRADIENTS[mood])} />

      {night && (
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r}
              fill="white"
              className="animate-twinkle"
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}
        </svg>
      )}

      {/* Drifting cloud silhouettes for atmosphere / depth */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-[0.16]">
        <svg
          className="absolute bottom-0 left-0 h-full w-[200%] animate-drift-slow"
          viewBox="0 0 1600 300"
          preserveAspectRatio="xMidYMax slice"
          fill="none"
        >
          <path
            d="M0 220c60-40 140-40 200 0s140 40 200 0 140-40 200 0 140 40 200 0 140-40 200 0 140 40 200 0 140-40 200 0 140 40 200 0v80H0Z"
            fill="white"
          />
          <path
            d="M800 220c60-40 140-40 200 0s140 40 200 0 140-40 200 0 140 40 200 0 140-40 200 0 140 40 200 0 140-40 200 0v80H800Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="absolute inset-0 bg-grain mix-blend-overlay" />

      {/* Legibility scrims: the sky's own colour is driven by real weather/time of
         day, independent of the light/dark UI preference, so each theme gets its
         own uniform wash to guarantee readable contrast against any sky colour. */}
      <div className="absolute inset-0 bg-white/45 opacity-100 transition-opacity duration-300 dark:opacity-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 transition-opacity duration-300 dark:opacity-100" />
    </div>
  );
}
