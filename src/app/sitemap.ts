import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllDocSlugs } from "@/lib/docs/content";

const locales = siteConfig.locales;
const baseUrl = siteConfig.url;

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

  const entries: MetadataRoute.Sitemap = [
    // ---- Landing pages for each locale ----
    ...locales.map((locale) => ({
      url: `${baseUrl}${localizePath(locale)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1.0,
      ...alternatesFor(),
    })),
  ];

  // ---- Doc pages for each locale ----
  for (const slug of slugs) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}${localizePath(locale, `/docs/${slug}`)}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.9,
        ...alternatesFor(`/docs/${slug}`),
      });
    }
  }

  return entries;
}
