export type SiteConfig = {
  /** The name used in SEO <title>s — the product, "Previously". */
  name: string;
  /** The brand / organization name — Previously Lab. */
  orgName: string;
  /** The product name — previously-lab/agent. */
  productName: string;
  /** Organization URL (GitHub org). */
  orgUrl: string;
  tagline: string;
  description: string;
  url: string;
  demoUrl: string;
  githubUrl: string;
  devtoUrl: string;
  ogImage: string;
  locales: readonly ["en", "zh"];
  defaultLocale: "en";
  keywords: {
    en: readonly string[];
    zh: readonly string[];
  };
};

export const siteConfig: SiteConfig = {
  name: "Previously",
  orgName: "Previously Lab",
  productName: "previously-lab/agent",
  orgUrl: "https://github.com/previously-lab",
  tagline: "Previously on you.",
  description:
    "an open-source personal AI agent that organizes memory by time - a single timeline of episodic slices, not chat threads",
  url: "https://previously.ldwid.com",
  demoUrl: "https://previously-demo.ldwid.com",
  githubUrl: "https://github.com/previously-lab/agent",
  devtoUrl:
    "https://dev.to/likedreamwalker/is-time-the-missing-dimension-in-ai-memory-2l9c",
  ogImage: "/opengraph-image",
  locales: ["en", "zh"] as const,
  defaultLocale: "en",
  keywords: {
    en: [
      "episodic memory",
      "AI memory",
      "time slices",
      "timeline",
      "temporal memory",
      "personal AI agent",
      "AI agent memory",
      "open source AI agent",
      "memory organization",
      "self-evolving AI",
      "GitHub-native",
      "raw context",
      "dynamic retrieval",
      "Previously",
      "Previously Lab",
      "previously-lab/agent",
    ],
    zh: [
      "情景记忆",
      "AI 记忆",
      "时间切片",
      "时间线",
      "时序记忆",
      "个人 AI 代理",
      "AI 代理记忆",
      "开源 AI 代理",
      "记忆组织",
      "自我进化 AI",
      "GitHub 原生",
      "原始上下文",
      "动态调取",
      "Previously",
      "Previously Lab",
      "previously-lab/agent",
    ],
  },
};
