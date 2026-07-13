"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { docsManifest } from "@/lib/docs/manifest";

export function DocsSidebar({ locale: _locale }: { locale: string }) {
  const t = useTranslations("Docs");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const sidebar = (
    <nav className="flex flex-col gap-6" role="navigation" aria-label="Documentation sections">
      {docsManifest.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.title}
          </h2>
          {section.items.map((item) => {
            const href = `/docs/${item.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={item.slug}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md px-2 py-1 text-sm transition-colors ${
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-14 right-4 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm lg:hidden"
        aria-label={t("openMenu")}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 lg:block lg:w-56">
        <div className="sticky top-20">{sidebar}</div>
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="absolute bottom-0 left-0 top-0 flex w-64 flex-col overflow-y-auto border-r border-border bg-background p-4 pt-16 shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-14 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              aria-label={t("closeMenu")}
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
    </>
  );
}
