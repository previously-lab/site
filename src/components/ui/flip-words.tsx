"use client";

import { useEffect, useState, type ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FlipWordsProps {
  words: string[];
  /** Hold time (ms) on each word before flipping to the next. */
  duration?: number;
  /** When false, the animation rests on the last word instead of looping. */
  loop?: boolean;
  className?: string;
  /** Extra classes applied only to the word it settles on (last word when loop=false). */
  finalClassName?: string;
}

/**
 * Flip-through-words animation (adapted from Aceternity UI's FlipWords).
 * Each word reveals letter-by-letter and exits with a blur/scale flourish.
 * Adds a `loop` prop so it can settle on the final word instead of cycling,
 * and a `finalClassName` to emphasise the word it rests on.
 */
export function FlipWords({
  words,
  duration = 3000,
  loop = true,
  className,
  finalClassName,
}: FlipWordsProps): ReactElement {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= words.length - 1 && !loop) return; // rest on the final word
    // Uniform display time per word: every word (including the first) is shown
    // for exactly `duration`; the fade-out cross-fades with the next word.
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [index, words.length, duration, loop]);

  const currentWord = words[index] ?? "";
  const isSettled = !loop && index === words.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
        exit={{
          opacity: 0,
          position: "absolute",
          transition: { duration: 0.25 },
        }}
        className={cn(
          "relative z-10 inline-block whitespace-nowrap text-left",
          className,
          isSettled && finalClassName,
        )}
      >
        {currentWord.split(" ").map((word, wordIndex) => (
          <motion.span
            key={word + wordIndex}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: wordIndex * 0.3, duration: 0.3 }}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={word + letterIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIndex * 0.3 + letterIndex * 0.05,
                  duration: 0.25,
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
