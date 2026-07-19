import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";
import { docsManifest, getDocNeighbors } from "@/lib/docs/manifest";
import { getDoc, DocNotFoundError } from "@/lib/docs/content";
import { MdxRenderer } from "@/lib/mdx";

import { DocsPager } from "@/components/docs/docs-pager";
import { CopyMarkdownButton } from "@/components/docs/copy-markdown-button";

import {
  TechArticleJsonLd,
  BreadcrumbJsonLd,
  FaqJsonLd,
  type FaqItem,
} from "@/lib/seo/json-ld";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Extract Q&A pairs from FAQ markdown content.
 * Treats h2 headings as questions and the following paragraphs as answers.
 */
function extractFaqItems(markdown: string): FaqItem[] {
  const items: FaqItem[] = [];
  const lines = markdown.split("\n");
  let currentQuestion = "";
  let currentAnswer = "";

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (currentQuestion) {
        items.push({
          question: currentQuestion,
          answer: currentAnswer.trim(),
        });
      }
      currentQuestion = h2Match[1].trim();
      currentAnswer = "";
    } else if (currentQuestion && line.trim()) {
      currentAnswer += line + "\n";
    }
  }

  if (currentQuestion) {
    items.push({ question: currentQuestion, answer: currentAnswer.trim() });
  }

  return items;
}

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams(): Array<{
  locale: string;
  slug: string;
}> {
  const slugs = docsManifest.flatMap((s) => s.items.map((i) => i.slug));
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
    const { frontmatter } = await getDoc(locale, slug);

    return {
      title: `${frontmatter.title} | ${siteConfig.name}`,
      description: frontmatter.description,
      alternates: {
        canonical: `/${locale}/docs/${slug}`,
        languages: {
          en: `/en/docs/${slug}`,
          zh: `/zh/docs/${slug}`,
        },
      },
      openGraph: {
        title: `${frontmatter.title} | ${siteConfig.name}`,
        description: frontmatter.description,
        url: `/${locale}/docs/${slug}`,
        type: "article",
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

export default async function DocPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  /* ---- load doc or 404 ---- */
  let frontmatter: { title: string; description: string };
  let content: string;
  try {
    const doc = await getDoc(locale, slug);
    frontmatter = doc.frontmatter;
    content = doc.content;
  } catch (error) {
    if (error instanceof DocNotFoundError) {
      notFound();
    }
    throw error;
  }

  /* ---- prev / next ---- */
  const neighbors = getDocNeighbors(slug);

  // Resolve localized titles for prev/next from their frontmatter
  const localizedNeighbors = {
    prev: null as { slug: string; title: string } | null,
    next: null as { slug: string; title: string } | null,
  };
  if (neighbors.prev) {
    try {
      const { frontmatter: prevFm } = await getDoc(locale, neighbors.prev.slug);
      localizedNeighbors.prev = { slug: neighbors.prev.slug, title: prevFm.title };
    } catch {
      localizedNeighbors.prev = neighbors.prev;
    }
  }
  if (neighbors.next) {
    try {
      const { frontmatter: nextFm } = await getDoc(locale, neighbors.next.slug);
      localizedNeighbors.next = { slug: neighbors.next.slug, title: nextFm.title };
    } catch {
      localizedNeighbors.next = neighbors.next;
    }
  }

  /* ---- translations for the copy button URL and breadcrumb ---- */
  const t = await getTranslations({ locale, namespace: "Docs" });

  /* ---- FAQ structured data ---- */
  const faqItems = slug === "faq" ? extractFaqItems(content) : [];

  return (
    <>
      {/* ---- JSON-LD structured data ---- */}
      <TechArticleJsonLd
        headline={frontmatter.title}
        description={frontmatter.description}
        url={`/${locale}/docs/${slug}`}
        publisherName={siteConfig.name}
      />

      <BreadcrumbJsonLd
        items={[
          { name: t("title"), url: `/${locale}/docs` },
          { name: frontmatter.title, url: `/${locale}/docs/${slug}` },
        ]}
      />

      {faqItems.length > 0 && <FaqJsonLd items={faqItems} />}

      {/* ---- page content ---- */}
      <article className="min-w-0">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <div />
          <CopyMarkdownButton url={`/${locale}/docs/${slug}/llms.txt`} />
        </div>

        {/* MDX body */}
        <MdxRenderer source={content} />
      </article>

      {/* ---- prev / next navigation ---- */}
      <DocsPager
        prev={localizedNeighbors.prev}
        next={localizedNeighbors.next}
        locale={locale}
      />
    </>
  );
}
