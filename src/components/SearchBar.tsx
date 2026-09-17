"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, LocateFixed, Loader2 } from "lucide-react";
import type { GeoResult } from "@/lib/types";

export function SearchBar({
  onSelect,
  onUseLocation,
  locating,
}: {
  onSelect: (result: GeoResult) => void;
  onUseLocation: () => void;
  locating: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border border-black/15 bg-white/45 px-4 py-2.5 backdrop-blur-md transition focus-within:border-black/30 focus-within:bg-white/60 dark:border-white/25 dark:bg-white/10 dark:focus-within:border-white/50 dark:focus-within:bg-white/15">
        <Search size={17} className="shrink-0 text-ink-900/60 dark:text-white/70" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a city…"
          className="w-full bg-transparent text-[15px] text-ink-900 placeholder-ink-900/50 outline-none dark:text-white dark:placeholder-white/60"
          aria-label="Search for a city"
        />
        <button
          type="button"
          onClick={onUseLocation}
          disabled={locating}
          aria-label="Use my current location"
          className="shrink-0 rounded-full p-1 text-ink-900/70 transition hover:text-ink-900 disabled:opacity-60 dark:text-white/80 dark:hover:text-white"
        >
          {locating ? <Loader2 size={17} className="animate-spin" /> : <LocateFixed size={17} />}
        </button>
      </div>

      {open && (query.trim().length >= 2) && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-80 overflow-y-auto rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-glass backdrop-blur-xl dark:border-white/15 dark:bg-ink-950/95">
          {searching && (
            <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-900/60 dark:text-white/60">
              <Loader2 size={14} className="animate-spin" /> Searching…
            </div>
          )}
          {!searching && results.length === 0 && (
            <div className="px-3 py-2.5 text-sm text-ink-900/60 dark:text-white/60">No matching places found.</div>
          )}
          {!searching &&
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  onSelect(r);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-ink-900/90 transition hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <MapPin size={15} className="shrink-0 text-ink-900/50 dark:text-white/50" />
                <span className="truncate">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-ink-900/50 dark:text-white/50">
                    {r.admin1 ? `, ${r.admin1}` : ""}
                    {r.country ? `, ${r.country}` : ""}
                  </span>
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
