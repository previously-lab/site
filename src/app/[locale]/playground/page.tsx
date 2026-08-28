import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site";
import { Playground } from "@/components/playground/playground";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Playground" });

  return {
    title: t("Meta.title"),
    description: t("Meta.description"),
    alternates: {
      canonical: `/${locale}/playground`,
      languages: { en: "/en/playground", zh: "/zh/playground" },
    },
    openGraph: {
      title: t("Meta.title"),
      description: t("Meta.description"),
      url: `/${locale}/playground`,
      siteName: siteConfig.name,
    },
  };
}

/**
 * The playground page — a live, read-only demo of Previously running on the
 * `you` dataset. Each section is a self-contained fake chat window for one
 * preset; the same <Playground preset="…" /> component is usable from MDX.
 */
export default async function PlaygroundPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Playground" });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Intro */}
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {t("Intro.eyebrow")}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {t("Intro.title")}
      </h1>
      <p className="mt-4 leading-relaxed text-foreground/85">
        {t("Intro.body")}
      </p>
      <p className="mt-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {t("Intro.rules")}
      </p>

      {/* Recall presets */}
      <h2 className="mt-12 mb-4 text-xl font-semibold tracking-tight">
        {t("Intro.recallHeading")}
      </h2>
      <div className="space-y-6">
        <Playground preset="recall-worldcup" />
        <Playground preset="recall-mom" />
        <Playground preset="recall-marathon" />
      </div>

      {/* Evolution preset */}
      <h2 className="mt-12 mb-4 text-xl font-semibold tracking-tight">
        {t("Intro.evolutionHeading")}
      </h2>
      <Playground preset="evolution-card" />

      {/* Anatomy preset */}
      <h2 className="mt-12 mb-4 text-xl font-semibold tracking-tight">
        {t("Intro.anatomyHeading")}
      </h2>
      <Playground preset="slice-anatomy" />
    </div>
  );
}
