import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export async function OpenSourceHeader({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });
  return (
    <div className="space-y-4 text-center">
      <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
        MIT License
      </div>
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("OpenSource.title")}
      </h2>
    </div>
  );
}

export async function OpenSourceDescription({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        {t("OpenSource.description")}
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
        <a
          href={siteConfig.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "w-full gap-2 sm:w-auto",
          )}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          {t("OpenSource.ctaGithub")}
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
        <Link
          href="/docs/getting-started"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full sm:w-auto",
          )}
        >
          {t("OpenSource.ctaGettingStarted")}
        </Link>
      </div>
    </div>
  );
}
