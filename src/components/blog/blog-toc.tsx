"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type TocHeading = {
  id: string;
  text: string;
  level: number;
};

/**
 * Client component that scans the rendered post body (.blog-prose) for
 * h2 and h3 elements and builds the sticky left-rail table of contents.
 * Same scan + IntersectionObserver pattern as the docs TOC, styled to
 * the blog's editorial register: small sans items (material contrast
 * against the serif body), h3 indentation, and a brand-blue square
 * marking the current section.
 *
 * Renders nothing when the post has fewer than two headings — a
 * one-entry TOC reads as broken, so the rail falls back to plain
 * breathing room. (The entire rail is hidden below `lg` by the page.)
 */
export function BlogToc() {
  const t = useTranslations("Blog");
  const pathname = usePathname();
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  /* ---- scan DOM for headings ---- */
  useEffect(() => {
    let cancelled = false;

    const scan = () => {
      if (cancelled) return;
      const elements = document.querySelectorAll<HTMLHeadingElement>(
        ".blog-prose h2, .blog-prose h3",
      );
      const items = Array.from(elements).map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      }));
      setHeadings(items);
      if (items.length > 0) {
        setActiveId(items[0].id);
      }
    };

    // Immediate scan (works for initial SSR hydration)
    scan();

    // Re-scan after a microtask (catches client-side navigation renders)
    const id = requestAnimationFrame(() => scan());

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [pathname]);

  /* ---- track visible heading via IntersectionObserver ---- */
  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the last intersecting entry (topmost visible heading)
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -75% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="sticky top-24" aria-labelledby="blog-toc-label">
      <p id="blog-toc-label" className="eyebrow mb-5">
        {t("toc")}
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={cn(
                  "flex items-baseline gap-2 text-[13px] leading-snug transition-colors",
                  h.level === 3 && "pl-4",
                  isActive
                    ? "text-[var(--brand-blue)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1 w-1 shrink-0 self-center",
                    isActive ? "bg-[var(--brand-blue)]" : "bg-transparent",
                  )}
                />
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
