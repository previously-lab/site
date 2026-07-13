"use client";

import { NumberTicker } from "@/components/ui/number-ticker";

/**
 * A timeline section label whose number ticks up from 0 on scroll.
 * Renders something like `#01` with the digits animating in.
 */
export function TickerLabel({ value }: { value: number }) {
  return (
    <span>
      #
      <NumberTicker
        value={value}
        minIntegerDigits={2}
        className="text-muted-foreground"
      />
    </span>
  );
}
