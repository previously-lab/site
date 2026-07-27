"use client";

import { NumberTicker } from "@/components/ui/number-ticker";

interface TimeDisplayProps {
  timestamp: string;
  mode?: "full" | "date" | "time";
  className?: string;
}

/**
 * Animated timestamp display — each digit counts up from a nearby starting
 * value when scrolled into view. Matches the Aftrbrez product's TimeDisplay
 * component exactly.
 */
export function TimeDisplay({ timestamp, mode = "full", className = "" }: TimeDisplayProps) {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return null;

  const hours = d.getHours();
  const minutes = d.getMinutes();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Start values close to the target so the animation is tight and fast
  const yearStart = Math.max(0, year - 30);
  const monthStart = Math.max(1, month - 3);
  const dayStart = Math.max(1, day - 10);
  const hourStart = Math.max(0, hours - 6);
  const minuteStart = Math.max(0, minutes - 10);

  const showDate = mode === "full" || mode === "date";
  const showTime = mode === "full" || mode === "time";

  return (
    <span
      className={`inline-flex items-baseline gap-px font-mono tabular-nums text-[0.55rem] text-inherit ${className}`}
    >
      {showDate && (
        <>
          <NumberTicker value={year} startValue={yearStart} className="![color:inherit] text-[0.55rem]" />
          <span className="text-[0.5rem]">/</span>
          <NumberTicker value={month} startValue={monthStart} className="![color:inherit] text-[0.55rem]" />
          <span className="text-[0.5rem]">/</span>
          <NumberTicker value={day} startValue={dayStart} minIntegerDigits={2} className="![color:inherit] text-[0.55rem]" />
          {showTime && <span className="mx-0.5" />}
        </>
      )}
      {showTime && (
        <>
          <NumberTicker value={hours} startValue={hourStart} minIntegerDigits={2} className="![color:inherit]" />
          <span>:</span>
          <NumberTicker value={minutes} startValue={minuteStart} minIntegerDigits={2} className="![color:inherit]" />
        </>
      )}
    </span>
  );
}
