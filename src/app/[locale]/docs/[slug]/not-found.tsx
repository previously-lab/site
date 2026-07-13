import { Link } from "@/i18n/navigation";

/**
 * Friendly 404 page for missing docs, with a link back to the first doc.
 */
export default function DocNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        Page not found
      </h2>
      <p className="text-sm text-muted-foreground">
        This documentation page doesn't exist yet.
      </p>
      <Link
        href="/docs/introduction"
        className="text-sm font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
      >
        Back to the docs
      </Link>
    </div>
  );
}
