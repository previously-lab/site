"use client";

/**
 * Ported from previously-lab/agent src/components/chat/phase-indicator.tsx @ 0601d19
 * (simplified port).
 *
 * The recall progress card for the playground: collapsible, spinner while the
 * recall colleague runs, a settled state when it finishes, and the exploration
 * trail (one line per tool it started) as the expandable detail. The kernel
 * component's streaming typewriter, elapsed timer, and error/interrupted
 * states are dropped — the playground only needs the static trail card with a
 * live "current line" subtitle while running.
 *
 * Adaptations: motion/react (the site ships the `motion` package), the site's
 * @/components/ui/card, and the playground brand CSS variables in place of the
 * kernel's brand palette classes.
 */

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Loader2 } from "lucide-react";

interface PhaseIndicatorProps {
  icon: ReactNode;
  label: string;
  /** True while the recall run is live — spinner + current-line subtitle. */
  running: boolean;
  /** The latest progress line, shown as the live subtitle while running. */
  currentLine?: string;
  /** The full exploration trail — the expandable detail, one line per tool. */
  lines: readonly string[];
  /** Extra classes on the container. */
  className?: string;
}

const EXPANDED_CONTENT_TRANSITION_MS = 200;

export function PhaseIndicator({
  icon,
  label,
  running,
  currentLine,
  lines,
  className,
}: PhaseIndicatorProps) {
  const hasExpandedDetails = lines.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldRenderExpandedContent, setShouldRenderExpandedContent] =
    useState(false);

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

      {/* Live subtitle — the current exploration line while running */}
      {running && (
        <div className="mt-1.5 pl-6.5">
          {currentLine ? (
            <span className="font-mono text-xs text-muted-foreground">
              {currentLine}
              <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-[var(--pg-brand)] align-middle" />
            </span>
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
