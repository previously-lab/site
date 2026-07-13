import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export async function Recall({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {t("Recall.title")}
        </h2>

        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("Recall.description")}
        </p>

        <div className="mt-8">
          <Link
            href="/docs/recall"
            className={cn(
              buttonVariants({ variant: "link" }),
              "gap-1.5 text-base",
            )}
          >
            {t("Recall.cta")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
