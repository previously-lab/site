import { setRequestLocale, getTranslations, getMessages } from "next-intl/server";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/hero-section";
import { ProductSection } from "@/components/landing/product-section";
import { TimelineVisual } from "@/components/landing/timeline-visual";
import { SelfModelVisual } from "@/components/landing/self-model-visual";
import { ThinkingVisual } from "@/components/landing/thinking-visual";
import { TimeTravelVisual } from "@/components/landing/time-travel-visual";
import { GitHubRepoVisual } from "@/components/landing/github-repo-visual";
import { BackgroundLoopVisual } from "@/components/landing/background-loop-visual";
import { OpenSourceVisual } from "@/components/landing/open-source-visual";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { JsonLd } from "@/components/landing/json-ld";
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

function getArray(messages: unknown, path: string): string[] {
  try {
    let current: any = messages;
    for (const key of path.split(".")) current = current?.[key];
    return Array.isArray(current) ? current : [];
  } catch { return []; }
}

function getString(messages: unknown, path: string): string {
  try {
    let current: any = messages;
    for (const key of path.split(".")) current = current?.[key];
    return typeof current === "string" ? current : "";
  } catch { return ""; }
}

export default async function HomePage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Landing" });
  const m = await getMessages();

  const s = (key: string) => getString(m, `Landing.${key}`);
  const a = (key: string) => getArray(m, `Landing.${key}`);

  return (
    <>
      {/* ── Screen 1: Hero ──────────────────────────────── */}
      <HeroSection
        ctaDemo={t("Hero.ctaDemo")}
        ctaDocs={t("Hero.ctaDocs")}
        ctaGithub={t("Hero.ctaGithub")}
        demoUrl={siteConfig.demoUrl}
        githubUrl={siteConfig.githubUrl}
      />

      {/* ── Screen 2: Timeline ──────────────────────────── */}
      <ProductSection
        title={t("Screen2.title")}
        description={t("Screen2.description")}
        docsHref="/docs/timeline"
        docsLabel={t("Screen2.cta")}
        visual={
          <TimelineVisual
            beforeCardLabels={a("Screen2.beforeCardLabels")}
            afterCardLabels={a("Screen2.afterCardLabels")}
            beforeLabel={s("Screen2.beforeLabel")}
            afterLabel={s("Screen2.afterLabel")}
            strandWork={s("Screen2.strandWork")}
            strandTravel={s("Screen2.strandTravel")}
            earlierLabel={s("Screen2.earlierLabel")}
            nowLabel={s("Screen2.nowLabel")}
            legendText={s("Screen2.legendText")}
          />
        }
        variant="muted"
      />

      {/* ── Screen 3: Self-Model ────────────────────────── */}
      <ProductSection
        title={t("Screen3.title")}
        description={t("Screen3.description")}
        docsHref="/docs/memory-model"
        docsLabel={t("Screen3.cta")}
        visual={<SelfModelVisual legend={s("Screen3.legend")} />}
      />

      {/* ── Screen 4: Raw Context ───────────────────────── */}
      <ProductSection
        title={t("Screen4.title")}
        description={t("Screen4.description")}
        docsHref="/docs/architecture"
        docsLabel={t("Screen4.cta")}
        visual={
          <ThinkingVisual
            terminalTitle={s("Screen4.terminalTitle")}
            phase1Label={s("Screen4.phase1Label")}
            phase1Detail={s("Screen4.phase1Detail")}
            phase2Label={s("Screen4.phase2Label")}
            phase2Detail={s("Screen4.phase2Detail")}
            phase3Label={s("Screen4.phase3Label")}
            phase3Detail={s("Screen4.phase3Detail")}
            cursorText={s("Screen4.cursorText")}
          />
        }
        variant="muted"
      />

      {/* ── Screen 5: Time Travel ───────────────────────── */}
      <ProductSection
        title={t("Screen5.title")}
        description={t("Screen5.description")}
        docsHref="/docs/slices"
        docsLabel={t("Screen5.cta")}
        visual={<TimeTravelVisual nowLabel={s("Screen5.nowLabel")} />}
      />

      {/* ── Screen 6: GitHub-native ─────────────────────── */}
      <ProductSection
        title={t("Screen6.title")}
        description={t("Screen6.description")}
        docsHref="/docs/architecture"
        docsLabel={t("Screen6.cta")}
        visual={
          <GitHubRepoVisual
            repoName={s("Screen6.repoName")}
            repoVisibility={s("Screen6.repoVisibility")}
            lockText={s("Screen6.lockText")}
          />
        }
        variant="muted"
      />

      {/* ── Screen 7: Durable Runs ──────────────────────── */}
      <ProductSection
        title={t("Screen7.title")}
        description={t("Screen7.description")}
        docsHref="/docs/architecture"
        docsLabel={t("Screen7.cta")}
        visual={<BackgroundLoopVisual tagline={s("Screen7.tagline")} />}
        variant="muted"
      />

      {/* ── Screen 8: Open Source ───────────────────────── */}
      <ProductSection
        title={t("Screen8.title")}
        description={t("Screen8.description")}
        docsHref="/docs/getting-started"
        docsLabel={t("Screen8.cta")}
        visual={
          <OpenSourceVisual
            badgeMIT={s("Screen8.badgeMIT")}
            badgeSelfHost={s("Screen8.badgeSelfHost")}
            badgeNoTelemetry={s("Screen8.badgeNoTelemetry")}
            badgeCommunity={s("Screen8.badgeCommunity")}
            githubStars={s("Screen8.githubStars")}
            githubMIT={s("Screen8.githubMIT")}
          />
        }
      />

      {/* ── Screen 9: CTA ───────────────────────────────── */}
      <ScrollReveal className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h2 className="max-w-4xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          {t("Screen9.title")}
        </h2>
        <p className="mt-4 max-w-2xl text-balance text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {t("Screen9.description")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={siteConfig.demoUrl} target="_blank" rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto")}>
            {t("Screen9.ctaDemo")}
          </a>
          <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
            {t("Screen9.ctaGithub")}
          </a>
        </div>
      </ScrollReveal>

      <JsonLd locale={locale} />
    </>
  );
}
