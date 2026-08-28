import { Cloud, TerminalSquare, ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export interface GetStartedPath {
  /** Small pill over the card title — e.g. "推荐" / "早期预览". */
  badge: string;
  /** True for the recommended path — the badge gets the brand tint. */
  recommended?: boolean;
  title: string;
  body: string;
  cta: string;
  href: string;
}

export interface GetStartedSectionProps {
  eyebrow: string;
  title: string;
  body: string;
  cloud: GetStartedPath;
  local: GetStartedPath & {
    /** The two commands shown in the mini terminal. */
    commands: readonly string[];
    /** A dim comment line under the commands. */
    comment: string;
    /** Requirement / guidance bullets under the terminal. */
    notes: readonly string[];
  };
}

/**
 * Get-started band — the two ways to run Previously, side by side: cloud on
 * Vercel (the recommended path) and the local npm client (early preview).
 * Same glass-card language as the trust band; the local card carries a mini
 * terminal with the real install commands.
 */
export function GetStartedSection({
  eyebrow,
  title,
  body,
  cloud,
  local,
}: GetStartedSectionProps): React.ReactElement {
  return (
    <ScrollReveal className="relative flex w-full flex-col items-center justify-center px-5 py-16 sm:min-h-screen sm:px-6 sm:py-24 lg:px-8">
      {/* Centered text block — same rhythm as the acts */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-[oklch(0.6_0.23_260)]">
          <span
            aria-hidden="true"
            className="mr-3 inline-block h-px w-8 translate-y-[-3px] bg-[oklch(0.6_0.23_260)]/70"
          />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {body}
        </p>
      </div>

      <div className="mt-12 grid w-full max-w-5xl gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5">
        {/* ── Cloud · Vercel ─────────────────────────────── */}
        <PathCard path={cloud} icon={<Cloud className="size-5 text-[oklch(0.6_0.23_260)]" aria-hidden="true" />} />

        {/* ── Local · npm ────────────────────────────────── */}
        <div className="landing-glass group/card relative flex flex-col overflow-hidden rounded-xl border p-6 pt-7 backdrop-blur transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_36px_-8px_oklch(0.7_0.15_160_/_30%)]">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-[var(--landing-hairline)] transition-colors duration-300 group-hover/card:bg-[oklch(0.7_0.15_160)]"
          />
          <PathHeader
            path={local}
            icon={<TerminalSquare className="size-5 text-[oklch(0.7_0.15_160)]" aria-hidden="true" />}
          />

          {/* Mini terminal — the real install commands */}
          <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#0d1117]">
            <div className="relative flex items-center border-b border-white/10 px-3.5 py-2">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              </div>
              <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/40">
                terminal
              </span>
            </div>
            <div className="space-y-1 p-3.5 font-mono text-[11px] leading-relaxed">
              {local.commands.map((cmd) => (
                <p key={cmd} className="text-[#c9d1d9]">
                  <span className="mr-2 text-[#3fb950]">$</span>
                  {cmd}
                </p>
              ))}
              <p className="text-[#8b949e]">{local.comment}</p>
            </div>
          </div>

          {/* Requirements / guidance */}
          <ul className="mt-4 space-y-1.5">
            {local.notes.map((note) => (
              <li
                key={note}
                className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
              >
                <Check className="mt-0.5 size-3 shrink-0 text-[oklch(0.7_0.15_160)]" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>

          <PathCta path={local} />
        </div>
      </div>
    </ScrollReveal>
  );
}

function PathCard({
  path,
  icon,
}: {
  path: GetStartedPath;
  icon: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="landing-glass group/card relative flex flex-col overflow-hidden rounded-xl border p-6 pt-7 backdrop-blur transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_36px_-8px_oklch(0.6_0.23_260_/_35%)]">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[var(--landing-hairline)] transition-colors duration-300 group-hover/card:bg-[oklch(0.6_0.23_260)]"
      />
      <PathHeader path={path} icon={icon} />
      <PathCta path={path} />
    </div>
  );
}

function PathHeader({
  path,
  icon,
}: {
  path: GetStartedPath;
  icon: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <div className="flex items-center justify-between">
        {icon}
        <span
          className={
            path.recommended
              ? "rounded-full bg-[oklch(0.6_0.23_260)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[oklch(0.75_0.18_260)]"
              : "rounded-full border border-[oklch(0.7_0.15_160)]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[oklch(0.7_0.15_160)]"
          }
        >
          {path.badge}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
        {path.title}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {path.body}
      </p>
    </>
  );
}

function PathCta({ path }: { path: GetStartedPath }): React.ReactElement {
  return (
    <Link
      href={path.href}
      className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground"
    >
      {path.cta}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
