import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type SectionVariant = "default" | "muted";

interface ProductSectionProps {
  title: string;
  description: string;
  visual: ReactNode;
  docsHref: string;
  docsLabel: string;
  variant?: SectionVariant;
}

const bgMap: Record<SectionVariant, string> = {
  default: "",
  muted: "bg-muted/20",
};

/**
 * Reusable full-screen product section.
 *
 * Every screen in the v0.5 landing page follows this pattern:
 *   title → description → animated visual → "Read more" CTA
 *
 * The visual slot accepts any ReactNode — typically a "use client" animation
 * component. The wrapper stays server-renderable for title/description/CTA.
 */
export function ProductSection({
  title,
  description,
  visual,
  docsHref,
  docsLabel,
  variant = "default",
}: ProductSectionProps) {
  return (
    <ScrollReveal
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8",
        bgMap[variant ?? "default"],
      )}
    >
      <h2 className="mx-auto max-w-4xl text-balance text-center text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-balance text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {description}
      </p>

      <div className="mt-10 flex w-full max-w-5xl items-center justify-center sm:mt-14">
        {visual}
      </div>

      <div className="mt-10 sm:mt-14">
        <Link
          href={docsHref}
          className={cn(buttonVariants({ variant: "link", size: "default" }), "group gap-1.5 text-sm")}
        >
          {docsLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </ScrollReveal>
  );
}
