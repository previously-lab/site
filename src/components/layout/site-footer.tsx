import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";

export async function SiteFooter({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Footer" });

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand column */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              {siteConfig.name}
            </Link>
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>
          </div>

          {/* Links column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              {siteConfig.name}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs/introduction"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("docs")}
                </Link>
              </li>
              <li>
                <a
                  href={siteConfig.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("demo")}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("github")}
                </a>
              </li>
            </ul>
          </div>

          {/* Community column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              {t("community")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={siteConfig.devtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("devto")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {siteConfig.name}. {t("license")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
