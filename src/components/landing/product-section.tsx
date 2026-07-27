import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type SectionVariant = "default" | "muted" | "dark";

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
  dark: "bg-foreground text-background",
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
  const isDark = variant === "dark";

  return (
    <ScrollReveal
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8",
        bgMap[variant],
      )}
    >
      {/* Section label — subtle eyebrow above title */}
      <h2
        className={cn(
          "mx-auto max-w-4xl text-balance text-center text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl",
          isDark && "text-background",
        )}
      >
        {title}
      </h2>

      <p
        className={cn(
          "mx-auto mt-4 max-w-2xl text-balance text-center text-xs leading-relaxed text-muted-foreground sm:text-sm",
          isDark && "text-background/60",
        )}
      >
        {description}
      </p>

      {/* Visual — client component slot */}
      <div className="mt-10 flex w-full max-w-5xl items-center justify-center sm:mt-14">
        {visual}
      </div>

      {/* CTA */}
      <div className="mt-10 sm:mt-14">
        <Link
          href={docsHref}
          className={cn(
            buttonVariants({ variant: isDark ? "outline" : "link", size: "default" }),
            "group gap-1.5 text-sm",
            isDark && "border-background/20 text-background hover:bg-background/10",
          )}
        >
          {docsLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </ScrollReveal>
  );
}
