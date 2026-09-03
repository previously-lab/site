import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { getPostList, formatPostDate } from "@/lib/blog/content";

type Props = {
  params: Promise<{ locale: string }>;
};

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }));
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog.Meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        en: "/en/blog",
        zh: "/zh/blog",
      },
    },
    openGraph: {
      title: `${t("title")} | ${siteConfig.name}`,
      description: t("description"),
      url: `/${locale}/blog`,
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Blog" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const posts = await getPostList(locale);

  return (
    /* editorial table of contents — offset to the left of the viewport
       at lg, the empty right side stays as breathing room */
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-8 sm:py-24 lg:ml-[8vw] lg:mr-auto">
      {/* ---- page header ---- */}
      <header className="mb-14 sm:mb-20">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-6 font-serif text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-normal italic tracking-[-0.01em]">
          {t("heading")}
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("intro")}
        </p>
      </header>

      {/* ---- post list — numbered rows, hairline separators ---- */}
      {posts.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ol>
          {posts.map((post, index) => (
            <li
              key={post.slug}
              className="group border-t border-border/70 last:border-b"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 py-7 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-10 sm:py-9"
              >
                {/* oversized ghost index — turns brand blue on hover */}
                <span
                  aria-hidden="true"
                  className="font-serif text-3xl leading-none text-foreground/15 transition-colors duration-200 group-hover:text-[var(--brand-blue)] sm:text-4xl"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0">
                  <span className="block font-serif text-xl leading-snug font-normal italic transition-colors duration-200 group-hover:text-[var(--brand-blue)] sm:text-2xl">
                    {post.frontmatter.title}
                  </span>
                  <span className="mt-2 block max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                    {post.frontmatter.description}
                  </span>
                  <span className="mt-3 flex items-center gap-3 sm:hidden">
                    <time
                      dateTime={post.frontmatter.date}
                      className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {formatPostDate(post.frontmatter.date, locale)}
                    </time>
                    {/* fallback badge — only in the other language */}
                    {post.resolvedLocale !== locale && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] leading-4 text-muted-foreground">
                        {post.resolvedLocale === "zh"
                          ? tCommon("langZh")
                          : tCommon("langEn")}
                      </span>
                    )}
                  </span>
                </span>

                {/* date column, right-aligned against the hairline grid */}
                <span className="hidden items-baseline gap-3 sm:flex">
                  {post.resolvedLocale !== locale && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] leading-4 text-muted-foreground">
                      {post.resolvedLocale === "zh"
                        ? tCommon("langZh")
                        : tCommon("langEn")}
                    </span>
                  )}
                  <time
                    dateTime={post.frontmatter.date}
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {formatPostDate(post.frontmatter.date, locale)}
                  </time>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
