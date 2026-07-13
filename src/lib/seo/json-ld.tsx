import type { ReactElement } from "react";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Render a <script type="application/ld+json"> element with the given
 * JSON-LD object. The object is serialised once at render time.
 */
function JsonLd<T extends Record<string, unknown>>(data: T): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Props types
// ---------------------------------------------------------------------------

export type OrganizationJsonLdProps = {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
};

export type WebSiteJsonLdProps = {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
};

export type SoftwareSourceCodeJsonLdProps = {
  name: string;
  url: string;
  description?: string;
  image?: string;
  author?: {
    name: string;
    url?: string;
  };
  codeRepository?: string;
  programmingLanguage?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: number;
    priceCurrency: string;
  };
};

export type TechArticleJsonLdProps = {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
};

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqJsonLdProps = {
  items: FaqItem[];
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/**
 * Schema.org Organization — describes the brand/company behind the project.
 */
export function OrganizationJsonLd({
  name,
  url,
  logo,
  description,
  sameAs,
}: OrganizationJsonLdProps): ReactElement {
  return JsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo ? { logo } : {}),
    ...(description ? { description } : {}),
    ...(sameAs ? { sameAs } : {}),
  });
}

/**
 * Schema.org WebSite — describes the site itself.
 * Optionally includes a SearchAction for site search.
 */
export function WebSiteJsonLd({
  name,
  url,
  description,
  potentialAction,
}: WebSiteJsonLdProps): ReactElement {
  return JsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    ...(description ? { description } : {}),
    ...(potentialAction
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: potentialAction.target,
            },
            "query-input": potentialAction.queryInput,
          },
        }
      : {}),
  });
}

/**
 * Schema.org SoftwareSourceCode — describes the open-source repository.
 */
export function SoftwareSourceCodeJsonLd({
  name,
  url,
  description,
  image,
  author,
  codeRepository,
  programmingLanguage,
  applicationCategory,
  operatingSystem,
  offers,
}: SoftwareSourceCodeJsonLdProps): ReactElement {
  return JsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name,
    url,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(author ? { author: { "@type": "Person", ...author } } : {}),
    ...(codeRepository ? { codeRepository } : {}),
    ...(programmingLanguage ? { programmingLanguage } : {}),
    ...(applicationCategory ? { applicationCategory } : {}),
    ...(operatingSystem ? { operatingSystem } : {}),
    ...(offers
      ? { offers: { "@type": "Offer", ...offers } }
      : {}),
  });
}

/**
 * Schema.org TechArticle — describes a technical documentation article.
 * Suitable for use on doc pages.
 */
export function TechArticleJsonLd({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
  publisherName,
  publisherLogo,
}: TechArticleJsonLdProps): ReactElement {
  return JsonLd({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url,
    ...(image ? { image } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(authorName
      ? { author: { "@type": "Person", name: authorName } }
      : {}),
    ...(publisherName || publisherLogo
      ? {
          publisher: {
            "@type": "Organization",
            ...(publisherName ? { name: publisherName } : {}),
            ...(publisherLogo
              ? { logo: { "@type": "ImageObject", url: publisherLogo } }
              : {}),
          },
        }
      : {}),
  });
}

/**
 * Schema.org BreadcrumbList — describes breadcrumb navigation for the page.
 */
export function BreadcrumbJsonLd({
  items,
}: BreadcrumbJsonLdProps): ReactElement {
  return JsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

/**
 * Schema.org FAQPage — describes a list of questions and answers.
 * Suitable for use on the FAQ doc page.
 */
export function FaqJsonLd({ items }: FaqJsonLdProps): ReactElement {
  return JsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  });
}
