import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { NameCycler } from "@/components/landing/name-cycler";
import { Concept } from "@/components/landing/concept";
import { Recall } from "@/components/landing/recall";
import { DeeperReading } from "@/components/landing/deeper-reading";
import { OpenSource } from "@/components/landing/open-source";
import { JsonLd } from "@/components/landing/json-ld";
import { TickerLabel } from "@/components/landing/ticker-label";
import { TimelineShell, TimelineSection } from "@/components/landing/timeline-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });

  return {
    title: t("Meta.title"),
    description: t("Meta.description"),
    alternates: {
      canonical: `/${locale}`,
    },
    openGraph: {
      title: t("Meta.title"),
      description: t("Meta.description"),
      url: `/${locale}`,
    },
    twitter: {
      title: t("Meta.title"),
      description: t("Meta.description"),
    },
  };
}

export default async function HomePage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        {/* "Previously on" — cinematic, not translated */}
        <div className="font-[family-name:var(--font-raleway)]">
          <TextGenerateEffect
            words="Previously on"
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-foreground leading-none tracking-tighter"
            filter={true}
            duration={0.5}
            delay={0.3}
            staggerDelay={0.25}
          />
        </div>

        {/* Name cycler — scrolls through names, lands on "You." */}
        <NameCycler />

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <a
            href={siteConfig.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-full sm:w-auto",
            )}
          >
            {t("Hero.ctaDemo")}
          </a>

          <Link
            href="/docs/introduction"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full sm:w-auto",
            )}
          >
            {t("Hero.ctaDocs")}
          </Link>

          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full sm:w-auto",
            )}
          >
            {t("Hero.ctaGithub")}
          </a>
        </div>
      </section>

      {/* ── Timeline sections ────────────────────────────── */}
      <TimelineShell>
        <TimelineSection label={<TickerLabel value={1} />}>
          <Concept locale={locale} />
        </TimelineSection>

        <TimelineSection label={<TickerLabel value={2} />}>
          <Recall locale={locale} />
        </TimelineSection>

        <TimelineSection label={<TickerLabel value={3} />}>
          <DeeperReading locale={locale} />
        </TimelineSection>

        <TimelineSection label={<TickerLabel value={4} />}>
          <OpenSource locale={locale} />
        </TimelineSection>
      </TimelineShell>

      <JsonLd />
    </>
  );
}
