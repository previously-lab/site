"use client";

import { NumberTicker } from "@/components/ui/number-ticker";

/**
 * Animated hierarchical timeline label. Splits on "-" and animates each
 * numeric segment via NumberTicker so numbers tick up on scroll.
 *
 *   "01"      →  01       (section-level, one NumberTicker)
 *   "01-01"   →  01-01    (sub-level, two NumberTickers separated by "-")
 */
export function TickerLabel({ value }: { value: string }) {
  const segments = value.split("-");

  return (
    <span className="whitespace-nowrap">
      {segments.map((seg, i) => (
        <span key={i}>
          {i > 0 && <span>-</span>}
          <NumberTicker
            value={parseInt(seg, 10)}
            minIntegerDigits={2}
            className="text-muted-foreground"
          />
        </span>
      ))}
    </span>
  );
}
