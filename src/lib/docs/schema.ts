import { z } from "zod";

/**
 * Zod schema for MDX doc frontmatter.
 * Validates title (required), description (required), and optional order.
 */
export const docFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number().optional(),
});

/** Inferred TypeScript type for valid doc frontmatter. */
export type DocFrontmatter = z.infer<typeof docFrontmatterSchema>;
