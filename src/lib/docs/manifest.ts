/**
 * Docs manifest — single source of truth for documentation navigation,
 * slug ordering, and static param generation.
 *
 * Sections and item ordering define sidebar layout and prev/next navigation.
 * Content bodies live in `content/docs/{locale}/{slug}.mdx`.
 */

export type DocItem = {
  slug: string;
  title: string;
};

export type DocSection = {
  title: string;
  items: DocItem[];
};

export const docsManifest: DocSection[] = [
  {
    title: "Overview",
    items: [
      { slug: "introduction", title: "Introduction" },
      { slug: "why", title: "Why Previously" },
    ],
  },
  {
    title: "Concepts",
    items: [
      { slug: "timeline", title: "The Timeline" },
      { slug: "slices", title: "Slices" },
      { slug: "strands", title: "Strands" },
      { slug: "memory-model", title: "Memory Model" },
      { slug: "recall", title: "Recall" },
    ],
  },
  {
    title: "Guides",
    items: [
      { slug: "getting-started", title: "Getting Started" },
      { slug: "deployment", title: "Deployment" },
    ],
  },
  {
    title: "Reference",
    items: [
      { slug: "configuration", title: "Configuration" },
      { slug: "architecture", title: "Architecture" },
      { slug: "faq", title: "FAQ" },
    ],
  },
];

/** Return every doc item flattened across sections in display order. */
export function flattenDocs(): DocItem[] {
  return docsManifest.flatMap((section) => section.items);
}

/**
 * Given a doc slug, return the previous and next items for navigation.
 * Returns `null` for prev if it is the first item, `null` for next if last.
 * Returns both `null` if the slug is not found.
 */
export function getDocNeighbors(
  slug: string,
): { prev: DocItem | null; next: DocItem | null } {
  const flat = flattenDocs();
  const index = flat.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}
