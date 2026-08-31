import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { getMessageList } from "@/lib/messages";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return {
    title: t("Meta.title"),
    description: t("Meta.description"),
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        "x-default": "/en/about",
        en: "/en/about",
        zh: "/zh/about",
      },
    },
    openGraph: {
      title: t("Meta.title"),
      description: t("Meta.description"),
      url: `/${locale}/about`,
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
 * /about — trust anchor page. Tells agents (and people) who is behind the
 * project and where to verify it.
 */
export default async function AboutPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });
  const paragraphs = await getMessageList<string>("About.paragraphs");

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <h2 className="mt-12 text-lg font-semibold text-foreground">
        {t("linksHeading")}
      </h2>
      <ul className="mt-4 space-y-2 text-base">
        <li>
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
          >
            GitHub — {siteConfig.productName}
          </a>
        </li>
        <li>
          <a
            href={siteConfig.devtoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
          >
            dev.to — Is time the missing dimension in AI memory?
          </a>
        </li>
      </ul>
    </article>
  );
}
