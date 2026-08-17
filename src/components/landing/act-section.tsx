import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type ActLayout = "text-left" | "text-right" | "center";

/** Semantic accent per act: blue = time, amber = strands, emerald = evolution, rose = love. */
type ActAccent = "blue" | "amber" | "emerald" | "rose";

interface ActSectionProps {
  /** Mono-font act number, e.g. "01". */
  eyebrow: string;
  title: string;
  body: string;
  docsHref: string;
  docsLabel: string;
  visual: ReactNode;
  /**
   * Varied layouts so the three acts don't share one rhythm:
   * text-left (visual right), text-right (visual left), center (stacked).
   */
  layout?: ActLayout;
  accent?: ActAccent;
}

const ACCENT_TEXT: Record<ActAccent, string> = {
  blue: "text-[oklch(0.6_0.23_260)]",
  amber: "text-[oklch(0.7_0.12_85)]",
  emerald: "text-[oklch(0.7_0.15_160)]",
  rose: "text-[oklch(0.72_0.14_350)]",
};

const ACCENT_RULE: Record<ActAccent, string> = {
  blue: "bg-[oklch(0.6_0.23_260)]/70",
  amber: "bg-[oklch(0.7_0.12_85)]/70",
  emerald: "bg-[oklch(0.7_0.15_160)]/70",
  rose: "bg-[oklch(0.72_0.14_350)]/70",
};

const ACCENT_GLOW: Record<ActAccent, string> = {
  blue: "radial-gradient(ellipse at center, oklch(0.6 0.23 260 / 13%) 0%, oklch(0.21 0.09 267 / 6%) 50%, transparent 72%)",
  amber: "radial-gradient(ellipse at center, oklch(0.7 0.12 85 / 9%) 0%, transparent 68%)",
  emerald: "radial-gradient(ellipse at center, oklch(0.7 0.15 160 / 10%) 0%, transparent 68%)",
  rose: "radial-gradient(ellipse at center, oklch(0.72 0.14 350 / 9%) 0%, transparent 68%)",
};

/**
 * One act of the cold-open story: oversized mono eyebrow, huge headline,
 * 1–2 sentence body, semantic animated visual on a colored stage glow,
 * docs link. Server component — the visual slot carries client motion.
 */
export function ActSection({
  eyebrow,
  title,
  body,
  docsHref,
  docsLabel,
  visual,
  layout = "text-left",
  accent = "blue",
}: ActSectionProps): React.ReactElement {
  const textBlock = (
    <div className={cn(layout === "center" && "mx-auto max-w-2xl text-center")}>
      <p
        className={cn(
          "font-mono text-[0.65rem] uppercase tracking-[0.35em]",
          ACCENT_TEXT[accent],
        )}
      >
        <span
          aria-hidden="true"
          className={cn("mr-3 inline-block h-px w-8 translate-y-[-3px]", ACCENT_RULE[accent])}
        />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
        {body}
      </p>
      <div className="mt-6">
        <Link
          href={docsHref}
          className={cn(
            buttonVariants({ variant: "link", size: "default" }),
            "group gap-1.5 px-0 text-sm",
          )}
        >
          {docsLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );

  const visualBlock = (
    <div className="relative flex w-full items-center justify-center">
      {/* Colored stage glow behind the visual — layered depth */}
      <div
        aria-hidden="true"
        className="absolute inset-[-12%] rounded-full blur-3xl"
        style={{ background: ACCENT_GLOW[accent] }}
      />
      <div className="relative flex w-full justify-center">{visual}</div>
    </div>
  );

  return (
    <ScrollReveal className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
      {layout === "center" ? (
        <div className="flex w-full max-w-5xl flex-col items-center gap-12 sm:gap-16">
          {textBlock}
          <div className="flex w-full items-center justify-center">{visualBlock}</div>
        </div>
      ) : (
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {layout === "text-left" ? (
            <>
              {textBlock}
              {visualBlock}
            </>
          ) : (
            <>
              <div className="order-last lg:order-first">{visualBlock}</div>
              {textBlock}
            </>
          )}
        </div>
      )}
    </ScrollReveal>
  );
}
