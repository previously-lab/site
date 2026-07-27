"use client";

import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { NameCycler } from "@/components/landing/name-cycler";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useRef } from "react";
import { useInView } from "motion/react";

interface HeroSectionProps {
  ctaDemo: string;
  ctaDocs: string;
  ctaGithub: string;
  demoUrl: string;
  githubUrl: string;
}

/**
 * Hero screen — kept visually identical to the existing Hero in page.tsx,
 * with one enhancement: a subtle animated horizontal line below the title
 * that foreshadows the timeline motif throughout the rest of the page.
 */
export function HeroSection({
  ctaDemo,
  ctaDocs,
  ctaGithub,
  demoUrl,
  githubUrl,
}: HeroSectionProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true });

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
      <div aria-hidden="true">
        <TextGenerateEffect
          words="Previously on"
          className="text-6xl font-light leading-none tracking-tighter text-foreground sm:text-7xl md:text-8xl lg:text-9xl"
          filter
          duration={0.5}
          delay={0.3}
          staggerDelay={0.25}
        />
      </div>

      <NameCycler />

      {/* Subtle animated horizontal line — the timeline teaser */}
      <motion.div
        ref={lineRef}
        className="mt-8 h-px w-0 bg-border"
        initial={{ width: 0 }}
        animate={lineInView ? { width: "12rem" } : { width: 0 }}
        transition={{ duration: 0.8, delay: 2.5, ease: [0.25, 0.1, 0.25, 1] }}
        aria-hidden="true"
      />

      <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "w-full sm:w-auto",
          )}
        >
          {ctaDemo}
        </a>
        <Link
          href="/docs/introduction"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full sm:w-auto",
          )}
        >
          {ctaDocs}
        </Link>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full sm:w-auto",
          )}
        >
          {ctaGithub}
        </a>
      </div>
    </section>
  );
}
