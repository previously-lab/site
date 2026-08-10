import { type NextRequest } from "next/server";
import { siteConfig } from "@/lib/site";
import { docsManifest } from "@/lib/docs/manifest";
import { getDoc } from "@/lib/docs/content";

/**
 * Route handler serving llms.txt — a plain-text file per the llmstxt.org
 * convention designed for LLM / AI answer-engine consumption.
 *
 * The document lists all documentation pages with their descriptions so that
 * generative AI systems can discover and cite the correct pages.
 */
export async function GET(_request: NextRequest): Promise<Response> {
  const baseUrl = siteConfig.url;
  const sections: string[] = [];

  // ---- Title ----
  sections.push(`# ${siteConfig.orgName}`);
  sections.push("");

  // ---- Blockquote summary ----
  sections.push(`> ${siteConfig.description}`);
  sections.push("");

  // ---- Intro ----
  sections.push(
    `${siteConfig.productName} is an open-source personal AI agent that organizes memory by time — a single timeline of episodic slices, not chat threads. It is built by ${siteConfig.orgName}. This documentation covers concepts, guides, and reference material.`,
  );
  sections.push("");

  // ---- Docs ----
  sections.push("## Docs");
  sections.push("");

  for (const section of docsManifest) {
    for (const item of section.items) {
      try {
        const { frontmatter } = await getDoc("en", item.slug);
        sections.push(
          `- [${frontmatter.title}](${baseUrl}/en/docs/${item.slug}): ${frontmatter.description}`,
        );
      } catch {
        // If the doc file is missing, fall back to the manifest title
        sections.push(
          `- [${item.title}](${baseUrl}/en/docs/${item.slug}): ${siteConfig.description}`,
        );
      }
    }
  }

  sections.push("");

  // ---- Links ----
  sections.push("## Links");
  sections.push("");
  sections.push(`- GitHub: ${siteConfig.githubUrl}`);
  sections.push(`- Live Demo: ${siteConfig.demoUrl}`);
  sections.push(`- Dev.to Article: ${siteConfig.devtoUrl}`);
  sections.push("");

  return new Response(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
