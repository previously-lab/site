"use client";

import { useRef } from "react";
import { useInView, motion } from "motion/react";

/**
 * Screen 7 visual: a breathing/pulsing circle representing the agent
 * working asynchronously in the background. Day→night cycle arc above
 * the circle. Pure CSS + motion — no heavy rendering.
 */
export function BackgroundLoopVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center justify-center"
      role="img"
      aria-label="Agent continues working in the background while you're away"
    >
      {/* Day/night arc */}
      <svg
        viewBox="0 0 200 80"
        className="w-48 sm:w-56"
        aria-hidden="true"
      >
        {/* Arc path */}
        <motion.path
          d="M 10 75 Q 100 -10 190 75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
          strokeDasharray="1"
          strokeDashoffset="0"
        />

        {/* Sun icon — left */}
        <motion.circle
          cx="30"
          cy="60"
          r="8"
          className="fill-muted-foreground/20 stroke-muted-foreground/40"
          strokeWidth="1"
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        />

        {/* Moon icon — right */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          <circle cx="170" cy="60" r="7" className="fill-muted-foreground/15 stroke-muted-foreground/40" strokeWidth="1" />
          <circle cx="173" cy="58" r="5" className="fill-card" />
        </motion.g>

        {/* Small stars along the arc */}
        {[
          { x: 70, y: 50 },
          { x: 100, y: 42 },
          { x: 130, y: 48 },
        ].map((star, i) => (
          <motion.circle
            key={i}
            cx={star.x}
            cy={star.y}
            r="1"
            className="fill-muted-foreground/30"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: [0, 1, 0.5, 1] } : { opacity: 0 }}
            transition={{
              duration: 2,
              delay: 1.2 + i * 0.3,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        ))}
      </svg>

      {/* Breathing circle — the agent */}
      <motion.div
        className="relative mt-2 flex size-20 items-center justify-center rounded-full bg-[#0066FF]/10 sm:size-24"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isInView
            ? {
                scale: [0.95, 1.05, 0.95],
                opacity: 1,
              }
            : { scale: 0.8, opacity: 0 }
        }
        transition={
          isInView
            ? {
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.5, delay: 0.5 },
              }
            : {}
        }
      >
        {/* Inner core */}
        <motion.div
          className="size-8 rounded-full bg-[#0066FF]/30 sm:size-10"
          animate={
            isInView
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Center dot */}
        <div className="absolute size-2.5 rounded-full bg-[#0066FF] sm:size-3" aria-hidden="true" />
      </motion.div>

      {/* Subtle ring glow */}
      <motion.div
        className="absolute size-28 rounded-full border border-[#0066FF]/10 sm:size-32"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: [0.2, 0.5, 0.2] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        aria-hidden="true"
      />

      {/* Caption */}
      <motion.p
        className="mt-4 font-mono text-[0.65rem] text-muted-foreground/60 sm:text-xs"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 1.5 }}
      >
        I come after you&apos;re done.
      </motion.p>
    </div>
  );
}
