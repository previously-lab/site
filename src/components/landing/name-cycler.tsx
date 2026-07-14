"use client";

import { useEffect, useState, type ReactElement } from "react";
import { FlipWords } from "@/components/ui/flip-words";

/** Full names the recap can flip through before settling on the viewer.
 *  Full names read more like a TV-show "Previously on…" recap. */
const POOL = [
  "James Carter",
  "Sarah Chen",
  "Michael Rivera",
  "Priya Nair",
  "David Okafor",
  "Emma Larsson",
  "Carlos Mendez",
  "Yuki Tanaka",
  "Fatima Al-Sayed",
  "Noah Bennett",
  "Sophie Dubois",
  "Marco Rossi",
  "Aisha Khan",
  "Wei Zhang",
  "Camille Laurent",
  "Dmitri Volkov",
  "Lena Meyer",
  "Omar Haddad",
  "Grace Kim",
  "Diego Fernandez",
  "Hannah Cohen",
  "Ravi Patel",
  "Elena Petrova",
  "Kofi Mensah",
  "Mia Andersen",
  "Luca Bianchi",
  "Nadia Rahman",
  "Tom Fisher",
  "Ingrid Solberg",
  "Samuel Adeyemi",
  "Chloe Martin",
  "Hiroshi Sato",
] as const;

const FINAL = "You.";

/** Fisher-Yates shuffle → first `count` names, no repeats. */
function randomNames(count: number): string[] {
  const arr = [...POOL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

/**
 * Client leaf. Builds a fresh random sequence of a few full names on each load
 * and flips through them via FlipWords, settling on "You." — a TV-recap
 * "Previously on…" that ends on the viewer. Cycling names are shown in a light
 * weight; only the final "You." is bold, so the emphasis lands on the viewer.
 * The random sequence is computed after mount to keep server/client markup in sync.
 */
export function NameCycler(): ReactElement {
  const [words, setWords] = useState<string[] | null>(null);

  useEffect(() => {
    // Start only after "Previously on" has finished animating in (~1.05s),
    // so the reveal feels staged — title first, then the names roll in.
    const timer = setTimeout(() => {
      const count = 4 + Math.floor(Math.random() * 3); // 4–6 names
      setWords([...randomNames(count), FINAL]);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="relative mt-3 flex h-16 w-full items-center justify-center sm:h-20 md:h-24"
    >
      {words && (
        <FlipWords
          words={words}
          loop={false}
          duration={1000}
          className="text-3xl font-light text-foreground sm:text-4xl md:text-5xl"
          finalClassName="font-bold"
        />
      )}
    </div>
  );
}
