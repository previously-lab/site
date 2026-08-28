"use client";

/**
 * Ported from previously-lab/agent src/components/chat/phase-indicator.tsx @ 0601d19
 * (simplified port).
 *
 * The recall progress card for the playground, with the kernel's streaming
 * subtitle behavior:
 * - While running, the subtitle shows the CURRENT line of the colleague's
 *   thinking/writing (single line, horizontal auto-scroll, blinking caret) —
 *   the thinking tone is dim mono, the writing tone is foreground (the
 *   kernel's subtitleTone), and it fades out shortly after the run settles.
 * - An elapsed-seconds counter sits in the header while running.
 * - After the run, the exploration trail (one line per tool it started) is
 *   the expandable detail.
 *
 * Adaptations: the site's `running` flag replaces the kernel's ToolRenderState
 * (no error/interrupted/denied states here), motion/react (the site ships the
 * `motion` package), the site's @/components/ui/card, and the playground brand
 * CSS variables in place of the kernel's brand palette classes. The kernel's
 * per-newline fade-in remount is dropped — the line updates in place.
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Loader2 } from "lucide-react";

interface PhaseIndicatorProps {
  icon: ReactNode;
  label: string;
  /** True while the recall run is live — spinner + streaming subtitle. */
  running: boolean;
  /**
   * The live subtitle line — the colleague's current thinking/writing line,
   * or its latest exploration progress line. Shown while running and fades
   * out shortly after the run settles (kernel behavior).
   */
  subtitle?: string;
  /**
   * Tone of the subtitle — "thinking" (dim mono, default) vs "answer"
   * (foreground), so the transition from thinking to writing is visible.
   */
  subtitleTone?: "thinking" | "answer";
  /** The full exploration trail — the expandable detail, one line per tool. */
  lines: readonly string[];
  /** Extra classes on the container. */
  className?: string;
}

const FADE_DELAY_MS = 2000;
const EXPANDED_CONTENT_TRANSITION_MS = 200;

export function PhaseIndicator({
  icon,
  label,
  running,
  subtitle,
  subtitleTone = "thinking",
  lines,
  className,
}: PhaseIndicatorProps) {
  const hasExpandedDetails = lines.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldRenderExpandedContent, setShouldRenderExpandedContent] =
    useState(false);

  // ── Streaming subtitle (ported from the kernel) ───────────────────────

  const [subtitleVisible, setSubtitleVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the end as the line grows.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [subtitle]);

  // Fade out the subtitle after the run settles.
  useEffect(() => {
    if (running) {
      setSubtitleVisible(true);
      return;
    }
    if (!subtitle) return;
    const id = window.setTimeout(() => setSubtitleVisible(false), FADE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [running, subtitle]);

  // ── Elapsed timer (ported from the kernel) ────────────────────────────

  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (startTimeRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        startTimeRef.current = null;
      }
      return;
    }
    if (startTimeRef.current === null) startTimeRef.current = Date.now();
    const interval = window.setInterval(() => {
      setElapsed(
        Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000),
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  // ── Expand / collapse ─────────────────────────────────────────────────

  // Only allow toggle after the run completes.
  const canToggle = hasExpandedDetails && !running;

  const handleToggle = useCallback(() => {
    if (!canToggle) return;
    if (!isExpanded) setShouldRenderExpandedContent(true);
    setIsExpanded(!isExpanded);
  }, [canToggle, isExpanded]);

  // Delay unmount of the Card DOM until the collapse animation finishes.
  useEffect(() => {
    if (!hasExpandedDetails) {
      setShouldRenderExpandedContent(false);
      return;
    }
    if (isExpanded) {
      setShouldRenderExpandedContent(true);
      return;
    }
    if (!shouldRenderExpandedContent) return;
    const timeoutId = window.setTimeout(() => {
      setShouldRenderExpandedContent(false);
    }, EXPANDED_CONTENT_TRANSITION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [hasExpandedDetails, isExpanded, shouldRenderExpandedContent]);

  const showSubtitle = subtitleVisible && (running || subtitle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={cn(
        "rounded-lg px-3 py-2.5",
        running && "bg-[var(--pg-brand-soft)]",
        canToggle && "cursor-pointer transition-colors hover:bg-muted/30",
        className,
      )}
      onClick={canToggle ? handleToggle : undefined}
      onKeyDown={
        canToggle
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle();
              }
            }
          : undefined
      }
      {...(canToggle && {
        role: "button",
        tabIndex: 0,
        "aria-expanded": isExpanded,
      })}
    >
      {/* Header row */}
      <div className="flex min-w-0 items-center gap-2">
        {/* Icon — spinner while running, then the caller's icon */}
        <span className="flex size-4 shrink-0 items-center justify-center text-[var(--pg-brand)]">
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
        </span>

        {/* Label */}
        <span className="min-w-0 truncate text-sm font-semibold text-foreground/90">
          {label}
        </span>

        {/* Elapsed (while running) */}
        {running && elapsed > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {elapsed}s
          </span>
        )}

        {/* Expand chevron */}
        {canToggle && (
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        )}
      </div>

      {/* Streaming subtitle — the current thinking/writing line, scrolling
          horizontally inside the card (kernel behavior) */}
      {showSubtitle && (
        <div className="mt-1.5 pl-6.5">
          {subtitle ? (
            <div
              ref={scrollRef}
              className="overflow-x-auto whitespace-nowrap"
              style={{ scrollbarWidth: "none" }}
            >
              <span
                className={cn(
                  "text-xs",
                  subtitleTone === "answer"
                    ? "text-foreground"
                    : "font-mono text-muted-foreground",
                )}
              >
                {subtitle}
                {running && (
                  <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-[var(--pg-brand)] align-middle" />
                )}
              </span>
            </div>
          ) : (
            <span className="inline-block h-3 w-32 animate-pulse rounded bg-[var(--pg-brand)]/10" />
          )}
        </div>
      )}

      {/* Expanded trail card */}
      {hasExpandedDetails && (
        <div
          aria-hidden={!isExpanded}
          inert={!isExpanded}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity,margin-top] motion-reduce:transition-none",
            isExpanded
              ? "mt-2 grid-rows-[1fr] opacity-100 duration-200 ease-out"
              : "pointer-events-none grid-rows-[0fr] opacity-0 duration-150 ease-out",
          )}
        >
          <div className="min-h-0">
            {shouldRenderExpandedContent && (
              <div className="pt-1.5 pb-1">
                <Card size="sm" className="ring-inset">
                  <CardContent className="max-h-80 overflow-auto">
                    <ul className="space-y-0.5">
                      {lines.map((line, i) => (
                        <li
                          key={i}
                          className="font-mono text-[11px] leading-relaxed text-muted-foreground"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
