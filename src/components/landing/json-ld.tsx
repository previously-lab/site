import { siteConfig } from "@/lib/site";

/**
 * Inline JSON-LD structured data for the landing page.
 *
 * Provides schema.org markup for:
 * - SoftwareSourceCode / SoftwareApplication (the OSS project)
 * - Organization (the publisher)
 * - WebSite (the site itself)
 */
export function JsonLd({ locale }: { locale: string }): React.ReactElement {
  const keywords = [
    ...siteConfig.keywords[locale === "zh" ? "zh" : "en"],
  ].join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SoftwareSourceCode", "SoftwareApplication"],
        name: siteConfig.productName,
        description: siteConfig.description,
        url: siteConfig.url,
        codeRepository: siteConfig.githubUrl,
        applicationCategory: "AIApplication",
        operatingSystem: "Linux, macOS, Windows",
        license: "https://opensource.org/licenses/MIT",
        programmingLanguage: ["TypeScript", "JavaScript"],
        keywords,
      },
      {
        "@type": "Organization",
        name: siteConfig.orgName,
        url: siteConfig.orgUrl,
      },
      {
        "@type": "WebSite",
        name: siteConfig.orgName,
        url: siteConfig.url,
        description: siteConfig.description,
        keywords,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
