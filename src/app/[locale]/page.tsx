import { setRequestLocale, getTranslations, getMessages } from "next-intl/server";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { HeroSection } from "@/components/landing/hero-section";
import type { BriefingData } from "@/components/landing/briefing-card";
import { ProofBand, type ProofSlice, type ProofPick } from "@/components/landing/proof-band";
import { ActSection } from "@/components/landing/act-section";
import { TimelineVisual, type TimelineBeat } from "@/components/landing/timeline-visual";
import { NowQuestion, type NowQuestionRef } from "@/components/landing/now-question";
import { SelfModelVisual } from "@/components/landing/self-model-visual";
import {
  PortraitVisual,
  type PortraitEntry,
  type HypothesisItem,
} from "@/components/landing/portrait-visual";
import { ThinkingVisual } from "@/components/landing/thinking-visual";
import { ThreeTimelinesVisual, type ThreeTimelineNode } from "@/components/landing/three-timelines-visual";
import { OrchestrationVisual } from "@/components/landing/orchestration-visual";
import { TrustBand, type TrustCard } from "@/components/landing/trust-band";
import { GetStartedSection, type GetStartedPath } from "@/components/landing/get-started-section";
import { FinaleSection } from "@/components/landing/finale-section";
import { StageAtmosphere } from "@/components/landing/stage-atmosphere";
import { JsonLd } from "@/components/landing/json-ld";

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
      // The page-level openGraph replaces the layout's wholesale, so the
      // image and type set in [locale]/layout.tsx must be repeated here —
      // otherwise the homepage ships without og:image / og:type.
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      title: t("Meta.title"),
      description: t("Meta.description"),
    },
  };
}

function getString(messages: unknown, path: string): string {
  let current: unknown = messages;
  for (const key of path.split(".")) {
    current = (current as Record<string, unknown>)?.[key];
  }
  return typeof current === "string" ? current : "";
}

function getList<T>(messages: unknown, path: string): T[] {
  let current: unknown = messages;
  for (const key of path.split(".")) {
    current = (current as Record<string, unknown>)?.[key];
  }
  return Array.isArray(current) ? (current as T[]) : [];
}

/**
 * The landing page — a cinematic dark cold open of "Previously on you."
 * Seven acts + finale:
 *   0 Hero        — giant tagline + self-typing arrival briefing
 *   1 Proof       — code-drawn mock of the real app UI
 *   2 Act 01      — Time, not threads.       (centered stack)
 *   3 Act 02      — Three timelines.         (centered stack)
 *   4 Act 03      — A memory that learns.    (visual left, text right)
 *   5 Act 04      — A portrait of who you are. (text left, visual right)
 *   6 Act 05      — No black box.            (centered stack)
 *   7 Act 06      — Specialists, not brute force. (centered stack)
 *   8 Trust band  — three compact cards
 *   9 Get started — the two ways to run it: Vercel (recommended) / npm client
 *  10 Finale      — tagline + NOW dot pulse + CTAs
 *
 * The .landing-scope wrapper makes this route theme-aware (cinematic
 * dark palette in dark mode, product light theme in light mode);
 * /docs keeps its own styling.
 */
