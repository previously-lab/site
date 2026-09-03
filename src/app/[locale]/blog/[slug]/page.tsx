import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import {
  getPost,
  getAllPostSlugs,
  hasLocaleVersion,
  formatPostDate,
  BlogPostNotFoundError,
  type BlogPost,
} from "@/lib/blog/content";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import { BlogToc } from "@/components/blog/blog-toc";
import { TechArticleJsonLd, BreadcrumbJsonLd } from "@/lib/seo/json-ld";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export async function generateStaticParams(): Promise<
  Array<{ locale: string; slug: string }>
> {
  const slugs = await getAllPostSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const { frontmatter } = await getPost(locale, slug);

    return {
      title: frontmatter.title,
      description: frontmatter.description,
      alternates: {
        canonical: `/${locale}/blog/${slug}`,
        languages: {
          en: `/en/blog/${slug}`,
          zh: `/zh/blog/${slug}`,
        },
      },
      openGraph: {
        title: `${frontmatter.title} | ${siteConfig.name}`,
        description: frontmatter.description,
        url: `/${locale}/blog/${slug}`,
        type: "article",
        publishedTime: frontmatter.date,
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
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  /* ---- load post (with cross-locale fallback) or 404 ---- */
  let post: BlogPost;
  try {
    post = await getPost(locale, slug);
  } catch (error) {
    if (error instanceof BlogPostNotFoundError) {
      notFound();
    }
    throw error;
  }

  const t = await getTranslations({ locale, namespace: "Blog" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  /* ---- language switcher — only when the other locale has its own file ---- */
  const other = locale === "zh" ? "en" : "zh";
  const hasTranslation = await hasLocaleVersion(other, slug);

  return (
    <>
      {/* ---- JSON-LD structured data ---- */}
      <TechArticleJsonLd
        headline={post.frontmatter.title}
        description={post.frontmatter.description}
        url={`/${locale}/blog/${slug}`}
        datePublished={post.frontmatter.date}
        publisherName={siteConfig.orgName}
      />

      <BreadcrumbJsonLd
        items={[
          { name: t("heading"), url: `/${locale}/blog` },
          { name: post.frontmatter.title, url: `/${locale}/blog/${slug}` },
        ]}
      />

      {/* ---- article — offset to the right of the viewport at lg,
             leaving the left rail as breathing room ---- */}
      <article className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-8 sm:py-24 lg:ml-auto lg:mr-[7vw]">
        {/* asymmetric header — left-aligned display serif, lede,
            small-caps meta */}
        <header className="mb-14 sm:mb-20">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-6 max-w-[24ch] font-serif text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.08] font-normal italic tracking-[-0.01em] text-balance">
            {post.frontmatter.title}
          </h1>
          {/* lede — the frontmatter description, pulled out of the old
              margin note into the header */}
          <p className="mt-6 max-w-[44ch] font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            {post.frontmatter.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <time dateTime={post.frontmatter.date}>
              {formatPostDate(post.frontmatter.date, locale)}
            </time>
            {/* fallback badge — this locale has no translation of its own */}
            {post.resolvedLocale !== locale && (
              <span className="rounded-full border border-border px-2 py-0.5 leading-4 tracking-[0.12em]">
                {post.resolvedLocale === "zh"
                  ? tCommon("langZh")
                  : tCommon("langEn")}
              </span>
            )}
            {hasTranslation && (
              <Link
                href={`/blog/${slug}`}
                locale={other}
                className="underline decoration-border underline-offset-4 transition-colors hover:text-[var(--brand-blue)] hover:decoration-[var(--brand-blue)]"
              >
                {t("readInOtherLanguage")}
              </Link>
            )}
          </div>
        </header>

        {/* body grid — sticky TOC in the left rail (renders nothing for
            posts with fewer than two headings), prose right */}
        <div className="lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-20">
          <aside className="hidden lg:block">
            <BlogToc />
          </aside>

          <div className="min-w-0">
            {/* post body — styled by .blog-prose in globals.css */}
            <div className="blog-prose max-w-[65ch]">
              <MarkdownRenderer source={post.content} />
            </div>

            <footer className="mt-16 border-t border-border pt-8 sm:mt-20">
              <Link
                href="/blog"
                className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-[var(--brand-blue)]"
              >
                ← {t("backToBlog")}
              </Link>
            </footer>
          </div>
        </div>
      </article>
    </>
  );
}
