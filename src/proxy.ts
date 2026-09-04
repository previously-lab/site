import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Markdown content negotiation (acceptmarkdown.com).
 *
 * Agents that send `Accept: text/markdown` get the raw-markdown variant
 * instead of HTML:
 *   /{locale}              → /llms.txt                       (site index)
 *   /{locale}/docs/{slug}  → /{locale}/docs/{slug}/llms.txt  (raw doc source)
 *   /{locale}/blog         → /{locale}/blog/llms.txt         (post list)
 *   /{locale}/blog/{slug}  → /{locale}/blog/{slug}/llms.txt  (raw post source)
 *
 * Both variants live on the same canonical URL, so every response for these
 * paths carries `Vary: Accept` — otherwise a CDN could hand the cached HTML
 * variant to an agent that asked for markdown (or the reverse).
 */
const LOCALE_HOME_RE = /^\/(en|zh)\/?$/;
const DOC_PAGE_RE = /^\/(en|zh)\/docs\/([^/]+?)\/?$/;
const BLOG_INDEX_RE = /^\/(en|zh)\/blog\/?$/;
const BLOG_PAGE_RE = /^\/(en|zh)\/blog\/([^/]+?)\/?$/;

/**
 * Trust anchor pages probed by agent checkers at the unprefixed URL.
 * next-intl would 307 them to /en/...; some crawlers don't follow, so
 * serve the English page directly (rewrite — canonical still points at
 * the /en URL).
 */
const ROOT_TRUST_PATHS = new Set(["/about", "/contact", "/privacy"]);

function wantsMarkdown(req: NextRequest): boolean {
  return (req.headers.get("accept") ?? "").includes("text/markdown");
}

/** Append Accept to Vary without dropping the existing Next.js entries. */
function addVaryAccept(res: Response): void {
  const existing = res.headers.get("vary");
  if (!existing) {
    res.headers.set("vary", "Accept");
  } else if (!existing.toLowerCase().includes("accept")) {
    res.headers.set("vary", `${existing}, Accept`);
  }
}

export default function proxy(req: NextRequest): Response {
  const { pathname } = req.nextUrl;
  const isHome = LOCALE_HOME_RE.test(pathname);
  const doc = DOC_PAGE_RE.exec(pathname);
  const blogIndex = BLOG_INDEX_RE.exec(pathname);
  const post = BLOG_PAGE_RE.exec(pathname);

  if (wantsMarkdown(req)) {
    const target = doc
      ? `/${doc[1]}/docs/${doc[2]}/llms.txt`
      : post
        ? `/${post[1]}/blog/${post[2]}/llms.txt`
        : blogIndex
          ? `/${blogIndex[1]}/blog/llms.txt`
          : isHome || pathname === "/"
            ? "/llms.txt"
            : null;
    if (target) {
      const url = req.nextUrl.clone();
      url.pathname = target;
      const res = NextResponse.rewrite(url);
      addVaryAccept(res);
      return res;
    }
  }

  // Unprefixed trust pages — serve directly instead of 307-hop.
  if (ROOT_TRUST_PATHS.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.rewrite(url);
  }

  const res = intlMiddleware(req);
  // HTML variant of a negotiated path — declare the Accept variance too.
  if (isHome || doc || blogIndex || post) addVaryAccept(res);
  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
