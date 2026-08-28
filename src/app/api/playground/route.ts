/**
 * POST /api/playground — the playground's single endpoint.
 *
 * Constraints (per notes/playground-design.md):
 * - Preset whitelist only: no free-form prompts ever reach the model.
 * - Response cache: identical (presetId, locale) requests are served from a
 *   module-level Map — the cache hit rate IS the cost-control design.
 * - IP rate limit: 20 requests/hour sliding window (in-memory; per-instance
 *   under serverless — a known, accepted limitation for a demo endpoint).
 * - Demo mode: evolution runs compute what WOULD change; nothing is persisted.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import matter from "gray-matter";

import { getPreset, isPresetId } from "@/lib/playground/presets";
import { playgroundRateLimiter } from "@/lib/playground/rate-limit";
import { buildPrompt } from "@/lib/playground/prompts";
import { snapshot } from "@/lib/playground/snapshot";
import {
  anatomyModelSchema,
  evolutionModelSchema,
  recallResultSchema,
  type PlaygroundError,
  type PlaygroundResult,
  type PlaygroundSuccess,
} from "@/lib/playground/contracts";

const bodySchema = z.object({
  presetId: z.string().refine(isPresetId, "unknown presetId"),
  locale: z.enum(["en", "zh"]),
});

/** Localized friendly errors — the UI shows these verbatim. */
const ERROR_TEXT = {
  en: {
    badRequest: "That request doesn't match a playground preset.",
    rateLimited:
      "Easy there — the playground allows 20 requests per hour. Try again later.",
    unavailable:
      "The playground isn't configured yet (missing API key). Please try again later.",
    upstream: "The model didn't come back with a usable answer. Try again.",
  },
  zh: {
    badRequest: "请求不符合 playground 的预设格式。",
    rateLimited: "别急——playground 每小时限 20 次请求，请稍后再试。",
    unavailable: "Playground 尚未配置（缺少 API key），请稍后再试。",
    upstream: "模型没有返回可用的结果，请重试。",
  },
} as const;

function errorResponse(
  status: number,
  code: PlaygroundError["code"],
  locale: string,
): NextResponse<PlaygroundError> {
  const text =
    ERROR_TEXT[locale === "zh" ? "zh" : "en"][
      code === "bad_request"
        ? "badRequest"
        : code === "rate_limited"
          ? "rateLimited"
          : code === "unavailable"
            ? "unavailable"
            : "upstream"
    ];
  return NextResponse.json({ error: text, code }, { status });
}

/* ------------------------------------------------------------------ */
/*  Module-level cache — (presetId, locale) → result. The presets make */
/*  every user issue the identical request, so hit rate is the goal.   */
/* ------------------------------------------------------------------ */
const responseCache = new Map<string, PlaygroundResult>();

/* ------------------------------------------------------------------ */
/*  DeepSeek                                                           */
/* ------------------------------------------------------------------ */

async function callDeepSeek(system: string, user: string): Promise<unknown> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null; // caller maps to 503

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    throw new Error(`DeepSeek ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty content");
  return JSON.parse(content);
}

/** Validate the model output for the preset's kind and finish the result. */
function buildResult(
  presetId: string,
  raw: unknown,
): PlaygroundResult | null {
  const preset = getPreset(presetId);
  if (!preset) return null;

  switch (preset.kind) {
    case "recall": {
      const parsed = recallResultSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    case "evolution": {
      const parsed = evolutionModelSchema.safeParse(raw);
      if (!parsed.success) return null;
      // cardBefore comes from the vendored card, not the model — the diff is
      // honest by construction.
      return { ...parsed.data, cardBefore: snapshot.currentCard };
    }
    case "anatomy": {
      const parsed = anatomyModelSchema.safeParse(raw);
      if (!parsed.success) return null;
      const core = snapshot.slices[preset.slices[0]]?.core ?? "";
      const frontmatter = matter(core).data;
      return { ...parsed.data, frontmatter };
    }
  }
}

/* ------------------------------------------------------------------ */

export async function POST(
  req: NextRequest,
): Promise<NextResponse<PlaygroundSuccess | PlaygroundError>> {
  // Parse + validate the body first so errors can be localized.
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return errorResponse(400, "bad_request", "en");
  }

  // IP sliding-window rate limit (per-instance under serverless — see header).
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rate = playgroundRateLimiter.check(ip);
  if (!rate.allowed) {
    const res = errorResponse(429, "rate_limited", body.locale);
    res.headers.set(
      "Retry-After",
      String(Math.ceil(rate.retryAfterMs / 1000)),
    );
    return res;
  }

  const cacheKey = `${body.presetId}:${body.locale}`;
  const cached = responseCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({
      presetId: body.presetId,
      kind: getPreset(body.presetId)!.kind,
      result: cached,
      cached: true,
    });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return errorResponse(503, "unavailable", body.locale);
  }

  const preset = getPreset(body.presetId)!;
  const { system, user } = buildPrompt(preset, snapshot, body.locale);

  let result: PlaygroundResult | null;
  try {
    const raw = await callDeepSeek(system, user);
    if (raw === null) return errorResponse(503, "unavailable", body.locale);
    result = buildResult(body.presetId, raw);
  } catch (err) {
    console.error("[playground] upstream failure", err);
    return errorResponse(502, "upstream", body.locale);
  }

  if (!result) {
    console.error("[playground] model output failed schema validation");
    return errorResponse(502, "upstream", body.locale);
  }

  responseCache.set(cacheKey, result);
  return NextResponse.json({
    presetId: body.presetId,
    kind: preset.kind,
    result,
    cached: false,
  });
}
