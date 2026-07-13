import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export async function DeeperReading({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {t("DeeperReading.title")}
          </h2>
        </div>

        <div className="mt-10 flex justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{t("DeeperReading.articleTitle")}</CardTitle>
              <CardDescription>
                {"Dev.to — "}
                {siteConfig.devtoUrl}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={siteConfig.devtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full gap-1.5",
                )}
              >
                {t("DeeperReading.cta")}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
