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

/** Extract a nested array value from next-intl messages without type gymnastics. */
function getArray(messages: unknown, path: string): string[] {
  try {
    const keys = path.split(".");
    let current: any = messages;
    for (const key of keys) {
      current = current?.[key];
    }
    return Array.isArray(current) ? current : [];
  } catch {
    return [];
  }
}

function getString(messages: unknown, path: string): string {
  try {
    const keys = path.split(".");
    let current: any = messages;
    for (const key of keys) {
      current = current?.[key];
    }
    return typeof current === "string" ? current : "";
  } catch {
    return "";
  }
}

export default async function HomePage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Landing" });
  const messages = await getMessages();

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
            beforeCardLabels={getArray(messages, "Landing.Screen2.beforeCardLabels")}
            afterCardLabels={getArray(messages, "Landing.Screen2.afterCardLabels")}
            beforeLabel={getString(messages, "Landing.Screen2.beforeLabel")}
            afterLabel={getString(messages, "Landing.Screen2.afterLabel")}
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
        visual={<SelfModelVisual />}
      />

      {/* ── Screen 4: Transparency ──────────────────────── */}
      <ProductSection
        title={t("Screen4.title")}
        description={t("Screen4.description")}
        docsHref="/docs/architecture"
        docsLabel={t("Screen4.cta")}
        visual={<ThinkingVisual />}
        variant="muted"
      />

      {/* ── Screen 5: Time Travel ───────────────────────── */}
      <ProductSection
        title={t("Screen5.title")}
        description={t("Screen5.description")}
        docsHref="/docs/slices"
        docsLabel={t("Screen5.cta")}
        visual={<TimeTravelVisual />}
      />

      {/* ── Screen 6: GitHub-native ─────────────────────── */}
      <ProductSection
        title={t("Screen6.title")}
        description={t("Screen6.description")}
        docsHref="/docs/architecture"
        docsLabel={t("Screen6.cta")}
        visual={<GitHubRepoVisual />}
        variant="muted"
      />

      {/* ── Screen 7: Background Loops ──────────────────── */}
      <ProductSection
        title={t("Screen7.title")}
        description={t("Screen7.description")}
        docsHref="/docs/configuration"
        docsLabel={t("Screen7.cta")}
        visual={<BackgroundLoopVisual />}
        variant="muted"
      />

      {/* ── Screen 8: Open Source ───────────────────────── */}
      <ProductSection
        title={t("Screen8.title")}
        description={t("Screen8.description")}
        docsHref="/docs/getting-started"
        docsLabel={t("Screen8.cta")}
        visual={<OpenSourceVisual />}
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
          <a
            href={siteConfig.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            {t("Screen9.ctaDemo")}
          </a>
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            {t("Screen9.ctaGithub")}
          </a>
        </div>
      </ScrollReveal>

      <JsonLd locale={locale} />
    </>
  );
}
