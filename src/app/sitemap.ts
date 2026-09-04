import type { MetadataRoute } from "next";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/site";
import { getAllDocSlugs } from "@/lib/docs/content";
import { getAllPostSlugs, getPost } from "@/lib/blog/content";

const locales = siteConfig.locales;
const baseUrl = siteConfig.url;

/**
 * Doc files carry no date in frontmatter, so their lastModified is the
 * file mtime — with the same zh → en fallback as the content loader.
 */
async function docLastModified(
  locale: string,
  slug: string,
): Promise<Date | undefined> {
  const candidates = locale === "en" ? ["en"] : [locale, "en"];
  for (const loc of candidates) {
    try {
      const { mtime } = await stat(
        join(process.cwd(), "content", "docs", loc, `${slug}.mdx`),
      );
      return mtime;
    } catch {
      // Missing translation — try the fallback locale.
    }
  }
  return undefined;
}

/**
 * Build locale-prefixed path. Both locales use prefixes (/en, /zh).
 * Returns e.g. "/en" or "/en/docs/introduction".
 */
function localizePath(locale: string, suffix?: string): string {
  const prefix = `/${locale}`;
  return suffix ? `${prefix}${suffix}` : prefix;
}

/**
 * Build the alternates.languages record for a given URL suffix.
 * Keys are language codes and "x-default" (resolves to English).
 */
function alternatesFor(suffix?: string): NonNullable<
  MetadataRoute.Sitemap[number]["alternates"]
> {
  const langs: Record<string, string> = {
    "x-default": `${baseUrl}/en${suffix ?? ""}`,
  };
  for (const locale of locales) {
    langs[locale] = `${baseUrl}${localizePath(locale, suffix)}`;
  }
  return { languages: langs };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const slugs = getAllDocSlugs();
  const postSlugs = await getAllPostSlugs();

  const entries: MetadataRoute.Sitemap = [
    // ---- Landing pages for each locale ----
    ...locales.map((locale) => ({
      url: `${baseUrl}${localizePath(locale)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1.0,
      ...alternatesFor(),
    })),
    // ---- Blog index for each locale ----
    ...locales.map((locale) => ({
      url: `${baseUrl}${localizePath(locale, "/blog")}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      ...alternatesFor("/blog"),
    })),
    // ---- Trust anchor pages (about / contact / privacy) ----
    ...["/about", "/contact", "/privacy"].flatMap((suffix) =>
      locales.map((locale) => ({
        url: `${baseUrl}${localizePath(locale, suffix)}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.3,
        ...alternatesFor(suffix),
      })),
    ),
  ];

  // ---- Doc pages for each locale ----
  for (const slug of slugs) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}${localizePath(locale, `/docs/${slug}`)}`,
        lastModified: (await docLastModified(locale, slug)) ?? lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.9,
        ...alternatesFor(`/docs/${slug}`),
      });
    }
  }

  // ---- Blog posts for each locale (lastModified = frontmatter date) ----
  for (const slug of postSlugs) {
    for (const locale of locales) {
      const post = await getPost(locale, slug);
      entries.push({
        url: `${baseUrl}${localizePath(locale, `/blog/${slug}`)}`,
        lastModified: new Date(`${post.frontmatter.date}T00:00:00`),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        ...alternatesFor(`/blog/${slug}`),
      });
    }
  }

  return entries;
}
