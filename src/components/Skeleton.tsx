"use client";

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse px-6 pb-10 pt-6 sm:px-10 sm:pt-10">
      <div className="h-4 w-40 rounded-full bg-black/10 dark:bg-white/20" />
      <div className="mt-2 h-3 w-28 rounded-full bg-black/10 dark:bg-white/10" />
      <div className="mt-10 flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-black/10 dark:bg-white/15" />
        <div className="h-20 w-40 rounded-2xl bg-black/10 dark:bg-white/15" />
      </div>
      <div className="mt-10 h-24 rounded-2xl bg-black/10 dark:bg-white/10" />
      <div className="mt-6 h-64 rounded-2xl bg-black/10 dark:bg-white/10" />
    </div>
  );
}
