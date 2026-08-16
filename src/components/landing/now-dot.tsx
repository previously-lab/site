import { cn } from "@/lib/utils";

interface NowDotProps {
  className?: string;
  size?: number;
}

/**
 * The hollow NOW dot — the single visual motif of the landing page.
 * A brand-blue ring with an empty center: the present moment on the timeline.
 * Server-safe (no motion); wrap it in motion components where it animates.
 */
export function NowDot({ className, size = 10 }: NowDotProps): React.ReactElement {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0 rounded-full border-2 border-[oklch(0.6_0.23_260)] bg-transparent shadow-[0_0_8px_oklch(0.6_0.23_260_/_50%)]",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
