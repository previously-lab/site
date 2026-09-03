import { z } from "zod";

/**
 * Zod schema for blog post frontmatter.
 * Validates title (required), date (required, YYYY-MM-DD), and
 * description (required). The same slug in both locales is the
 * cross-language link — no translationSlug needed.
 */
export const blogFrontmatterSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string(),
});

/** Inferred TypeScript type for valid blog frontmatter. */
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
