"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { BriefingCard, type BriefingData } from "@/components/landing/briefing-card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  line1: string;
  /** The emphasized word — expected to end with "." (rendered in brand blue). */
  line2: string;
  briefing: BriefingData;
  /** Mono MM/DD dates of the story beats — the strip is a compressed
      preview of the Act 1 timeline. */
  beatDates: string[];
  earlierLabel: string;
  nowLabel: string;
  ctaDemo: string;
  ctaGithub: string;
  ctaDocs: string;
  demoUrl: string;
  githubUrl: string;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;

/** Strand color per beat — friends/amber/emerald/rose/grey/rose/blue. */
const BEAT_COLORS = [
  "oklch(0.6 0.23 260)",
  "oklch(0.7 0.12 85)",
  "oklch(0.7 0.15 160)",
  "oklch(0.72 0.14 350)",
  "oklch(0.556 0 0)",
  "oklch(0.72 0.14 350)",
  "oklch(0.6 0.23 260)",
] as const;
/** Beat x positions along the 640-wide strip (16→600 is the spine). */
const BEAT_X = [60, 111, 208, 323, 441, 530, 560] as const;
/** Only a few beats carry a text label — the rest are dots. */
const LABELED = new Set([0, 3, 5, 6]);

/**
 * Act 0 — the cold open. Giant "Previously on / you." headline over a
 * brand-scale aurora, then the arrival briefing card typing itself out —
 * floating gently, with a springed pointer-follow tilt on fine pointers.
 * A thin timeline strip — strand-colored slice dots for the story beats,
 * a traveling beam, the hollow NOW dot — anchors the composition as a
 * compressed preview of Act 1. Staggered entrance, top to bottom.
 */
export function HeroSection({
  line1,
  line2,
  briefing,
  beatDates,
  earlierLabel,
  nowLabel,
  ctaDemo,
  ctaGithub,
  ctaDocs,
  demoUrl,
  githubUrl,
}: HeroSectionProps): React.ReactElement {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true });
  const reducedMotion = useReducedMotion();

  /* Pointer-follow tilt — fine pointers (mouse) only, never on touch */
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);
  const tiltActive = finePointer && !reducedMotion;
  const rawRX = useMotionValue(0);
  const rawRY = useMotionValue(0);
  const tiltRX = useSpring(rawRX, { stiffness: 120, damping: 16, mass: 0.4 });
  const tiltRY = useSpring(rawRY, { stiffness: 120, damping: 16, mass: 0.4 });

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawRX.set(-py * 7);
    rawRY.set(px * 7);
  };
  const resetTilt = () => {
    rawRX.set(0);
    rawRY.set(0);
  };

  const word = line2.endsWith(".") ? line2.slice(0, -1) : line2;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-16 text-center sm:px-6 lg:px-8">
      {/* Headline — type carries the emotion, over a brand aurora */}
      <div className="relative">
        <motion.div
          aria-hidden="true"
          className="absolute -inset-x-[20%] -bottom-[30%] top-[30%] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--glow-blue) 0%, var(--glow-blue-deep) 50%, transparent 72%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.6 }}
        />
        <h1 className="relative text-5xl leading-[0.95] tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
          <motion.span
            className="block font-light text-foreground/80"
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          >
            {line1}
          </motion.span>
          <motion.span
            className="block font-semibold text-foreground"
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          >
            {word}
            <span className="text-[oklch(0.6_0.23_260)]">.</span>
          </motion.span>
        </h1>
      </div>

      {/* Centerpiece — the arrival briefing types itself out, floating */}
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="mt-10 w-full max-w-xl sm:mt-12"
      >
        <motion.div
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
          style={
            tiltActive
              ? {
                  rotateX: tiltRX,
                  rotateY: tiltRY,
                  transformPerspective: 1200,
                }
              : undefined
          }
        >
          <BriefingCard data={briefing} delay={1.2} />
        </motion.div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1, ease: EASE }}
      >
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          {ctaDemo}
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full sm:w-auto",
          )}
        >
          {ctaGithub}
        </a>
        <Link
          href="/docs"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "w-full sm:w-auto",
          )}
        >
          {ctaDocs}
        </Link>
      </motion.div>

      {/* Timeline strip — a compressed preview of the Act 1 timeline:
          strand-colored slice dots, a few mono dates, hollow NOW dot */}
      <div ref={lineRef} className="relative mt-12 w-full max-w-3xl sm:mt-16" aria-hidden="true">
        <svg viewBox="0 0 640 40" fill="none" className="w-full">
          <motion.line
            x1={16}
            y1={20}
            x2={600}
            y2={20}
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/25"
            initial={{ pathLength: 0 }}
            animate={lineInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.4, delay: 1.6, ease: "easeInOut" }}
          />
          {BEAT_X.map((x, i) => (
            <motion.g
              key={x}
              initial={{ opacity: 0, scale: 0 }}
              animate={lineInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.35, delay: 2.4 + i * 0.12, ease: EASE }}
              style={{ transformOrigin: `${x}px 20px` }}
            >
              <circle cx={x} cy={20} r={6} fill={BEAT_COLORS[i]} opacity={0.18} />
              <circle cx={x} cy={20} r={2.5} fill={BEAT_COLORS[i]} opacity={0.9} />
              {LABELED.has(i) && (
                <text
                  x={x}
                  y={36}
                  textAnchor={i === 0 ? "start" : i === BEAT_X.length - 1 ? "end" : "middle"}
                  className="fill-muted-foreground/50 font-mono text-[8px] tabular-nums"
                >
                  {beatDates[i] ?? ""}
                </text>
              )}
            </motion.g>
          ))}
          <motion.text
            x={16}
            y={12}
            className="fill-muted-foreground/50 font-mono text-[8px]"
            initial={{ opacity: 0 }}
            animate={lineInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 2.2 }}
          >
            {earlierLabel}
          </motion.text>
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={lineInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: 3.4 }}
            style={{ transformOrigin: "600px 20px" }}
          >
            <circle cx={600} cy={20} r={5} fill="none" stroke="oklch(0.6 0.23 260)" strokeWidth="1.5" />
            <text x={600} y={36} textAnchor="middle" className="fill-foreground font-mono text-[8px] font-semibold">
              {nowLabel}
            </text>
          </motion.g>
        </svg>
        {/* Traveling beam along the spine (alpha 0.05 → 0.65 → 0.05) */}
        <div className="absolute inset-x-[2.5%] top-1/2 h-px overflow-visible">
          <div
            className="landing-beam h-px w-[18%]"
            style={{
              background:
                "linear-gradient(to right, transparent, oklch(0.6 0.23 260), transparent)",
              boxShadow: "0 0 8px oklch(0.6 0.23 260 / 60%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
