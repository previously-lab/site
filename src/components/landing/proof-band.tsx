"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { NowDot } from "@/components/landing/now-dot";

export interface ProofSlice {
  date: string;
  label: string;
}

export interface ProofPick {
  name: string;
  price: string;
  reason: string;
}

interface ProofBandProps {
  caption: string;
  windowTitle: string;
  slices: ProofSlice[];
  nowLabel: string;
  userMsg: string;
  recallStep: string;
  agentMsg: string;
  turn2User: string;
  picks: ProofPick[];
  picksNote: string;
  /** Turn 2.5 — intentionally cut off by the pane's bottom fade. */
  turn3User: string;
}

/**
 * Product proof band — a code-drawn mock of the actual app UI (stylized
 * but faithful; to be replaced by a real screenshot later). Dark app
 * window: left timeline rail with slice ticks ending in the hollow NOW
 * dot, right chat pane with a visible inline "recalling…" step card.
 *
 * The page's "wow" moment: the mock sits on a real perspective plane,
 * tilted like a receding floor (~55°) and scroll-straightens toward
 * nearly flat as it reaches center viewport. The chat pane runs a real
 * 2.5-turn conversation — question, visible recall step, full reply,
 * a three-item pick list — with the half-typed third turn fading into
 * the bottom mask (write more, then hide). A soft brand glow beneath
 * parallaxes slower than the frame, like a reflection. Under reduced
 * motion the mock renders static and flat.
 */
export function ProofBand({
  caption,
  windowTitle,
  slices,
  nowLabel,
  userMsg,
  recallStep,
  agentMsg,
  turn2User,
  picks,
  picksNote,
  turn3User,
}: ProofBandProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  /* Small screens get a gentler tilt — the full 55° floor plane crops
     the frame edges at ~390px wide. */
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  /* Frame: tilted floor plane → nearly flat as it enters center */
  const rotateX = useTransform(scrollYProgress, [0, 1], isSmall ? [30, 3] : [55, 6]);
  const frameY = useTransform(scrollYProgress, [0, 1], isSmall ? [60, 0] : [120, 0]);
  /* Glow/reflection beneath: parallaxes slower than the frame */
  const glowY = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [0.25, 0.9, 1]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-5 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <motion.p
        className="max-w-xl text-balance text-center text-sm text-muted-foreground sm:text-base"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {caption}
      </motion.p>

      <div
        className="relative mt-10 w-full max-w-4xl"
        style={{ perspective: 1600 }}
      >
        {/* Brand glow / reflection beneath the frame */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-[6%] -bottom-[14%] h-[55%] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--glow-blue) 0%, var(--glow-blue-deep) 50%, transparent 75%)",
            ...(reducedMotion
              ? {}
              : { y: glowY, opacity: glowOpacity, scale: glowScale }),
          }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={
            reducedMotion
              ? undefined
              : {
                  rotateX,
                  y: frameY,
                  transformPerspective: 1600,
                  transformOrigin: "center 80%",
                }
          }
          className="landing-border relative overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/60"
          role="img"
          aria-label={caption}
        >
          {/* Window chrome */}
          <div className="landing-glass flex h-9 items-center gap-1.5 border-b px-4">
            <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden="true" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden="true" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" aria-hidden="true" />
            <span className="ml-2 font-mono text-[0.65rem] text-muted-foreground/60">
              {windowTitle}
            </span>
          </div>

          <div className="flex min-h-[320px]">
            {/* Left — timeline rail: narrow dates-only strip on mobile,
                labels appear from sm up */}
            <div className="landing-border relative w-14 shrink-0 border-r py-5 pl-3 pr-2 sm:w-44 sm:pl-6 sm:pr-3">
              <div
                className="absolute bottom-6 left-[0.95rem] top-6 w-px bg-foreground/15 sm:left-[1.92rem]"
                aria-hidden="true"
              />
              <ul className="relative space-y-5">
                {slices.map((slice) => (
                  <li key={slice.date} className="flex items-start gap-2.5">
                    <span
                      className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-foreground/50"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block font-mono text-[0.6rem] tabular-nums text-muted-foreground/70">
                        {slice.date}
                      </span>
                      <span className="hidden text-xs text-foreground/85 sm:block">
                        {slice.label}
                      </span>
                    </span>
                  </li>
                ))}
                <li className="flex items-center gap-1.5 sm:gap-2.5">
                  <NowDot size={9} className="-ml-[3px] shrink-0" />
                  <span className="font-mono text-[0.6rem] font-semibold text-[oklch(0.6_0.23_260)]">
                    {nowLabel}
                  </span>
                </li>
              </ul>
            </div>

            {/* Right — chat pane: a real 2.5-turn conversation. Written
                in full, then progressively disclosed — the pane fades the
                half-typed third turn into the bottom mask. */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex max-h-[26rem] flex-col gap-3 overflow-hidden [mask-image:linear-gradient(to_bottom,black_80%,transparent_99%)] sm:max-h-[30rem]">
                {/* Turn 1 — user asks, recall runs in the open */}
                <motion.div
                  className="ml-auto max-w-[75%] rounded-lg rounded-br-sm bg-muted px-3 py-2 text-xs text-foreground/90 sm:text-sm"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {userMsg}
                </motion.div>
                <motion.div
                  className="flex items-center gap-2 border-l-2 border-[oklch(0.6_0.23_260)] bg-[oklch(0.6_0.23_260)]/[0.07] px-3 py-2"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                >
                  <motion.span
                    className="size-2.5 shrink-0 rounded-full border-2 border-[oklch(0.6_0.23_260)] border-t-transparent"
                    animate={reducedMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[0.65rem] text-muted-foreground sm:text-xs">
                    {recallStep}
                  </span>
                </motion.div>
                <motion.div
                  className="mr-auto max-w-[85%] px-1 text-xs leading-relaxed text-foreground/85 sm:text-sm"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  {agentMsg}
                </motion.div>

                {/* Turn 2 — the pick list */}
                <motion.div
                  className="ml-auto max-w-[75%] rounded-lg rounded-br-sm bg-muted px-3 py-2 text-xs text-foreground/90 sm:text-sm"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  {turn2User}
                </motion.div>
                <motion.div
                  className="mr-auto max-w-[92%] space-y-1.5 px-1 font-mono text-[0.7rem] leading-relaxed sm:text-xs"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 1.15 }}
                >
                  {picks.map((pick) => (
                    <p key={pick.name}>
                      <span className="text-foreground/90">{pick.name}</span>
                      <span className="text-muted-foreground/60"> · {pick.price}</span>
                      <span className="text-muted-foreground/75"> · {pick.reason}</span>
                    </p>
                  ))}
                  <p className="pt-1 italic text-muted-foreground/60">{picksNote}</p>
                </motion.div>

                {/* Turn 2.5 — cut off by the fade, on purpose */}
                <motion.div
                  className="ml-auto max-w-[75%] rounded-lg rounded-br-sm bg-muted px-3 py-2 text-xs text-foreground/90 sm:text-sm"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 1.45 }}
                >
                  {turn3User}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