export default async function HomePage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Landing" });
  const m = await getMessages();

  const s = (key: string) => getString(m, `Landing.${key}`);
  const list = <T,>(key: string) => getList<T>(m, `Landing.${key}`);

  const briefing: BriefingData = {
    title: s("Hero.briefingTitle"),
    recapLabel: s("Hero.recapLabel"),
    entries: list<BriefingData["entries"][number]>("Hero.briefingEntries"),
    focusLabel: s("Hero.focusLabel"),
    focusText: s("Hero.focusText"),
    threadsLabel: s("Hero.threadsLabel"),
    threadsText: s("Hero.threadsText"),
  };

  return (
    <div className="landing-scope">
      {/* Stage atmosphere — aurora glows, grid texture, vignette */}
      <StageAtmosphere />

      {/* ── Act 0: Hero — the cold open ─────────────────── */}
      <HeroSection
        line1={t("Hero.line1")}
        line2={t("Hero.line2")}
        briefing={briefing}
        beatDates={list<TimelineBeat>("Act1.beats").map((b) => b.date)}
        earlierLabel={t("Hero.earlierLabel")}
        nowLabel={t("Hero.nowLabel")}
        ctaDemo={t("Hero.ctaDemo")}
        ctaGithub={t("Hero.ctaGithub")}
        ctaDocs={t("Hero.ctaDocs")}
        githubUrl={siteConfig.githubUrl}
      />

      {/* ── Product proof band ──────────────────────────── */}
      <ProofBand
        caption={t("Proof.caption")}
        windowTitle={s("Proof.windowTitle")}
        slices={list<ProofSlice>("Proof.slices")}
        nowLabel={s("Proof.nowLabel")}
        userMsg={t("Proof.userMsg")}
        recallStep={t("Proof.recallStep")}
        agentMsg={t("Proof.agentMsg")}
        turn2User={t("Proof.turn2User")}
        picks={list<ProofPick>("Proof.picks")}
        picksNote={t("Proof.picksNote")}
        turn3User={t("Proof.turn3User")}
      />

      {/* ── Act 01: Time, not threads. ──────────────────── */}
      <ActSection
        eyebrow={t("Act1.eyebrow")}
        title={t("Act1.title")}
        body={t("Act1.body")}
        docsHref="/docs/timeline"
        docsLabel={t("Act1.cta")}
        layout="center"
        visual={
          <TimelineVisual
            year={s("Act1.year")}
            beats={list<TimelineBeat>("Act1.beats")}
            strandFriends={s("Act1.strandFriends")}
            strandRunning={s("Act1.strandRunning")}
            strandFamily={s("Act1.strandFamily")}
            strandAlex={s("Act1.strandAlex")}
            strandCamping={s("Act1.strandCamping")}
            legendText={s("Act1.legendText")}
            /* The payoff of NOW: one question across every strand. */
            payoff={
              <NowQuestion
                question={s("Act1.nowQuestion.question")}
                answer={s("Act1.nowQuestion.answer")}
                refs={list<{ date: string; note: string; strand: string }>(
                  "Act1.nowQuestion.refs",
                ).map((r): NowQuestionRef => ({
                  date: r.date,
                  note: r.note,
                  color:
                    {
                      running: "oklch(0.7 0.12 85)",
                      alex: "oklch(0.72 0.14 350)",
                      friends: "oklch(0.6 0.23 260)",
                    }[r.strand] ?? "oklch(0.556 0 0)",
                }))}
                meta={s("Act1.nowQuestion.meta")}
                liveCta={s("Act1.nowQuestion.liveCta")}
              />
            }
          />
        }
      />

      {/* ── Act 02: Three timelines. ────────────────────── */}
      <ActSection
        eyebrow={t("Act2.eyebrow")}
        title={t("Act2.title")}
        body={t("Act2.body")}
        docsHref="/docs/memory-model"
        docsLabel={t("Act2.cta")}
        layout="center"
        visual={
          <ThreeTimelinesVisual
            agentLabel={s("Act2.agentLabel")}
            agentFile={s("Act2.agentFile")}
            coreLabel={s("Act2.coreLabel")}
            coreFile={s("Act2.coreFile")}
            lifeLabel={s("Act2.lifeLabel")}
            lifeFile={s("Act2.lifeFile")}
            agentNodes={list<ThreeTimelineNode>("Act2.agentNodes")}
            coreEvents={list<ThreeTimelineNode>("Act2.coreEvents")}
            lifeNodes={list<ThreeTimelineNode>("Act2.lifeNodes")}
          />
        }
      />

      {/* ── Act 03: A memory that learns. ───────────────── */}
      <ActSection
        eyebrow={t("Act3.eyebrow")}
        title={t("Act3.title")}
        body={t("Act3.body")}
        docsHref="/docs/memory-model"
        docsLabel={t("Act3.cta")}
        layout="text-right"
        accent="emerald"
        visual={
          <SelfModelVisual
            cardTitle={s("Act3.cardTitle")}
            identityLabel={s("Act3.identityLabel")}
            identityValue={t("Act3.identityValue")}
            patternLabel={s("Act3.patternLabel")}
            oldValue={t("Act3.oldValue")}
            newValue={t("Act3.newValue")}
            newRef={s("Act3.newRef")}
            behaviorLabel={s("Act3.behaviorLabel")}
            behaviorValue={t("Act3.behaviorValue")}
            behaviorRef={s("Act3.behaviorRef")}
            recentLabel={s("Act3.recentLabel")}
            recentItems={list<{ text: string; meta: string }>("Act3.recentItems")}
            updatedNote={s("Act3.updatedNote")}
          />
        }
      />

      {/* ── Act 04: A portrait of who you are. ──────────── */}
      <ActSection
        eyebrow={t("ActPortrait.eyebrow")}
        title={t("ActPortrait.title")}
        body={t("ActPortrait.body")}
        docsHref="/docs/evolution"
        docsLabel={t("ActPortrait.cta")}
        layout="text-left"
        accent="emerald"
        visual={
          <PortraitVisual
            cardTitle={s("ActPortrait.cardTitle")}
            portraitLabel={s("ActPortrait.portraitLabel")}
            entries={list<PortraitEntry>("ActPortrait.entries")}
            hypothesesLabel={s("ActPortrait.hypothesesLabel")}
            falsifyLabel={s("ActPortrait.falsifyLabel")}
            proposedLabel={s("ActPortrait.proposedLabel")}
            promotedLabel={s("ActPortrait.promotedLabel")}
            retiredLabel={s("ActPortrait.retiredLabel")}
            promoteHint={s("ActPortrait.promoteHint")}
            hypotheses={list<HypothesisItem>("ActPortrait.hypotheses")}
          />
        }
      />

      {/* ── Act 05: No black box. ───────────────────────── */}
      <ActSection
        eyebrow={t("Act4.eyebrow")}
        title={t("Act4.title")}
        body={t("Act4.body")}
        docsHref="/docs/architecture"
        docsLabel={t("Act4.cta")}
        layout="center"
        visual={
          <ThinkingVisual
            terminalTitle={s("Act4.terminalTitle")}
            query={t("Act4.query")}
            workerLabel={s("Act4.workerLabel")}
            workerDetail={s("Act4.workerDetail")}
            pointersLabel={s("Act4.pointersLabel")}
            mainLabel={s("Act4.mainLabel")}
            mainDetail={s("Act4.mainDetail")}
            answerLabel={s("Act4.answerLabel")}
            sliceSummaries={list<string>("Act4.sliceSummaries")}
          />
        }
      />

      {/* ── Act 06: Specialists, not brute force. ───────── */}
      <ActSection
        eyebrow={t("Act5.eyebrow")}
        title={t("Act5.title")}
        body={t("Act5.body")}
        docsHref="/docs/architecture"
        docsLabel={t("Act5.cta")}
        layout="center"
        accent="blue"
        visual={
          <OrchestrationVisual
            hubLabel={s("Act5.hubLabel")}
            hubDetail={s("Act5.hubDetail")}
            w1Label={s("Act5.w1Label")}
            w1Detail={s("Act5.w1Detail")}
            w2Label={s("Act5.w2Label")}
            w2Detail={s("Act5.w2Detail")}
            w3Label={s("Act5.w3Label")}
            w3Detail={s("Act5.w3Detail")}
            w4Label={s("Act5.w4Label")}
            w4Detail={s("Act5.w4Detail")}
          />
        }
      />

      {/* ── Trust band ──────────────────────────────────── */}
      <TrustBand
        cards={list<TrustCard>("Trust.cards")}
        visuals={{
          repo: {
            root: s("Trust.repo.root"),
            rows: list<{ text: string; note?: string }>("Trust.repo.rows"),
            file: s("Trust.repo.file"),
            lines: list<string>("Trust.repo.lines"),
          },
          run: {
            tabLabel: s("Trust.run.tabLabel"),
            closedLabel: s("Trust.run.closedLabel"),
            runningLabel: s("Trust.run.runningLabel"),
            resumedLabel: s("Trust.run.resumedLabel"),
          },
          oss: {
            command: s("Trust.oss.command"),
            badges: list<string>("Trust.oss.badges"),
          },
        }}
      />

      {/* ── Get started — the two ways to run it ────────── */}
      <GetStartedSection
        eyebrow={t("GetStarted.eyebrow")}
        title={t("GetStarted.title")}
        body={t("GetStarted.body")}
        cloud={{
          badge: s("GetStarted.cloud.badge"),
          title: s("GetStarted.cloud.title"),
          body: s("GetStarted.cloud.body"),
          cta: s("GetStarted.cloud.cta"),
          notes: list<string>("GetStarted.cloud.notes"),
          tradeoff: s("GetStarted.cloud.tradeoff"),
          recommended: true,
          href: "/docs/deployment",
        }}
        local={{
          badge: s("GetStarted.local.badge"),
          title: s("GetStarted.local.title"),
          body: s("GetStarted.local.body"),
          cta: s("GetStarted.local.cta"),
          commands: list<string>("GetStarted.local.commands"),
          comment: s("GetStarted.local.comment"),
          notes: list<string>("GetStarted.local.notes"),
          tradeoff: s("GetStarted.local.tradeoff"),
          href: "/docs/local-first",
        }}
      />

      {/* ── Finale — loop back to the cold open ─────────── */}
      <FinaleSection
        title={t("Finale.title")}
        subtitle={t("Finale.subtitle")}
        ctaDemo={t("Finale.ctaDemo")}
        ctaGithub={t("Finale.ctaGithub")}
        githubUrl={siteConfig.githubUrl}
      />

      <JsonLd locale={locale} />
    </div>
  );
}
