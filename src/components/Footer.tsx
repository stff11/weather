"use client";

export function Footer({ generatedAt }: { generatedAt?: string }) {
  const time = generatedAt
    ? new Date(generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <footer className="px-6 py-8 text-center text-[12.5px] text-ink-900/50 dark:text-white/45 sm:px-10">
      <p>
        Forecast by Google DeepMind's WeatherNext 2 AI model, via Open-Meteo.
        {time && <> Updated {time}.</>}
      </p>
    </footer>
  );
}
