"use client";

import { useRef } from "react";
import { useInView, motion } from "motion/react";

const FILE_TREE = [
  { name: "memory/", indent: 0, isDir: true, delay: 0 },
  { name: "episodic/", indent: 1, isDir: true, delay: 0.1 },
  { name: "slices/", indent: 2, isDir: true, delay: 0.2 },
  { name: "2026/", indent: 3, isDir: true, delay: 0.3 },
  { name: "07/", indent: 4, isDir: true, delay: 0.4 },
  { name: "27/", indent: 5, isDir: true, delay: 0.5 },
  { name: "1430/", indent: 6, isDir: true, delay: 0.55 },
  { name: "core.md", indent: 7, isDir: false, delay: 0.6 },
  { name: "agent.md", indent: 7, isDir: false, delay: 0.65 },
  { name: "previously.md", indent: 3, isDir: false, delay: 0.7 },
  { name: "timeline.md", indent: 2, isDir: false, delay: 0.75 },
];

/**
 * Screen 6 visual: a simplified GitHub repo file tree showing that all
 * memory data lives in human-readable Markdown files. Clean monospace
 * typography with a lock icon reinforcing data sovereignty.
 */
export function GitHubRepoVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className="w-full max-w-xl"
      role="img"
      aria-label="Your memory lives as Markdown files in your own GitHub repository"
    >
      {/* Repo header */}
      <motion.div
        className="flex items-center gap-2 rounded-t-lg border border-border bg-muted/30 px-4 py-2.5"
        initial={{ opacity: 0, y: -4 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
        transition={{ duration: 0.4 }}
      >
        {/* Repo icon */}
        <svg viewBox="0 0 16 16" className="size-3.5 text-muted-foreground/70" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span className="font-mono text-xs font-medium text-foreground/80 sm:text-sm">your-username/memory</span>
        <span className="ml-auto font-mono text-[0.6rem] text-muted-foreground/50">public</span>
      </motion.div>

      {/* File tree */}
      <motion.div
        className="rounded-b-lg border border-t-0 border-border bg-card px-4 py-3 font-mono text-xs sm:text-sm"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {FILE_TREE.map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-1.5 leading-relaxed"
            style={{ paddingLeft: `${item.indent * 1}rem` }}
            initial={{ opacity: 0, x: -4 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
            transition={{ duration: 0.3, delay: 0.3 + item.delay }}
          >
            {item.isDir ? (
              <>
                <svg viewBox="0 0 16 16" className="size-3 shrink-0 text-[#0066FF]/70" fill="currentColor" aria-hidden="true">
                  <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" />
                </svg>
                <span className="font-medium text-foreground/80">{item.name}</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" className="size-3 shrink-0 text-muted-foreground/50" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3.75 1.5a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06z" />
                </svg>
                <span className="text-muted-foreground/70">{item.name}</span>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Lock badge */}
      <motion.div
        className="mt-4 flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: 4 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
        transition={{ duration: 0.4, delay: 1.2 }}
      >
        <svg viewBox="0 0 16 16" className="size-3.5 text-muted-foreground/60" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4 4a4 4 0 118 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25v-5.5C2 6.784 2.784 6 3.75 6H4V4zm1.5 0a2.5 2.5 0 015 0v2h-5V4z" />
        </svg>
        <span className="font-mono text-[0.65rem] text-muted-foreground/60">
          Your GitHub repo. Your data.
        </span>
      </motion.div>
    </div>
  );
}
