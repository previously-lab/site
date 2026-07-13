import { getRawMarkdown, DocNotFoundError } from "@/lib/docs/content";

/**
 * Route handler returning the raw frontmatter-stripped markdown for a doc
 * as `text/markdown; charset=utf-8`.
 *
 * Used by the copy-markdown-button client component.
 * Returns 404 when the doc file does not exist.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Response> {
  const { locale, slug } = await params;

  try {
    const markdown = await getRawMarkdown(locale, slug);

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    if (error instanceof DocNotFoundError) {
      return new Response("Not found", { status: 404 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
