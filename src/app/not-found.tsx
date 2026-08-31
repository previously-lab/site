import Link from "next/link";
import { siteConfig } from "@/lib/site";

/**
 * Global 404 — rendered for any unmatched path outside the docs tree.
 *
 * Agent-friendly by design: besides the human-facing message, the body
 * carries plain links to the machine-readable recovery points (llms.txt,
 * sitemap, docs index) so crawlers and agents can find their way back
 * instead of hitting a dead end.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center text-foreground">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        This path doesn&apos;t exist on {siteConfig.name}. If you&apos;re an
        agent or crawler, start from one of the machine-readable entry points
        below.
      </p>
      <nav aria-label="Site map">
        <ul className="flex flex-col items-center gap-2 text-sm">
          <li>
            <Link
              href="/en"
              className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              Home ({siteConfig.url}/en)
            </Link>
          </li>
          <li>
            <Link
              href="/en/docs/introduction"
              className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              Documentation index
            </Link>
          </li>
          <li>
            <a
              href="/llms.txt"
              className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              llms.txt — LLM-oriented site index
            </a>
          </li>
          <li>
            <a
              href="/sitemap.xml"
              className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              sitemap.xml — full URL listing
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
