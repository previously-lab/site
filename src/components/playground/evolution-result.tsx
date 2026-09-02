"use client";

import { useTranslations } from "next-intl";
import { Activity, Sparkles } from "lucide-react";
import type {
  DirectionChanges,
  EvolutionResult,
  FitnessBucket,
  FitnessLedgerEntry,
} from "@/lib/playground/contracts";

/** Kernel trigger: a bucket whose current-generation net reaches this fires evolution. */
const TRIGGER_NET = -5;

const BUCKETS: readonly FitnessBucket[] = [
  "card",
  "recall",
  "search",
  "thinkdeep",
  "interaction",
];

/**
 * Evolution preset result — one full evolution-loop pass, rendered as the
 * loop's four stages: the fitness ledger that fired the trigger, the
 * direction document's movements (portrait + hypotheses), the before/after
 * card diff, and the playbook note. The footer repeats the demo contract:
 * nothing is persisted, refresh resets everything.
 */
export function EvolutionResultView({ result }: { result: EvolutionResult }) {
  const t = useTranslations("Playground.ui");

  // Group the ledger by bucket (fixed order) and net each group.
  const byBucket = new Map<FitnessBucket, FitnessLedgerEntry[]>();
  for (const entry of result.fitnessLedger) {
    const list = byBucket.get(entry.bucket) ?? [];
    list.push(entry);
    byBucket.set(entry.bucket, list);
  }
  const groups = BUCKETS.filter((b) => byBucket.has(b)).map((bucket) => {
    const entries = byBucket.get(bucket)!;
    return {
      bucket,
      entries,
      net: entries.reduce((sum, e) => sum + e.delta, 0),
    };
  });

  return (
    <div className="space-y-4">
      {/* ① Fitness ledger — the selection pressure that fired this run */}
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
          <Activity className="h-3 w-3 text-[var(--pg-evolve)]" />
          {t("fitnessLedger")}
        </p>
        <div className="space-y-1.5">
          {groups.map(({ bucket, entries, net }) => {
            const fired = net <= TRIGGER_NET;
            return (
              <div
                key={bucket}
                className={
                  fired
                    ? "rounded-md border border-[var(--pg-evolve-line)] bg-[var(--pg-evolve-soft)] px-2.5 py-2"
                    : "rounded-md border border-border/60 px-2.5 py-2"
                }
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-semibold ${
                      fired
                        ? "text-[var(--pg-evolve)]"
                        : "text-foreground/70"
                    }`}
                  >
                    {t(`buckets.${bucket}`)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {t("net")} {net > 0 ? `+${net}` : net}
                    </span>
                    {fired && (
                      <span className="rounded-full bg-[var(--pg-evolve)] px-1.5 py-px text-[10px] font-semibold text-white">
                        {t("triggered")}
                      </span>
                    )}
                  </span>
                </div>
                <ul className="space-y-1">
                  {entries.map((entry, i) => (
                    <li key={i} className="flex gap-2 text-[11px] leading-relaxed">
                      <span
                        className={`shrink-0 font-mono font-semibold ${
                          entry.delta < 0
                            ? "text-destructive"
                            : entry.delta > 0
                              ? "text-[var(--pg-evolve)]"
                              : "text-muted-foreground"
                        }`}
                      >
                        {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                      </span>
                      <span className="text-muted-foreground italic">
                        “{entry.evidence}”
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        {result.triggerReasons.length > 0 && (
          <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-muted-foreground">
            {result.triggerReasons.map((reason, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--pg-evolve)]">·</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ② Direction changes — portrait entries + hypothesis migrations */}
      <DirectionChangesView
        changes={result.directionChanges}
        verdict={result.directionVerdict}
      />

      {/* ③ Card before / after */}
      <div className="grid gap-2 md:grid-cols-2">
        <div className="rounded-md border border-border/60 bg-muted/40">
          <p className="border-b border-border/60 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
            {t("cardBefore")}
          </p>
          <pre className="max-h-72 overflow-auto px-2.5 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {result.cardBefore}
          </pre>
        </div>
        <div className="rounded-md border border-[var(--pg-brand-line)] bg-[var(--pg-brand-soft)]">
          <p className="border-b border-[var(--pg-brand-line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--pg-brand)]">
            {t("cardAfter")}
          </p>
          <pre className="max-h-72 overflow-auto px-2.5 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground/85">
            {result.cardAfter}
          </pre>
        </div>
      </div>

      {/* ④ Playbook note */}
      {result.playbookNote && (
        <div>
          <p className="mb-1 text-xs font-semibold text-foreground/80">
            {t("playbook")}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {result.playbookNote}
          </p>
        </div>
      )}

      {/* Demo contract */}
      <p className="border-t border-border/60 pt-2 text-xs leading-relaxed text-muted-foreground italic">
        {t("notPersisted")}
      </p>
    </div>
  );
}

function DirectionChangesView({
  changes,
  verdict,
}: {
  changes: DirectionChanges;
  verdict: string;
}) {
  const t = useTranslations("Playground.ui");
  const empty =
    changes.portraitAdded.length === 0 &&
    changes.portraitRetired.length === 0 &&
    changes.hypothesesPromoted.length === 0 &&
    changes.hypothesesProposed.length === 0 &&
    changes.hypothesesRetired.length === 0;

  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
        <Sparkles className="h-3 w-3 text-[var(--pg-evolve)]" />
        {t("directionChanges")}
      </p>
      {verdict && (
        <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
          {verdict}
        </p>
      )}
      {empty ? (
        <p className="text-xs text-muted-foreground italic">{t("noChange")}</p>
      ) : (
        <div className="space-y-2">
          <ChangeGroup label={t("portraitAdded")} items={changes.portraitAdded}>
            {(item, i) => (
              <li
                key={i}
                className="rounded-md border-l-2 border-[var(--pg-evolve)] bg-[var(--pg-evolve-soft)] px-2.5 py-1.5 text-[11px] leading-relaxed text-foreground/85"
              >
                {item}
              </li>
            )}
          </ChangeGroup>
          <ChangeGroup
            label={t("portraitRetired")}
            items={changes.portraitRetired}
          >
            {(item, i) => (
              <li
                key={i}
                className="px-2.5 py-1 text-[11px] leading-relaxed text-muted-foreground line-through"
              >
                {item}
              </li>
            )}
          </ChangeGroup>
          <ChangeGroup
            label={t("hypothesesPromoted")}
            items={changes.hypothesesPromoted}
          >
            {(item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 px-2.5 py-1 text-[11px] leading-relaxed text-foreground/85"
              >
                <span className="mt-0.5 shrink-0 rounded-full border border-[var(--pg-evolve-line)] bg-[var(--pg-evolve-soft)] px-1.5 py-px text-[10px] font-semibold text-[var(--pg-evolve)]">
                  {t("promoted")}
                </span>
                <span>{item}</span>
              </li>
            )}
          </ChangeGroup>
          <ChangeGroup
            label={t("hypothesesProposed")}
            items={changes.hypothesesProposed}
          >
            {(item, i) => (
              <li
                key={i}
                className="rounded-md border border-dashed border-[var(--pg-evolve-line)] px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-muted-foreground"
              >
                {item}
              </li>
            )}
          </ChangeGroup>
          <ChangeGroup
            label={t("hypothesesRetired")}
            items={changes.hypothesesRetired}
          >
            {(item, i) => (
              <li
                key={i}
                className="px-2.5 py-1 text-[11px] leading-relaxed text-muted-foreground/70 italic"
              >
                {item}
              </li>
            )}
          </ChangeGroup>
        </div>
      )}
    </div>
  );
}

function ChangeGroup({
  label,
  items,
  children,
}: {
  label: string;
  items: string[];
  children: (item: string, i: number) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-1">{items.map(children)}</ul>
    </div>
  );
}
