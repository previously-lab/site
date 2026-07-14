import { getTranslations } from "next-intl/server";

export async function ConceptTitle({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });
  return (
    <h2 className="text-balance text-center text-2xl font-semibold tracking-tight sm:text-3xl">
      {t("Concept.title")}
    </h2>
  );
}

export async function ConceptDescription({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });
  return (
    <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
      {t("Concept.description")}
    </p>
  );
}

export async function ConceptContent({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Text side — slices & strands cards */}
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/30 p-4 text-center">
          <h3 className="mb-1 text-sm font-semibold text-foreground">
            Slices —{" "}
            <span className="text-muted-foreground">{t("Concept.slices")}</span>
          </h3>
        </div>
        <div className="rounded-lg bg-muted/30 p-4 text-center">
          <h3 className="mb-1 text-sm font-semibold text-foreground">
            Strands —{" "}
            <span className="text-muted-foreground">{t("Concept.strands")}</span>
          </h3>
        </div>
      </div>

      {/* Visual side — scattered threads vs single timeline */}
      <div className="flex flex-col items-center gap-4" role="img" aria-label={t("Concept.labelTimeline")}>
        <svg viewBox="0 0 500 160" className="w-full max-w-md" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g className="text-muted-foreground/30">
            <circle cx="35" cy="30" r="6" fill="currentColor" />
            <circle cx="60" cy="22" r="4" fill="currentColor" />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
            <path d="M35 30 Q48 25 60 22" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M35 30 Q42 42 50 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="20" cy="80" r="5" fill="currentColor" />
            <circle cx="48" cy="85" r="6" fill="currentColor" />
            <circle cx="70" cy="75" r="4" fill="currentColor" />
            <path d="M20 80 Q34 82 48 85" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M48 85 Q60 80 70 75" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="40" cy="130" r="6" fill="currentColor" />
            <circle cx="68" cy="125" r="4" fill="currentColor" />
            <circle cx="65" cy="145" r="5" fill="currentColor" />
            <path d="M40 130 Q55 127 68 125" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M40 130 Q52 138 65 145" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </g>
          <line x1="90" y1="15" x2="90" y2="145" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-border" />
          <g className="text-foreground">
            <line x1="115" y1="80" x2="490" y2="80" stroke="currentColor" strokeWidth="2" className="text-primary" />
            {[140, 198, 256, 314, 372, 430].map((cx) => (
              <circle key={cx} cx={cx} cy="80" r="5" fill="currentColor" className="text-primary" />
            ))}
            <rect x="158" y="48" width="24" height="16" rx="3" className="fill-primary/20" />
            <rect x="218" y="55" width="18" height="16" rx="3" className="fill-primary/15" />
            <rect x="278" y="44" width="30" height="16" rx="3" className="fill-primary/25" />
            <rect x="335" y="52" width="20" height="16" rx="3" className="fill-primary/20" />
            <rect x="395" y="46" width="26" height="16" rx="3" className="fill-primary/15" />
            {[170, 227, 293, 345, 408].map((x, i) => (
              <line key={i} x1={x} y1={[64, 71, 60, 68, 62][i]} x2={x} y2="80" stroke="currentColor" strokeWidth="1" className="text-primary/30" />
            ))}
          </g>
        </svg>
        <div className="flex w-full max-w-md items-center justify-between px-2 text-xs text-muted-foreground">
          <span>{t("Concept.labelThreads")}</span>
          <span className="font-medium text-foreground">{t("Concept.labelTimeline")}</span>
        </div>
      </div>
    </div>
  );
}
