"use client";

import { useTranslations } from "next-intl";

/**
 * Error boundary for individual doc pages.
 * Provides a "Try again" button that re-renders the segment.
 */
export default function DocPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Docs");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="text-lg font-semibold text-destructive">
        {t("somethingWentWrong")}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
