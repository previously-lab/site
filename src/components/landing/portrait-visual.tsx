"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export interface PortraitEntry {
  dim: string;
  text: string;
  refs: string;
}

export type HypothesisStatus = "proposed" | "promoted" | "retired";

export interface HypothesisItem {
  text: string;
  falsify: string;
  status: HypothesisStatus;
}

interface PortraitVisualProps {
  cardTitle: string;
  portraitLabel: string;
  entries: PortraitEntry[];
  hypothesesLabel: string;
  falsifyLabel: string;
  proposedLabel: string;
  promotedLabel: string;
  retiredLabel: string;
  promoteHint: string;
  hypotheses: HypothesisItem[];
}

const EASE = [0.25, 0.1, 0.25, 1] as const;
const EMERALD = "oklch(0.7 0.15 160)";

/** One full proposed → promoted → proposed loop, in seconds. */
const CYCLE = 9;
/** proposed 0–30% · promoted 30–70% · back to proposed by 100%. */
const TIMES = [0, 0.3, 0.7, 1];

const TINT_OFF = "oklch(0.7 0.15 160 / 0%)";
const TINT_ON = "oklch(0.7 0.15 160 / 9%)";
const GLOW_OFF = "0 0 0 0 oklch(0.7 0.15 160 / 0%)";
const GLOW_ON = "0 0 16px 0 oklch(0.7 0.15 160 / 22%)";

const CHIP =
  "inline-flex w-fit items-center rounded border px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.18em]";

/**
 * Act 4 visual — "A portrait of who you are."
 * A code-drawn direction.md file card in two halves: left is the
 * Portrait — six fixed dimensions, each entry carrying its `— refs:`
 * evidence tail; right is the Hypotheses pool. A proposed guess wears a
 * dashed border, a retired one fades out struck through, and one
 * hypothesis loops proposed → promoted → proposed: the emerald tint and
 * glow come up, the status chip crossfades, and the "into the portrait"
 * hint slides in — the promotion mechanism, on a restrained cycle.
 * Reduced motion renders the promoted end-state statically. All copy —
 * dimension names, entries, hypothesis texts, status labels — arrives
 * via props.
 */
