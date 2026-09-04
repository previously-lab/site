import { Clock, Scale, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import {
  RepoVisual,
  RunVisual,
  OssVisual,
  type RepoVisualProps,
  type RunVisualProps,
  type OssVisualProps,
} from "@/components/landing/trust-visuals";
import { cn } from "@/lib/utils";

export type TrustIcon = "github" | "clock" | "scale";

export interface TrustCard {
  icon: TrustIcon;
  title: string;
  body: string;
  cta: string;
}

/** lucide-react no longer ships brand icons — inline GitHub mark instead. */
function GitHubMark({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const ICONS: Record<TrustIcon, React.ComponentType<{ className?: string }>> = {
  github: GitHubMark,
  clock: Clock,
  scale: Scale,
};

/** Per-card semantic accent: blue = repo/time, amber = away/durable, emerald = open/evolving. */
const ACCENTS: Record<
  TrustIcon,
  { icon: string; hairline: string; glow: string }
> = {
  github: {
    icon: "text-[oklch(0.6_0.23_260)]",
    hairline: "group-hover/card:bg-[oklch(0.6_0.23_260)]",
    glow: "hover:shadow-[0_0_36px_-8px_oklch(0.6_0.23_260_/_35%)]",
  },
  clock: {
    icon: "text-[oklch(0.7_0.12_85)]",
    hairline: "group-hover/card:bg-[oklch(0.7_0.12_85)]",
    glow: "hover:shadow-[0_0_36px_-8px_oklch(0.7_0.12_85_/_30%)]",
  },
  scale: {
    icon: "text-[oklch(0.7_0.15_160)]",
    hairline: "group-hover/card:bg-[oklch(0.7_0.15_160)]",
    glow: "hover:shadow-[0_0_36px_-8px_oklch(0.7_0.15_160_/_30%)]",
  },
};

/** Per-card link targets — fixed by design, not translated. */
const HREFS = [
  { href: siteConfig.githubUrl, external: true },
  { href: "/docs/architecture", external: false },
  { href: "/docs/getting-started", external: false },
] as const;

interface TrustBandProps {
  cards: TrustCard[];
  visuals: {
    repo: RepoVisualProps;
    run: RunVisualProps;
    oss: OssVisualProps;
  };
}

/**
 * Trust band — one screen, denser. Three glass cards, each a mini-story
 * with its own tiny animated visual (a slice being written into your
 * repo; a run surviving a closed tab; one git clone), its own semantic
 * accent, hover lift + hairline glow.
 */
export function TrustBand({ cards, visuals }: TrustBandProps): React.ReactElement {
  return (
    <ScrollReveal className="relative flex w-full flex-col items-center justify-center px-5 py-16 sm:min-h-svh sm:px-6 sm:py-24 lg:px-8">
      <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-3 sm:gap-5">
        {cards.slice(0, 3).map((card, i) => {
          const Icon = ICONS[card.icon] ?? GitHubMark;
          const accent = ACCENTS[card.icon] ?? ACCENTS.github;
          const target = HREFS[i];
          const linkClass =
            "mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground group";
          return (
            <div
              key={card.icon}
              className={cn(
                "landing-glass group/card relative flex flex-col overflow-hidden rounded-xl border p-6 pt-7 backdrop-blur",
                "transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1",
                accent.glow,
              )}
            >
              {/* Accent hairline along the top — lights up on hover */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 top-0 h-px bg-[var(--landing-hairline)] transition-colors duration-300",
                  accent.hairline,
                )}
              />
              <Icon className={cn("size-5", accent.icon)} aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {card.body}
              </p>
              {/* The mini-story visual */}
              <div className="landing-inset mt-5 rounded-lg border p-3">
                {i === 0 && <RepoVisual {...visuals.repo} />}
                {i === 1 && <RunVisual {...visuals.run} />}
                {i === 2 && <OssVisual {...visuals.oss} />}
              </div>
              {target.external ? (
                <a
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {card.cta}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              ) : (
                <Link href={target.href} className={linkClass}>
                  {card.cta}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </ScrollReveal>
  );
}
