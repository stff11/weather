import { describeWeatherCode } from "./weather-code";

export type SkyMood = "day-clear" | "day-cloudy" | "day-storm" | "night-clear" | "night-cloudy" | "night-storm";

export function getSkyMood(code: number | null | undefined, isDay: boolean): SkyMood {
  const info = describeWeatherCode(code);
  const stormy =
    info.state === "thunderstorm" ||
    info.state === "thunderstorm-hail" ||
    info.state === "rain" ||
    info.state === "rain-showers" ||
    info.state === "freezing-rain";
  const cloudy = info.state === "cloudy" || info.state === "overcast" || info.state === "fog" || info.state === "snow" || info.state === "snow-showers";

  if (isDay) {
    if (stormy) return "day-storm";
    if (cloudy) return "day-cloudy";
    return "day-clear";
  }
  if (stormy) return "night-storm";
  if (cloudy) return "night-cloudy";
  return "night-clear";
}

// Tailwind-friendly gradient class stacks per mood. Two stops for a soft
// atmospheric wash; kept as literal strings so Tailwind's compiler can see them.
export const SKY_GRADIENTS: Record<SkyMood, string> = {
  "day-clear": "from-[#4FA6F7] via-[#7FC1FF] to-[#BFE3FF]",
  "day-cloudy": "from-[#7A8CA8] via-[#9FB0C8] to-[#C7D2E1]",
  "day-storm": "from-[#3A4A66] via-[#57708F] to-[#7C93AC]",
  "night-clear": "from-[#0B1220] via-[#152038] to-[#233252]",
  "night-cloudy": "from-[#111826] via-[#1D2A40] to-[#2C3B54]",
  "night-storm": "from-[#0A0E17] via-[#141C2C] to-[#202A3C]",
};

export function isNightMood(mood: SkyMood): boolean {
  return mood.startsWith("night");
}
