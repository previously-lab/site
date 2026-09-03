import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

/**
 * Renders a blog post body with react-markdown + remark-gfm (tables,
 * strikethrough, task lists, autolinked bare URLs) + rehype-slug
 * (heading ids — the blog TOC scans and links to them).
 *
 * Deliberately separate from the docs `MdxRenderer`: blog posts are
 * plain markdown for long-form reading, styled entirely by the
 * `.blog-prose` rules in globals.css — no MDX, no component mapping.
 */
export function MarkdownRenderer({
  source,
}: {
  source: string;
}): React.ReactElement {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
      {source}
    </ReactMarkdown>
  );
}
