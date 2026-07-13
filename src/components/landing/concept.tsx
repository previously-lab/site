import { getTranslations } from "next-intl/server";

export async function Concept({
  locale,
}: {
  locale: string;
}): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <div className="space-y-6">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {t("Concept.title")}
            </h2>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("Concept.description")}
            </p>

            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-border bg-background/50 p-4">
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  {"Slices — "}
                  <span className="text-muted-foreground">
                    {t("Concept.slices")}
                  </span>
                </h3>
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-4">
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  {"Strands — "}
                  <span className="text-muted-foreground">
                    {t("Concept.strands")}
                  </span>
                </h3>
              </div>
            </div>
          </div>

          {/* Visual: scattered threads vs single timeline */}
          <div
            className="flex flex-col items-center gap-4"
            role="img"
            aria-label="Diagram comparing scattered chat threads (left) to a single organized timeline (right)"
          >
            <svg
              viewBox="0 0 500 160"
              className="w-full max-w-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* LEFT: Scattered thread clusters */}
              <g className="text-muted-foreground/30">
                {/* Cluster A */}
                <circle cx="35" cy="30" r="6" fill="currentColor" />
                <circle cx="60" cy="22" r="4" fill="currentColor" />
                <circle cx="50" cy="50" r="5" fill="currentColor" />
                <path
                  d="M35 30 Q48 25 60 22"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M35 30 Q42 42 50 50"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Cluster B */}
                <circle cx="20" cy="80" r="5" fill="currentColor" />
                <circle cx="48" cy="85" r="6" fill="currentColor" />
                <circle cx="70" cy="75" r="4" fill="currentColor" />
                <path
                  d="M20 80 Q34 82 48 85"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M48 85 Q60 80 70 75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Cluster C */}
                <circle cx="40" cy="130" r="6" fill="currentColor" />
                <circle cx="68" cy="125" r="4" fill="currentColor" />
                <circle cx="65" cy="145" r="5" fill="currentColor" />
                <path
                  d="M40 130 Q55 127 68 125"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M40 130 Q52 138 65 145"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </g>

              {/* Divider */}
              <line
                x1="90"
                y1="15"
                x2="90"
                y2="145"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-border"
              />

              {/* RIGHT: Single timeline */}
              <g className="text-foreground">
                {/* Timeline axis */}
                <line
                  x1="115"
                  y1="80"
                  x2="490"
                  y2="80"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                />
                {/* Timeline dots */}
                <circle
                  cx="140"
                  cy="80"
                  r="5"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx="198"
                  cy="80"
                  r="5"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx="256"
                  cy="80"
                  r="5"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx="314"
                  cy="80"
                  r="5"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx="372"
                  cy="80"
                  r="5"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx="430"
                  cy="80"
                  r="5"
                  fill="currentColor"
                  className="text-primary"
                />
                {/* Activity blocks above dots */}
                <rect
                  x="158"
                  y="48"
                  width="24"
                  height="16"
                  rx="3"
                  className="fill-primary/20"
                />
                <rect
                  x="218"
                  y="55"
                  width="18"
                  height="16"
                  rx="3"
                  className="fill-primary/15"
                />
                <rect
                  x="278"
                  y="44"
                  width="30"
                  height="16"
                  rx="3"
                  className="fill-primary/25"
                />
                <rect
                  x="335"
                  y="52"
                  width="20"
                  height="16"
                  rx="3"
                  className="fill-primary/20"
                />
                <rect
                  x="395"
                  y="46"
                  width="26"
                  height="16"
                  rx="3"
                  className="fill-primary/15"
                />
                {/* Connectors */}
                <line
                  x1="170"
                  y1="64"
                  x2="170"
                  y2="80"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary/30"
                />
                <line
                  x1="227"
                  y1="71"
                  x2="227"
                  y2="80"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary/30"
                />
                <line
                  x1="293"
                  y1="60"
                  x2="293"
                  y2="80"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary/30"
                />
                <line
                  x1="345"
                  y1="68"
                  x2="345"
                  y2="80"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary/30"
                />
                <line
                  x1="408"
                  y1="62"
                  x2="408"
                  y2="80"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary/30"
                />
              </g>
            </svg>

            {/* Labels row */}
            <div className="flex w-full max-w-md items-center justify-between px-2 text-xs text-muted-foreground">
              <span className="text-center">{t("Concept.labelThreads")}</span>
              <span className="text-center font-medium text-foreground">
                {t("Concept.labelTimeline")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
