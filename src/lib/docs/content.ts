import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

import {
  docFrontmatterSchema,
  type DocFrontmatter,
} from "@/lib/docs/schema";
import { docsManifest } from "@/lib/docs/manifest";

/**
 * Error thrown when doc frontmatter fails zod validation.
 * Carries the locale, slug, and zod error details for debugging.
 */
export class DocFrontmatterValidationError extends Error {
  public readonly locale: string;
  public readonly slug: string;
  public readonly zodIssues: unknown;

  constructor(locale: string, slug: string, zodIssues: unknown) {
    super(
      `Invalid frontmatter in ${locale}/${slug}: ${JSON.stringify(zodIssues)}`,
    );
    this.name = "DocFrontmatterValidationError";
    this.locale = locale;
    this.slug = slug;
    this.zodIssues = zodIssues;
  }
}

/**
 * Error thrown when a doc file cannot be read from disk (missing or
 * filesystem error).
 */
export class DocNotFoundError extends Error {
  public readonly locale: string;
  public readonly slug: string;

  constructor(locale: string, slug: string, cause?: unknown) {
    super(`Doc not found: ${locale}/${slug}`, { cause });
    this.name = "DocNotFoundError";
    this.locale = locale;
    this.slug = slug;
  }
}

/** Resolve the content directory path for a locale. */
function contentDir(locale: string): string {
  return join(process.cwd(), "content", "docs", locale);
}

/**
 * Read a doc file with gray-matter frontmatter parsing.
 * Falls back from zh -> en when the requested locale file is missing.
 */
async function readDocFile(
  locale: string,
  slug: string,
): Promise<{ data: Record<string, unknown>; content: string }> {
  const primaryPath = join(contentDir(locale), `${slug}.mdx`);

  try {
    const raw = await readFile(primaryPath, "utf-8");
    return matter(raw);
  } catch (error) {
    // If zh is missing, fall back to en
    if (locale === "zh") {
      try {
        const fallbackPath = join(contentDir("en"), `${slug}.mdx`);
        const raw = await readFile(fallbackPath, "utf-8");
        return matter(raw);
      } catch {
        throw new DocNotFoundError(locale, slug, error);
      }
    }
    throw new DocNotFoundError(locale, slug, error);
  }
}

/**
 * Read and parse a doc's frontmatter + body markdown.
 * Frontmatter is validated against the zod schema — throws
 * `DocFrontmatterValidationError` on invalid data.
 */
export async function getDoc(
  locale: string,
  slug: string,
): Promise<{ frontmatter: DocFrontmatter; content: string }> {
  const { data, content } = await readDocFile(locale, slug);

  const parsed = docFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new DocFrontmatterValidationError(
      locale,
      slug,
      parsed.error.issues ?? parsed.error,
    );
  }

  return { frontmatter: parsed.data, content };
}

/**
 * Return the raw markdown body (frontmatter stripped) for a doc.
 * Input locale is the preferred locale; falls back to en if zh is missing.
 */
export async function getRawMarkdown(
  locale: string,
  slug: string,
): Promise<string> {
  const { content } = await readDocFile(locale, slug);
  return content;
}

/**
 * Return all doc slugs from the manifest, in display order.
 */
export function getAllDocSlugs(): string[] {
  return docsManifest.flatMap((section) =>
    section.items.map((item) => item.slug),
  );
}
