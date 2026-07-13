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
};
