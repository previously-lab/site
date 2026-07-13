/**
 * Loading skeleton shown during doc page transitions (Turbopack / streaming).
 */
export default function DocLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Loading documentation">
      {/* Title */}
      <div className="h-8 w-2/3 rounded bg-muted" />

      {/* Description line */}
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-11/12 rounded bg-muted" />

      {/* Section heading */}
      <div className="mt-8 h-6 w-1/3 rounded bg-muted" />

      {/* Body lines */}
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-10/12 rounded bg-muted" />
      <div className="h-4 w-4/5 rounded bg-muted" />
      <div className="h-4 w-9/12 rounded bg-muted" />

      {/* Another heading */}
      <div className="mt-8 h-6 w-1/2 rounded bg-muted" />

      {/* More body */}
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-4 w-5/6 rounded bg-muted" />

      <span className="sr-only">Loading documentation content...</span>
    </div>
  );
}
