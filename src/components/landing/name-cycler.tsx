"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const POOL = [
  "Alan",
  "Sarah",
  "Michael",
  "Priya",
  "David",
  "Emma",
  "Carlos",
  "Yuki",
] as const;

const FINAL = "You.";

function pickDifferent(current: string): string {
  let next: string;
  do {
    next = POOL[Math.floor(Math.random() * POOL.length)];
  } while (next === current && POOL.length > 1);
  return next;
}

/**
 * Shows a random name immediately, then cycles through 3-4 more
 * at a natural pace, finally settling on "You." — giving the viewer
 * the feeling of a TV recap that lands on *them*.
 */
export function NameCycler() {
  // SSR-safe: start with the final value so there's no layout flash
  const [name, setName] = useState<string>(FINAL);
  const [isFinal, setIsFinal] = useState(true);
  const [started, setStarted] = useState(false);

  // On mount, immediately swap to a random name and schedule the cycle
  useEffect(() => {
    const startName = pickDifferent(FINAL);
    setName(startName);
    setIsFinal(false);

    // Wait for "Previously on" to finish animating (~1.8 s), then start
    const timer = setTimeout(() => setStarted(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Cycle through a few names, then land on "You."
  useEffect(() => {
    if (!started) return;

    let cancelled = false;
    let steps = 0;
    const MAX_STEPS = 3 + Math.floor(Math.random() * 2); // 3-4 extra names

    const cycle = () => {
      if (cancelled) return;
      if (steps >= MAX_STEPS) {
        setName(FINAL);
        setIsFinal(true);
        return;
      }

      setName((prev) => pickDifferent(prev));
      steps++;

      // Natural rhythm: 350-500 ms between names
      setTimeout(cycle, 350 + Math.random() * 150);
    };

    const kickoff = setTimeout(cycle, 500);
    return () => {
      cancelled = true;
      clearTimeout(kickoff);
    };
  }, [started]);

  return (
    <div className="mt-3 flex h-16 items-center justify-center overflow-hidden sm:h-20 md:h-24">
      <AnimatePresence mode="wait">
        <motion.span
          key={name}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: isFinal ? 0.6 : 0.22 }}
          className={
            isFinal
              ? "bg-gradient-to-r from-foreground to-primary bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl"
              : "text-3xl font-bold text-foreground sm:text-4xl md:text-5xl"
          }
        >
          {name}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
