"use client";

/**
 * Ported from previously-lab/agent src/components/chat/markdown.tsx @ 0601d19
 * (playground port).
 *
 * Memoized react-markdown renderer for the playground's live answers.
 * Adaptations from the kernel version:
 * - Plugins trimmed to remark-gfm (already a site dependency): the recall
 *   colleague's answers are prose with lists/tables/links — no math, no
 *   mermaid. The kernel's remark-math / rehype-katex / rehype-highlight /
 *   MermaidBlock and the shadcn Table/Separator wrappers are dropped; elements
 *   are styled with Tailwind directly (the site has no shadcn table set).
 * - Code fences render as a plain styled block — the docs' syntax
 *   highlighting is build-time shiki, not available at runtime.
 * - The kernel's streaming stagger animation (`--stagger-index` on list
 *   items) is dropped; `isStreaming` only adds a blinking caret.
 */

import { memo, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Extract plain text out of a ReactNode (for code blocks). */
function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

function createComponents(): Components {
  return {
    /* ── Code (inline + block) ──────────────────────────────────── */
    code({ className, children }) {
      const isBlock = /language-(\w+)/.exec(className ?? "");
      if (!isBlock) {
        return (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
            {children}
          </code>
        );
      }
      return (
        <code className="font-mono text-xs leading-relaxed">
          {extractText(children).replace(/\n$/, "")}
        </code>
      );
    },

    pre({ children }) {
      return (
        <pre className="my-2 overflow-x-auto rounded-md border border-border/60 bg-muted/50 px-3 py-2">
          {children}
        </pre>
      );
    },

    /* ── Tables ─────────────────────────────────────────────────── */
    table({ children }) {
      return (
        <div className="my-2 overflow-x-auto">
          <table className="w-full border-collapse text-xs">{children}</table>
        </div>
      );
    },
    th({ children }) {
      return (
        <th className="border-b border-border px-2 py-1 text-left font-semibold">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border-b border-border/40 px-2 py-1 align-top">
          {children}
        </td>
      );
    },

    /* ── Links ──────────────────────────────────────────────────── */
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--pg-brand)] underline underline-offset-2"
        >
          {children}
        </a>
      );
    },

    /* ── Lists ──────────────────────────────────────────────────── */
    ul({ children }) {
      return <ul className="my-1.5 list-disc space-y-1 pl-5">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="my-1.5 list-decimal space-y-1 pl-5">{children}</ol>;
    },

    /* ── Blockquote ─────────────────────────────────────────────── */
    blockquote({ children }) {
      return (
        <blockquote className="my-2 border-l-2 border-border/60 pl-3 text-muted-foreground">
          {children}
        </blockquote>
      );
    },

    /* ── Horizontal rule ────────────────────────────────────────── */
    hr() {
      return <hr className="my-3 border-border/60" />;
    },

    /* ── Headings (rare in answers, but keep the rhythm) ────────── */
    h1: ({ children }) => (
      <h1 className="mt-3 mb-1.5 text-base font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-3 mb-1.5 text-sm font-bold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-2.5 mb-1 text-sm font-semibold">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-2 mb-1 text-sm font-semibold">{children}</h4>
    ),
    p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
  };
}

interface MarkdownRendererProps {
  content: string;
  /** When true, appends a blinking caret while the stream is live. */
  isStreaming?: boolean;
}

/**
 * Stable components are created once, so react-markdown never rebuilds the
 * component tree between streaming updates (kernel behavior — DOM churn would
 * cause layout shift).
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming = false,
}: MarkdownRendererProps) {
  const comps = useMemo(() => createComponents(), []);

  return (
    <div className="max-w-none break-words text-sm leading-relaxed text-foreground/85">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={comps}>
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span
          className={cn(
            "ml-0.5 inline-block h-3.5 w-px animate-pulse bg-[var(--pg-brand)] align-middle",
          )}
        />
      )}
    </div>
  );
});
