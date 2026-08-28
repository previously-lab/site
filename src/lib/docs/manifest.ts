/**
 * Docs manifest — single source of truth for documentation navigation,
 * slug ordering, and static param generation.
 *
 * Sections and item ordering define sidebar layout and prev/next navigation.
 * Content bodies live in `content/docs/{locale}/{slug}.mdx`; displayed titles
 * come from each doc's frontmatter (localized) — `title` here is the English
 * fallback for non-localized contexts (e.g. llms.txt).
 */

export type DocItem = {
  slug: string;
  title: string;
};

export type DocSection = {
  /** i18n key under Docs.sections — used to look up the translated section label. */
  i18nKey: string;
  /** Fallback English label (used when translations are unavailable). */
  title: string;
  items: DocItem[];
};

export const docsManifest: DocSection[] = [
  {
    i18nKey: "start",
    title: "Start Here",
    items: [
      { slug: "introduction", title: "Introduction" },
      { slug: "why", title: "Why Previously" },
      { slug: "getting-started", title: "Getting Started" },
    ],
  },
  {
    i18nKey: "memory",
    title: "How Memory Forms",
    items: [
      { slug: "slices", title: "Time Slices" },
      { slug: "timeline", title: "The Timeline" },
      { slug: "strands", title: "Strands" },
      { slug: "scribe", title: "The Scribe" },
      { slug: "ingest", title: "The Only Way In" },
      { slug: "memory-model", title: "The Memory Model" },
    ],
  },
  {
    i18nKey: "mind",
    title: "How It Remembers and Thinks",
    items: [
      { slug: "recall", title: "Recall" },
      { slug: "web-search", title: "The Web Researcher" },
      { slug: "think-deep", title: "The Clean Room" },
      { slug: "colleagues", title: "Colleagues, Not Tools" },
      { slug: "user-card", title: "The User Card" },
      { slug: "evolution", title: "The Evolution Loop" },
    ],
  },
  {
    i18nKey: "client",
    title: "On Your Machine",
    items: [
      { slug: "local-first", title: "Local First" },
      { slug: "your-memory", title: "Your Memory Is a Folder" },
      { slug: "two-engines", title: "Two Engines" },
      { slug: "everyday", title: "Everyday Commands" },
      { slug: "skill-pack", title: "The Skill Pack" },
      { slug: "kernel-supply-chain", title: "The Kernel Supply Chain" },
      { slug: "configuration", title: "Configuration" },
    ],
  },
  {
    i18nKey: "reference",
    title: "Reference",
    items: [
      { slug: "chat-ui", title: "The Chat Interface" },
      { slug: "architecture", title: "Architecture" },
      { slug: "deployment", title: "Deployment" },
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
