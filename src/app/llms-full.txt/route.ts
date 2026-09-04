import { type NextRequest } from "next/server";
import { siteConfig } from "@/lib/site";
import { flattenDocs } from "@/lib/docs/manifest";
import { getDoc, getRawMarkdown } from "@/lib/docs/content";
import { getPost, getPostList } from "@/lib/blog/content";

/**
 * Route handler serving llms-full.txt — a plain-text file containing the full
 * concatenated markdown body of all English documentation and blog posts.
 *
 * Each doc/post is prefixed with its H1 title and a link back to the live URL,
 * separated by a horizontal rule. This gives LLMs / AI answer-engines the
 * complete content for grounding generation on Previously's documentation.
 */
export async function GET(_request: NextRequest): Promise<Response> {
  const baseUrl = siteConfig.url;
  const allDocs = flattenDocs();
  const parts: string[] = [];

  for (const doc of allDocs) {
    try {
      const { frontmatter, content } = await getDoc("en", doc.slug);
      const url = `${baseUrl}/en/docs/${doc.slug}`;

      parts.push(`# ${frontmatter.title}`);
      parts.push(`> URL: ${url}`);
      parts.push("");
      parts.push(content.trimEnd());
      parts.push("");
      parts.push("---");
      parts.push("");
    } catch {
      const raw = await getRawMarkdown("en", doc.slug);
      const url = `${baseUrl}/en/docs/${doc.slug}`;

      parts.push(`# ${doc.title}`);
      parts.push(`> URL: ${url}`);
      parts.push("");
      parts.push(raw.trimEnd());
      parts.push("");
      parts.push("---");
      parts.push("");
    }
  }

  for (const post of await getPostList("en")) {
    const { frontmatter, content } = await getPost("en", post.slug);
    const url = `${baseUrl}/en/blog/${post.slug}`;

    parts.push(`# ${frontmatter.title}`);
    parts.push(`> URL: ${url}`);
    parts.push("");
    parts.push(content.trimEnd());
    parts.push("");
    parts.push("---");
    parts.push("");
  }

  const body = parts.join("\n").trimEnd() + "\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
