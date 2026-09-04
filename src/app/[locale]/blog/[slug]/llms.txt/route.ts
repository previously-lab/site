import { getPost, BlogPostNotFoundError } from "@/lib/blog/content";

/**
 * Route handler returning the raw frontmatter-stripped markdown for a blog
 * post as `text/markdown; charset=utf-8` — the mirror of the docs llms.txt
 * route, used by the proxy's `Accept: text/markdown` negotiation.
 *
 * Falls back to the other locale when the requested translation is missing.
 * Returns 404 when the post does not exist in either locale.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Response> {
  const { locale, slug } = await params;

  try {
    const { content } = await getPost(locale, slug);

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    if (error instanceof BlogPostNotFoundError) {
      return new Response("Not found", { status: 404 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
