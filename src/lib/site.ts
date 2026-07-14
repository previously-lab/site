export type SiteConfig = {
  name: string;
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
  tagline: "Previously on you.",
  description:
    "an open-source personal AI agent that organizes memory by time - a single timeline of episodic slices, not chat threads",
  url: "https://previously.ldwid.com",
  demoUrl: "https://previously-demo.ldwid.com",
  githubUrl: "https://github.com/LikeDreamwalker/previously",
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
      "Previously",
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
      "Previously",
    ],
  },
};
