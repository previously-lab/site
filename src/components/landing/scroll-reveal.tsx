"use client";

import { useRef, type ReactNode } from "react";
import { useInView, motion } from "motion/react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a section and fades it up when it scrolls into view.
 * Uses the project's existing motion/react dependency — no new packages.
 */
export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.section>
  );
}
