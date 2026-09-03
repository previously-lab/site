import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DocItem } from "@/lib/docs/manifest";

/**
 * Server component rendering prev / next doc navigation links.
 * Both sides render a `<div />` placeholder when null to keep flex spacing.
 */
export async function DocsPager({
  prev,
  next,
  locale,
}: {
  prev: DocItem | null;
  next: DocItem | null;
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <nav
      className="mt-12 flex items-center justify-between border-t border-border pt-6"
      aria-label="Document pagination"
    >
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex flex-col items-start gap-0.5"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="h-3 w-3" />
            {t("previousPage")}
          </span>
          <span className="text-sm font-medium text-foreground transition-colors group-hover:text-[var(--brand-blue)]">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex flex-col items-end gap-0.5 text-right"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {t("nextPage")}
            <ChevronRight className="h-3 w-3" />
          </span>
          <span className="text-sm font-medium text-foreground transition-colors group-hover:text-[var(--brand-blue)]">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
