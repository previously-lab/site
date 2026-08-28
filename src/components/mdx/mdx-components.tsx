import { type ReactNode } from "react";
import type { JSX } from "react";
import type { MDXComponents } from "mdx/types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Playground } from "@/components/playground/playground";

/* ------------------------------------------------------------------ */
/*  Callout                                                           */
/* ------------------------------------------------------------------ */

type CalloutVariant = "info" | "warning" | "success";

const calloutStyles: Record<CalloutVariant, string> = {
  info: "border-l-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
  warning:
    "border-l-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  success:
    "border-l-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
};

function Callout({
  variant = "info",
  children,
}: {
  variant?: CalloutVariant;
  children?: ReactNode;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "my-6 rounded-r-lg border-l-4 p-4 text-sm [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        calloutStyles[variant],
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Heading renderers                                                 */
/* ------------------------------------------------------------------ */

function Heading({
  level,
  id,
  children,
  className,
}: {
  level: 1 | 2 | 3 | 4;
  id?: string;
  children?: ReactNode;
  className?: string;
}): React.ReactElement {
  const shared = cn(
    "scroll-mt-20 font-semibold text-foreground",
    level === 1 && "mb-4 mt-0 text-3xl font-bold tracking-tight",
    level === 2 && "mb-3 mt-10 text-2xl font-bold tracking-tight",
    level === 3 && "mb-2 mt-8 text-xl font-semibold",
    level === 4 && "mb-2 mt-6 text-base font-semibold",
    className,
  );

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag id={id} className={shared}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  MDX components map                                                */
/* ------------------------------------------------------------------ */

export const mdxComponents: MDXComponents = {
  h1: ({ id, children, className, ...props }) => (
    <Heading level={1} id={id} className={className} {...props}>
      {children}
    </Heading>
  ),
  h2: ({ id, children, className, ...props }) => (
    <Heading level={2} id={id} className={className} {...props}>
      {children}
    </Heading>
  ),
  h3: ({ id, children, className, ...props }) => (
    <Heading level={3} id={id} className={className} {...props}>
      {children}
    </Heading>
  ),
  h4: ({ id, children, className, ...props }) => (
    <Heading level={4} id={id} className={className} {...props}>
      {children}
    </Heading>
  ),
  h5: ({ id, children, className, ...props }) => (
    <Heading level={4} id={id} className={className} {...props}>
      {children}
    </Heading>
  ),
  h6: ({ id, children, className, ...props }) => (
    <Heading level={4} id={id} className={className} {...props}>
      {children}
    </Heading>
  ),

  p: ({ children, ...props }) => (
    <p className="my-4 leading-relaxed text-foreground/85" {...props}>
      {children}
    </p>
  ),

  ul: ({ children, ...props }) => (
    <ul
      className="my-4 list-disc space-y-1.5 pl-6 text-foreground/85"
      {...props}
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }) => (
    <ol
      className="my-4 list-decimal space-y-1.5 pl-6 text-foreground/85"
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),

  a: ({ href, children, ...props }) => {
    if (href && href.startsWith("/")) {
      return (
        <Link
          href={href}
          className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
          {...props}
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
        {...props}
      >
        {children}
      </a>
    );
  },

  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-6 border-l-2 border-primary/30 pl-5 italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),

  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }) => (
    <thead className="bg-muted/60" {...props}>
      {children}
    </thead>
  ),

  th: ({ children, ...props }) => (
    <th
      className="border-b border-border px-4 py-2.5 text-left font-medium text-foreground"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }) => (
    <td
      className="border-b border-border px-4 py-2.5 text-foreground/85 last-of-type:border-b-0"
      {...props}
    >
      {children}
    </td>
  ),

  code: ({ className, children, ...props }) => {
    // Inline code (no language class) vs. block code (has language-xxx)
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <code
          className={cn(
            "grid rounded-lg bg-muted text-sm leading-relaxed [&_pre]:overflow-x-auto [&_pre]:p-4",
            className,
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },

  pre: ({ children, ...props }) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-border bg-muted text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),

  hr: () => <hr className="my-10 border-border" />,

  Callout,
  Playground,
};
