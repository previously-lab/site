import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export async function RecallTitle({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });
  return (
    <h2 className="text-balance text-center text-2xl font-semibold tracking-tight sm:text-3xl">
      {t("Recall.title")}
    </h2>
  );
}

export async function RecallDescription({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <div className="mx-auto max-w-2xl space-y-4 text-center">
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        {t("Recall.description")}
      </p>
      <Link
        href="/docs/recall"
        className={cn(buttonVariants({ variant: "link" }), "gap-1.5 text-base")}
      >
        {t("Recall.cta")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