export function PortraitVisual({
  cardTitle,
  portraitLabel,
  entries,
  hypothesesLabel,
  falsifyLabel,
  proposedLabel,
  promotedLabel,
  retiredLabel,
  promoteHint,
  hypotheses,
}: PortraitVisualProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const reduced = useReducedMotion();
  const live = isInView && !reduced;

  const loopTransition = live
    ? { duration: CYCLE, times: TIMES, repeat: Infinity, ease: "easeInOut" as const }
    : { duration: 0.3 };

  const statusLabel: Record<HypothesisStatus, string> = {
    proposed: proposedLabel,
    promoted: promotedLabel,
    retired: retiredLabel,
  };

  return (
    <div
      ref={ref}
      className="relative w-full max-w-xl"
      role="img"
      aria-label={`${cardTitle}: ${portraitLabel} / ${hypothesesLabel}`}
    >
      {/* Emerald stage glow behind the card — layered depth */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-3xl blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.7 0.15 160 / 12%) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="landing-glass relative rounded-xl border p-5 font-mono text-xs shadow-2xl shadow-black/50 backdrop-blur sm:p-6"
        style={{
          boxShadow: `0 0 0 1px oklch(0.7 0.15 160 / 8%), 0 25px 50px -12px oklch(0 0 0 / 50%)`,
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between">
          <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground/60">
            {cardTitle}
          </span>
          <motion.span
            className="size-1.5 rounded-full"
            style={{
              backgroundColor: EMERALD,
              boxShadow: `0 0 8px ${EMERALD}`,
            }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: [0, 1, 0.4, 1] } : { opacity: 0 }}
            transition={{ duration: 1.2, delay: 3.2 }}
            aria-hidden="true"
          />
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {/* Portrait — six dimensions, each evidence-anchored */}
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground/50">
              {portraitLabel}
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {entries.map((e, i) => (
                <motion.div
                  key={e.dim}
                  className="flex flex-col gap-0.5"
                  initial={{ opacity: 0, x: -6 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.22, ease: EASE }}
                >
                  <span className="text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground/60">
                    {e.dim}
                  </span>
                  <span className="leading-snug text-foreground/85">{e.text}</span>
                  <span className="text-[0.6rem] text-muted-foreground/45">{e.refs}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hypotheses — the falsifiable pool */}
          <div className="landing-border border-t pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground/50">
              {hypothesesLabel}
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              {hypotheses.map((h, i) => {
                const delay = 1.8 + i * 0.3;
                if (h.status === "promoted") {
                  /* The loop: proposed → promoted → proposed, forever. */
                  return (
                    <motion.div
                      key={h.text}
                      initial={{ opacity: 0, x: 6 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }}
                      transition={{ duration: 0.4, delay, ease: EASE }}
                    >
                      <motion.div
                        className="rounded-md border p-2.5"
                        style={{ borderColor: "oklch(0.7 0.15 160 / 45%)" }}
                        animate={
                          live
                            ? {
                                backgroundColor: [TINT_OFF, TINT_ON, TINT_ON, TINT_OFF],
                                boxShadow: [GLOW_OFF, GLOW_ON, GLOW_ON, GLOW_OFF],
                              }
                            : reduced
                              ? { backgroundColor: TINT_ON, boxShadow: GLOW_ON }
                              : { backgroundColor: TINT_OFF, boxShadow: GLOW_OFF }
                        }
                        transition={loopTransition}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="leading-snug text-foreground/85">{h.text}</span>
                          {/* Crossfading status chip: proposed ↔ promoted */}
                          <span className="relative shrink-0">
                            <motion.span
                              className={`${CHIP} landing-border border-dashed text-muted-foreground/70`}
                              animate={
                                live
                                  ? { opacity: [1, 0, 0, 1] }
                                  : { opacity: reduced ? 0 : 1 }
                              }
                              transition={loopTransition}
                            >
                              {proposedLabel}
                            </motion.span>
                            <motion.span
                              className={`${CHIP} absolute inset-0 justify-center`}
                              style={{
                                borderColor: "oklch(0.7 0.15 160 / 50%)",
                                backgroundColor: "oklch(0.7 0.15 160 / 10%)",
                                color: EMERALD,
                              }}
                              animate={
                                live
                                  ? { opacity: [0, 1, 1, 0] }
                                  : { opacity: reduced ? 1 : 0 }
                              }
                              transition={loopTransition}
                              aria-hidden={live}
                            >
                              {promotedLabel}
                            </motion.span>
                          </span>
                        </div>
                        <p className="mt-1.5 text-[0.6rem] text-muted-foreground/50">
                          {falsifyLabel} {h.falsify}
                        </p>
                        <motion.p
                          className="mt-1 text-[0.6rem]"
                          style={{ color: EMERALD }}
                          animate={
                            live
                              ? { opacity: [0, 1, 1, 0], x: [-4, 0, 0, -4] }
                              : { opacity: reduced ? 1 : 0, x: 0 }
                          }
                          transition={loopTransition}
                        >
                          {promoteHint}
                        </motion.p>
                      </motion.div>
                    </motion.div>
                  );
                }
                const retired = h.status === "retired";
                return (
                  <motion.div
                    key={h.text}
                    className={`landing-border rounded-md border p-2.5 ${
                      retired ? "" : "border-dashed"
                    }`}
                    initial={{ opacity: 0, x: 6 }}
                    animate={
                      isInView
                        ? { opacity: retired ? 0.45 : 1, x: 0 }
                        : { opacity: 0, x: 6 }
                    }
                    transition={{ duration: 0.4, delay, ease: EASE }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`leading-snug text-foreground/85 ${
                          retired ? "line-through decoration-muted-foreground/60" : ""
                        }`}
                      >
                        {h.text}
                      </span>
                      <span
                        className={`${CHIP} landing-border shrink-0 ${
                          retired
                            ? "text-muted-foreground/60 line-through"
                            : "border-dashed text-muted-foreground/70"
                        }`}
                      >
                        {statusLabel[h.status]}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[0.6rem] text-muted-foreground/50">
                      {falsifyLabel} {h.falsify}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
