"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

interface FinaleSectionProps {
  title: string;
  subtitle: string;
  ctaDemo: string;
  ctaGithub: string;
  githubUrl: string;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;
const BLUE = "oklch(0.6 0.23 260)";

/**
 * Finale — the loop back to the cold open, and the brightest point of
 * the page: the aurora peaks behind the tagline while the hollow NOW
 * dot sends expanding pulse rings across the timeline line, then rests.
 */
export function FinaleSection({
  title,
  subtitle,
  ctaDemo,
  ctaGithub,
  githubUrl,
}: FinaleSectionProps): React.ReactElement {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-5 text-center sm:px-6 lg:px-8"
    >
      {/* Aurora peak — the brightest glow on the page */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[70vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-blue) 0%, var(--glow-blue-deep) 45%, transparent 72%)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.8, delay: 0.6, ease: EASE }}
      />
      {/* second layer — the finale is the brightest point of the page */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[40vh] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-blue) 0%, transparent 70%)",
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.4, delay: 1.0, ease: EASE }}
      />

      {/* Timeline line with the NOW dot pulsing at its center */}
      <div className="relative w-full max-w-2xl" aria-hidden="true">
        <svg viewBox="0 0 640 44" fill="none" className="w-full">
          <motion.line
            x1={20}
            y1={22}
            x2={620}
            y2={22}
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/25"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <motion.g
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
          >
            {/* expanding pulse rings — one volley, then rest */}
            {[0, 0.45, 0.9].map((offset) => (
              <motion.circle
                key={offset}
                cx={320}
                cy={22}
                r={6}
                fill="none"
                stroke={BLUE}
                strokeWidth="1"
                initial={{ scale: 0.6, opacity: 0.9 }}
                animate={isInView ? { scale: 3.2, opacity: 0 } : {}}
                transition={{ duration: 1.6, delay: 1.2 + offset, ease: "easeOut" }}
                style={{ transformOrigin: "320px 22px" }}
              />
            ))}
            <circle
              cx={320}
              cy={22}
              r={5}
              fill="none"
              stroke={BLUE}
              strokeWidth="1.5"
              style={{ filter: "drop-shadow(0 0 6px oklch(0.6 0.23 260 / 90%))" }}
            />
          </motion.g>
        </svg>
      </div>

      <motion.h2
        className="relative mt-8 text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
      >
        {title}
      </motion.h2>

      <motion.p
        className="relative mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.5, ease: EASE }}
      >
        {subtitle}
      </motion.p>

      <motion.div
        className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.8, ease: EASE }}
      >
        <a
          href={siteConfig.demoUrl}
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
      </motion.div>
    </section>
  );
}
