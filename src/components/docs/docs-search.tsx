"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Command } from "cmdk";
import { Search, FileText } from "lucide-react";

export type SearchIndexRecord = {
  slug: string;
  title: string;
  description: string;
  section: string;
};

/**
 * Client leaf providing a docs search palette via cmdk.
 *
 * - Cmd/Ctrl+K opens the dialog.
 * - A visible trigger button is rendered for discoverability.
 * - Results are grouped by manifest section.
 *
 * The `index` is pre-built at the server (build-time) and passed as a prop
 * so no additional client-side file reads are needed.
 */
export function DocsSearch({
  index,
}: {
  index: SearchIndexRecord[];
}) {
  const t = useTranslations("Docs");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  /* ---- keyboard shortcut ---- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  /* ---- navigate on select ---- */
  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false);
      router.push(`/docs/${slug}`);
    },
    [router],
  );

  /* ---- group records by section ---- */
  const grouped = index.reduce<
    Array<{ section: string; items: SearchIndexRecord[] }>
  >((acc, record) => {
    let group = acc.find((g) => g.section === record.section);
    if (!group) {
      group = { section: record.section, items: [] };
      acc.push(group);
    }
    group.items.push(record);
    return acc;
  }, []);

  /* ---- detect macOS for keyboard hint ---- */
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));
  }, []);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="mb-6 flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{t("searchDocs")}</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-xs sm:inline-flex">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      {/* Command dialog */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label={t("searchPlaceholder")}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setOpen(false)}
        />

        {/* Dialog panel */}
        <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <Command.Input
            placeholder={t("searchPlaceholder")}
            className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {t("searchNoResults")}
            </Command.Empty>

            {grouped.map((group) => (
              <Command.Group
                key={group.section}
                heading={group.section}
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
              >
                {group.items.map((record) => (
                  <Command.Item
                    key={record.slug}
                    value={`${record.title} ${record.description}`}
                    onSelect={() => handleSelect(record.slug)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground aria-selected:bg-muted"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{record.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {record.description}
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  );
}
