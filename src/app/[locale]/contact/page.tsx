import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { getMessageList } from "@/lib/messages";

type Props = {
  params: Promise<{ locale: string }>;
};

type Channel = {
  label: string;
  description: string;
  url: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });

  return {
    title: t("Meta.title"),
    description: t("Meta.description"),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        "x-default": "/en/contact",
        en: "/en/contact",
        zh: "/zh/contact",
      },
    },
    openGraph: {
      title: t("Meta.title"),
      description: t("Meta.description"),
      url: `/${locale}/contact`,
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
 * /contact — trust anchor page. The project is open-source, so the contact
 * channels are the public GitHub/dev.to threads rather than a mailbox.
 */
export default async function ContactPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Contact" });
  const channels = await getMessageList<Channel>("Contact.channels");

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-8 text-base leading-relaxed text-muted-foreground">
        {t("intro")}
      </p>
      <ul className="mt-8 space-y-6">
        {channels.map((channel) => (
          <li key={channel.label}>
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              {channel.label}
            </a>
            {channel.description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {channel.description}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
        {t("outro")}
      </p>
    </article>
  );
}
