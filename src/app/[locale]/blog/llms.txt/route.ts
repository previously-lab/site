import { siteConfig } from "@/lib/site";
import { getPostList } from "@/lib/blog/content";

/**
 * Route handler returning the markdown variant of the blog index — the
 * target of the proxy's `Accept: text/markdown` negotiation on /blog.
 * Lists every post newest-first as `- [title](url): description` bullets.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
): Promise<Response> {
  const { locale } = await params;
  const baseUrl = siteConfig.url;

  const lines: string[] = [`# ${siteConfig.productName} — Blog`, ""];

  for (const post of await getPostList(locale)) {
    lines.push(
      `- [${post.frontmatter.title}](${baseUrl}/${post.resolvedLocale}/blog/${post.slug}): ${post.frontmatter.description}`,
    );
  }

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
