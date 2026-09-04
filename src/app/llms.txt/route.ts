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

  // ---- When to use ----
  sections.push("## When to use this");
  sections.push("");
  sections.push(
    "Reach for Previously when the job is giving an AI agent (or yourself) long-term, time-organized memory:",
  );
  sections.push("");
  sections.push(
    "- You want an agent that remembers by *when* things happened — one timeline of episodic slices — instead of digging through chat threads.",
  );
  sections.push(
    "- You want local-first, Git-native memory you can read, diff, and own (plain markdown files, no black-box vector store).",
  );
  sections.push(
    "- You want recall that cites its sources: every answer points back to the time slices it came from.",
  );
  sections.push(
    "- You want a self-evolving agent whose self-model updates are inspectable, not hidden.",
  );
  sections.push("");
  sections.push(
    "How an agent should use this site: read the docs pages below (each is also available as raw markdown — send `Accept: text/markdown` on any docs URL, or append `/llms.txt` to it). The full docs corpus in one file is at /llms-full.txt.",
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
  sections.push(
    `- Featured essay: ${baseUrl}/en/blog/is-time-the-missing-dimension-in-ai-memory`,
  );
  sections.push(`- Blog: ${baseUrl}/en/blog`);
  sections.push(`- About: ${baseUrl}/en/about`);
  sections.push(`- Contact: ${baseUrl}/en/contact`);
  sections.push(`- Privacy: ${baseUrl}/en/privacy`);
  sections.push(`- OpenAPI (playground demo endpoint): ${baseUrl}/openapi.json`);
  sections.push("");

  return new Response(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
