import "server-only";

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

import {
  blogFrontmatterSchema,
  type BlogFrontmatter,
} from "@/lib/blog/schema";

/** A post loaded from disk, with the locale it was actually read from. */
export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
  /**
   * The locale whose file was loaded. Differs from the requested locale
   * when the post has no translation and fell back to the other language.
   */
  resolvedLocale: string;
};

/** List entry — everything the index page needs, without the body. */
export type BlogPostSummary = Omit<BlogPost, "content">;

/**
 * Error thrown when blog frontmatter fails zod validation.
 * Carries the locale, slug, and zod error details for debugging.
 */
export class BlogFrontmatterValidationError extends Error {
  public readonly locale: string;
  public readonly slug: string;
  public readonly zodIssues: unknown;

  constructor(locale: string, slug: string, zodIssues: unknown) {
    super(
      `Invalid frontmatter in blog/${locale}/${slug}: ${JSON.stringify(zodIssues)}`,
    );
    this.name = "BlogFrontmatterValidationError";
    this.locale = locale;
    this.slug = slug;
    this.zodIssues = zodIssues;
  }
}

/**
 * Error thrown when a post exists in neither locale.
 */
export class BlogPostNotFoundError extends Error {
  public readonly locale: string;
  public readonly slug: string;

  constructor(locale: string, slug: string, cause?: unknown) {
    super(`Blog post not found: ${locale}/${slug}`, { cause });
    this.name = "BlogPostNotFoundError";
    this.locale = locale;
    this.slug = slug;
  }
}

/** Resolve the content directory path for a locale. */
function contentDir(locale: string): string {
  return join(process.cwd(), "content", "blog", locale);
}

/**
 * Format a post date (YYYY-MM-DD) for display in the given locale.
 * The date is pinned to midnight local time so it never shifts a day.
 */
export function formatPostDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

/** The other locale — used for cross-language fallback. */
function otherLocale(locale: string): string {
  return locale === "zh" ? "en" : "zh";
}

/**
 * Read a post file for a locale. Returns null when the file is missing.
 */
async function readPostFile(
  locale: string,
  slug: string,
): Promise<{ data: Record<string, unknown>; content: string } | null> {
  try {
    const raw = await readFile(join(contentDir(locale), `${slug}.md`), "utf-8");
    return matter(raw);
  } catch {
    return null;
  }
}

/**
 * Read and parse a post, falling back to the other locale when the
 * requested locale has no translation. Throws `BlogPostNotFoundError`
 * when neither locale has the slug, `BlogFrontmatterValidationError`
 * on invalid frontmatter.
 */
export async function getPost(locale: string, slug: string): Promise<BlogPost> {
  const requested = await readPostFile(locale, slug);
  const resolvedLocale = requested ? locale : otherLocale(locale);
  const file = requested ?? (await readPostFile(resolvedLocale, slug));

  if (!file) {
    throw new BlogPostNotFoundError(locale, slug);
  }

  const parsed = blogFrontmatterSchema.safeParse(file.data);
  if (!parsed.success) {
    throw new BlogFrontmatterValidationError(
      resolvedLocale,
      slug,
      parsed.error.issues ?? parsed.error,
    );
  }

  return {
    slug,
    frontmatter: parsed.data,
    content: file.content,
    resolvedLocale,
  };
}

/**
 * Return the union of post slugs across all locales, unsorted.
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const slugs = new Set<string>();
  for (const locale of ["en", "zh"]) {
    try {
      const files = await readdir(contentDir(locale));
      for (const file of files) {
        if (file.endsWith(".md")) {
          slugs.add(file.slice(0, -3));
        }
      }
    } catch {
      // Locale directory missing — no posts for that locale.
    }
  }
  return [...slugs];
}

/**
 * Whether the post has a native translation for the given locale
 * (i.e. no fallback would be needed).
 */
export async function hasLocaleVersion(
  locale: string,
  slug: string,
): Promise<boolean> {
  return (await readPostFile(locale, slug)) !== null;
}

/**
 * Return summaries for every post, newest first. Posts missing in the
 * requested locale fall back to the other language — the caller can
 * compare `resolvedLocale` against the page locale to badge them.
 */
export async function getPostList(locale: string): Promise<BlogPostSummary[]> {
  const slugs = await getAllPostSlugs();
  const posts: BlogPostSummary[] = [];

  for (const slug of slugs) {
    try {
      const { content: _content, ...summary } = await getPost(locale, slug);
      posts.push(summary);
    } catch (error) {
      // Invalid frontmatter should fail the build loudly; a genuinely
      // missing post is impossible here (slugs came from the union).
      if (error instanceof BlogFrontmatterValidationError) {
        throw error;
      }
    }
  }

  return posts.sort((a, b) =>
    b.frontmatter.date.localeCompare(a.frontmatter.date),
  );
}
