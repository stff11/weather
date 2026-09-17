# Skycast

A gorgeous, fast weather app built with Next.js (App Router), forecasting with
**Google DeepMind's WeatherNext 2** AI model.

## Why WeatherNext 2 via Open-Meteo, not the raw Google model

The [WeatherNext models](https://developers.google.com/weathernext/guides/models) themselves are
distributed as open-source model weights (GitHub) or as an enterprise offering on Vertex AI /
Gemini Enterprise Agent Platform that requires a Google Cloud allowlist, billing account, and
running your own inference jobs — not something a client-facing weather app can call directly
per request.

[Open-Meteo](https://open-meteo.com) ingests Google's published WeatherNext 2 output and re-serves
it through a free, keyless JSON API (`/v1/ensemble?models=google_weathernext2_ensemble`), which is
what this app calls. That gives you real WeatherNext 2 forecasts — 64-member global AI ensemble,
0.25° resolution, updated every 12 hours — with zero API keys and no billing setup, which is why
the app deploys to Netlify with no environment variables at all.

WeatherNext doesn't natively forecast a few fields (feels-like temperature, humidity, dew point at
2 m, precipitation probability, sunrise/sunset, UV index). For those, the app makes a second,
parallel call to Open-Meteo's standard forecast API and merges it in. This is clearly separated in
`src/app/api/weather/route.ts` and the UI credits both in the footer.

If your organization has Google Cloud / Vertex AI access to WeatherNext 2 directly, you can swap
the `ensembleUrl` fetch in that same file for a call to your Vertex AI endpoint — everything
downstream (aggregation, types, UI) stays the same shape.

## Stack

- **Next.js 14 App Router**, TypeScript, Tailwind CSS
- **next-themes** for light/dark mode (respects system preference, toggle in header)
- Custom hand-drawn SVG weather icon set (no icon-pack dependency)
- Zero required environment variables — all upstream APIs are free and keyless
- Route handlers proxy upstream calls (keeps the browser from needing CORS workarounds and lets
  you swap providers later without touching the frontend)

## Features

- Location search with autocomplete (Open-Meteo Geocoding API) + "use my location" (browser
  geolocation, reverse-geocoded via BigDataCloud)
- Current conditions hero with dynamic sky gradient that shifts by time of day and weather
- Rolling 30-hour timeline with a temperature trend line and precipitation-probability markers
- 10-day forecast with a min/max range bar per day
- Conditions grid: wind (speed/direction/gusts), humidity, dew point, UV index, pressure, cloud
  cover, visibility, sunrise/sunset, precipitation
- All units fixed to °C and km/h
- Light/dark theme, fully responsive down to small phones, reduced-motion friendly

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying to Netlify

This repo includes `netlify.toml` pre-configured with `@netlify/plugin-nextjs`. To deploy:

1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command and publish directory are already set via `netlify.toml` — just click **Deploy**.

No environment variables are required.

## Known caveats / things worth verifying after deploy

- The ensemble-member column naming convention (`{variable}_member01` … `_member64`) is based on
  Open-Meteo's documented pattern for other ensemble models; if Open-Meteo ever changes it for the
  WeatherNext model specifically, the aggregation in `src/lib/ensemble.ts` falls back gracefully
  but should be spot-checked against a live response.
- WeatherNext 2 updates twice a day (every 12 hours) at 6-hourly native resolution, interpolated to
  hourly by Open-Meteo — so hour-to-hour changes within a 6-hour window are smoothed, not the raw
  model output.
- Wind gusts, precipitation probability, sunrise/sunset, dew point at 2 m, and UV index come from
  Open-Meteo's general blended forecast (WeatherNext doesn't predict these directly), not from the
  AI ensemble itself.

## Daytime-weighted daily icons

Cloud cover isn't predicted directly by WeatherNext — it's derived from relative humidity at
different altitude bands. That derivation runs hot in coastal/maritime air: a damp overnight or
dawn air mass near the coast often reads as cloud even when nothing actually condensed. Most
weather apps (and Open-Meteo's own default daily `weather_code`) blend all 24 hours into one icon,
so a clear afternoon can get buried under a cloudy-sounding night.

`src/lib/daytime-condition.ts` instead derives each day's icon from **daylight hours only**,
computed from the hourly data already being fetched (no extra API calls): it averages cloud cover
across daytime hours to pick clear/mainly-clear/cloudy/overcast, and only shows rain/snow/fog if
it's persistent enough during the day to matter. Genuine hazards — thunderstorms, freezing rain,
heavy snow — are never suppressed this way, even if brief, since under-warning is worse than a
false cloud. The hourly timeline is untouched and still shows real per-hour conditions, night
included.
