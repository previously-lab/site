import { setRequestLocale } from "next-intl/server";
import { docsManifest } from "@/lib/docs/manifest";
import { getDoc } from "@/lib/docs/content";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsToc } from "@/components/docs/docs-toc";
import { DocsSearch } from "@/components/docs/docs-search";
import type { SearchIndexRecord } from "@/components/docs/docs-search";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Build a build-time search index from the manifest + doc frontmatter.
 * Runs at request time during dev; at build time during static generation.
 */
async function buildSearchIndex(locale: string): Promise<SearchIndexRecord[]> {
  const records: SearchIndexRecord[] = [];

  for (const section of docsManifest) {
    for (const item of section.items) {
      try {
        const { frontmatter } = await getDoc(locale, item.slug);
        records.push({
          slug: item.slug,
          title: frontmatter.title,
          description: frontmatter.description,
          section: section.title,
        });
      } catch {
        // Doc file missing for this locale — skip silently.
        // At build time the en fallback will be included when available.
        continue;
      }
    }
  }

  return records;
}

/**
 * Docs layout — responsive shell with:
 * - Desktop left sidebar (hidden on mobile; hamburger in top-right)
 * - Main content column with search bar
 * - Right-hand table of contents (hidden below `lg`)
 */
export default async function DocsLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  /* ---- build search index ---- */
  const searchIndex = await buildSearchIndex(locale);

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 pt-16 pb-8 sm:px-6 lg:gap-12 lg:pt-20 lg:pb-12">
      <DocsSidebar locale={locale} />

      <main className="min-w-0 flex-1">
        <DocsSearch index={searchIndex} />
        {children}
      </main>

      <DocsToc />
    </div>
  );
}
