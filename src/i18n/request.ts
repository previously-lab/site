import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/** Map locale to message-loaders so Turbopack can statically analyse every import. */
async function loadMessages(locale: string) {
  switch (locale) {
    case "zh": {
      const [common, landing, docs, blog, theme, localeMsg, playground] =
        await Promise.all([
          import("../../messages/zh/common.json").then((m) => m.default),
          import("../../messages/zh/landing.json").then((m) => m.default),
          import("../../messages/zh/docs.json").then((m) => m.default),
          import("../../messages/zh/blog.json").then((m) => m.default),
          import("../../messages/zh/theme.json").then((m) => m.default),
          import("../../messages/zh/locale.json").then((m) => m.default),
          import("../../messages/zh/playground.json").then((m) => m.default),
        ]);
      return { ...common, ...landing, ...docs, ...blog, ...playground, theme, locale: localeMsg };
    }
    default: {
      const [common, landing, docs, blog, theme, localeMsg, playground] =
        await Promise.all([
          import("../../messages/en/common.json").then((m) => m.default),
          import("../../messages/en/landing.json").then((m) => m.default),
          import("../../messages/en/docs.json").then((m) => m.default),
          import("../../messages/en/blog.json").then((m) => m.default),
          import("../../messages/en/theme.json").then((m) => m.default),
          import("../../messages/en/locale.json").then((m) => m.default),
          import("../../messages/en/playground.json").then((m) => m.default),
        ]);
      return { ...common, ...landing, ...docs, ...blog, ...playground, theme, locale: localeMsg };
    }
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await loadMessages(locale)) as Record<string, unknown>,
  };
});
