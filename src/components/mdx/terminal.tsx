import type { ReactNode } from "react";
import { terminalDemos } from "@/lib/docs/terminal-demos";

/**
 * Terminal — renders a captured CLI session in a dark terminal window.
 * Used in MDX as `<Terminal demo="status-running" />`; the ANSI payload
 * lives in `@/lib/docs/terminal-demos.ts`.
 *
 * The ANSI parser intentionally supports only the SGR subset the client
 * CLI emits: reset (0), bold (1/22), standard + bright foregrounds
 * (30–37/90–97), default fg (39), and 24-bit fg (38;2;r;g;b).
 */

const BASIC_FG: Record<number, string> = {
  30: "#6e7681",
  31: "#f85149",
  32: "#3fb950",
  33: "#d29922",
  34: "#58a6ff",
  35: "#bc8cff",
  36: "#39c5cf",
  37: "#c9d1d9",
  90: "#8b949e",
  91: "#ff7b72",
  92: "#56d364",
  93: "#e3b341",
  94: "#79c0ff",
  95: "#d2a8ff",
  96: "#56d4dd",
  97: "#f0f6fc",
};

const SGR_RE = /(\x1b\[[0-9;]*m)/;

function parseAnsi(input: string): ReactNode[] {
  const out: ReactNode[] = [];
  let bold = false;
  let color: string | undefined;
  let key = 0;

  for (const part of input.split(SGR_RE)) {
    const match = part.match(/^\x1b\[([0-9;]*)m$/);
    if (!match) {
      if (part) {
        out.push(
          <span
            key={key++}
            className={bold ? "font-semibold" : undefined}
            style={color ? { color } : undefined}
          >
            {part}
          </span>,
        );
      }
      continue;
    }
    const codes = (match[1] === "" ? "0" : match[1]).split(";").map(Number);
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (c === 0) {
        bold = false;
        color = undefined;
      } else if (c === 1) {
        bold = true;
      } else if (c === 22) {
        bold = false;
      } else if (c === 39) {
        color = undefined;
      } else if (c === 38 && codes[i + 1] === 2) {
        color = `rgb(${codes[i + 2]}, ${codes[i + 3]}, ${codes[i + 4]})`;
        i += 4;
      } else if (BASIC_FG[c]) {
        color = BASIC_FG[c];
      }
    }
  }
  return out;
}

export function Terminal({ demo }: { demo: string }): React.ReactElement {
  const entry = terminalDemos[demo];
  if (!entry) {
    return (
      <div className="my-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 font-mono text-sm">
        Unknown terminal demo: {demo}
      </div>
    );
  }
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border bg-[#0d1117] shadow-sm lg:-mx-6 xl:-mx-10">
      <div className="relative flex items-center border-b border-white/10 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 font-mono text-xs text-white/40">
          {entry.title}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[#c9d1d9]">
        {parseAnsi(entry.ansi)}
      </pre>
    </div>
  );
}
