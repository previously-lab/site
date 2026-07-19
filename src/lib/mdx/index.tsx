import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";

import { mdxComponents } from "@/components/mdx/mdx-components";

/**
 * Async server component that renders MDX content with the following plugins:
 * - remark-gfm for tables, strikethrough, task lists
 * - rehype-slug for heading anchor IDs
 * - rehype-autolink-headings for clickable heading links
 * - @shikijs/rehype for syntax-highlighted code blocks (dual light/dark theme)
 *
 * Uses the shared MDX components map from `@/components/mdx/mdx-components`.
 */
export async function MdxRenderer({
  source,
}: {
  source: string;
}): Promise<React.ReactElement> {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "wrap",
                properties: {
                  className: "anchor-link",
                },
              },
            ],
            [
              rehypeShiki,
              {
                themes: {
                  light: "github-light",
                  dark: "github-dark",
                },
              },
            ],
          ],
        },
      }}
      components={mdxComponents}
    />
  );
}
