import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * All AI answer-engine / crawler user agents that are explicitly allowed.
 * Covers the major providers as of July 2026.
 */
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "Bytespider",
  "cohere-ai",
] as const;

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    // General crawlers — allow everything
    {
      userAgent: "*",
      allow: "/",
    },
  ];

  // Explicitly welcome each AI answer-engine crawler
  for (const agent of aiCrawlers) {
    rules.push({
      userAgent: agent,
      allow: "/",
    });
  }

  return {
    rules,
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
