"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type TocHeading = {
  id: string;
  text: string;
  level: number;
};

/**
 * Client component that scans the rendered <article> for h2 and h3 elements
 * and builds a right-hand table of contents. Re-scans on pathname change
 * to support client-side navigation between docs.
 *
 * Renders nothing when the article has no headings (below `lg` breakpoint
 * the entire aside is hidden via Tailwind).
 */
export function DocsToc() {
  const t = useTranslations("Docs");
  const pathname = usePathname();
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  /* ---- scan DOM for headings ---- */
  useEffect(() => {
    let cancelled = false;

    const scan = () => {
      if (cancelled) return;
      const elements = document.querySelectorAll<HTMLHeadingElement>(
        "article h2, article h3",
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

  if (headings.length === 0) return null;

  return (
    <aside className="hidden shrink-0 lg:block lg:w-56">
      <nav className="sticky top-20" aria-labelledby="docs-toc-label">
        <p
          id="docs-toc-label"
          className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {t("onThisPage")}
        </p>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block text-sm transition-colors ${
                  h.level === 3 ? "pl-4" : ""
                } ${
                  activeId === h.id
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
