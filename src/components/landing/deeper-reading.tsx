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

export async function DeeperReadingTitle({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });
  return (
    <h2 className="text-balance text-center text-2xl font-semibold tracking-tight sm:text-3xl">
      {t("DeeperReading.title")}
    </h2>
  );
}

export async function DeeperReadingCard({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <Card className="mx-auto max-w-lg text-center">
      <CardHeader>
        <CardTitle>
          <a
            href={siteConfig.devtoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-muted-foreground"
          >
            {t("DeeperReading.articleTitle")}
          </a>
        </CardTitle>
        <CardDescription>Dev.to</CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href={siteConfig.devtoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          {t("DeeperReading.cta")}
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </CardContent>
    </Card>
  );
}
