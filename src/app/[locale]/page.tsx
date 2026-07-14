import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { NameCycler } from "@/components/landing/name-cycler";
import {
  ConceptTitle,
  ConceptDescription,
  ConceptContent,
} from "@/components/landing/concept";
import {
  RecallTitle,
  RecallDescription,
} from "@/components/landing/recall";
import {
  DeeperReadingTitle,
  DeeperReadingCard,
} from "@/components/landing/deeper-reading";
import {
  OpenSourceHeader,
  OpenSourceDescription,
} from "@/components/landing/open-source";
import { JsonLd } from "@/components/landing/json-ld";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { TickerLabel } from "@/components/landing/ticker-label";
import {
  TimelineShell,
  TimelineRow,
} from "@/components/landing/timeline-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });

  return {
    title: { absolute: t("Meta.title") },
    description: t("Meta.description"),
    alternates: { canonical: `/${locale}` },
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
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="sr-only">{siteConfig.tagline}</h1>
        <div aria-hidden="true">
          <TextGenerateEffect
            words="Previously on"
            className="text-6xl font-light leading-none tracking-tighter text-foreground sm:text-7xl md:text-8xl lg:text-9xl"
            filter
            duration={0.5}
            delay={0.3}
            staggerDelay={0.25}
          />
        </div>
        <NameCycler />
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

      {/* ── Timeline ────────────────────────────────────── */}
      <TimelineShell>
        {/* 01 — Concept */}
        <ScrollReveal className="relative flex min-h-screen w-full flex-col items-center justify-center">
          <TimelineRow
            number={<TickerLabel value="01" />}
            level="section"
            className="mb-4"
          >
            <ConceptTitle locale={locale} />
          </TimelineRow>
          <TimelineRow
            className="mb-8 sm:mb-10"
          >
            <ConceptDescription locale={locale} />
          </TimelineRow>
          <TimelineRow>
            <ConceptContent locale={locale} />
          </TimelineRow>
        </ScrollReveal>

        {/* 02 — Recall: tinted, page-turn rhythm */}
        <ScrollReveal className="relative flex min-h-screen w-full flex-col items-center justify-center bg-muted/20">
          <TimelineRow
            number={<TickerLabel value="02" />}
            level="section"
            className="mb-4"
          >
            <RecallTitle locale={locale} />
          </TimelineRow>
          <TimelineRow>
            <RecallDescription locale={locale} />
          </TimelineRow>
        </ScrollReveal>

        {/* 03 — Deeper Reading */}
        <ScrollReveal className="relative flex min-h-screen w-full flex-col items-center justify-center">
          <TimelineRow
            number={<TickerLabel value="03" />}
            level="section"
            className="mb-8 sm:mb-10"
          >
            <DeeperReadingTitle locale={locale} />
          </TimelineRow>
          <TimelineRow>
            <DeeperReadingCard locale={locale} />
          </TimelineRow>
        </ScrollReveal>

        {/* 04 — Open Source: tinted, page-turn rhythm */}
        <ScrollReveal className="relative flex min-h-screen w-full flex-col items-center justify-center bg-muted/20">
          <TimelineRow
            number={<TickerLabel value="04" />}
            level="section"
            className="mb-8 sm:mb-10"
          >
            <OpenSourceHeader locale={locale} />
          </TimelineRow>
          <TimelineRow>
            <OpenSourceDescription locale={locale} />
          </TimelineRow>
        </ScrollReveal>
      </TimelineShell>

      <JsonLd locale={locale} />
    </>
  );
}
