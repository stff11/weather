"use client";

import { useCallback, useState } from "react";

interface Coords {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback((): Promise<Coords | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        setError("Geolocation isn't supported by this browser.");
        resolve(null);
        return;
      }
      setLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false);
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        (err) => {
          setLoading(false);
          setError(
            err.code === err.PERMISSION_DENIED
              ? "Location access was denied."
              : "Couldn't determine your location."
          );
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }, []);

  return { locate, loading, error };
}
