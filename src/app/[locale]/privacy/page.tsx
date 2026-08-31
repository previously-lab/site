import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { getMessageList } from "@/lib/messages";

type Props = {
  params: Promise<{ locale: string }>;
};

type PolicySection = {
  heading: string;
  body: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return {
    title: t("Meta.title"),
    description: t("Meta.description"),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: {
        "x-default": "/en/privacy",
        en: "/en/privacy",
        zh: "/zh/privacy",
      },
    },
    openGraph: {
      title: t("Meta.title"),
      description: t("Meta.description"),
      url: `/${locale}/privacy`,
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
  };
}

/**
 * /privacy — trust anchor page. Plain-language policy: no analytics on the
 * site, in-memory-only rate limiting in the playground, local-first agent.
 */
export default async function PrivacyPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Privacy" });
  const sections = await getMessageList<PolicySection>("Privacy.sections");

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">{t("updated")}</p>
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-foreground">
              {section.heading}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
