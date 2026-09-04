/**
 * POST /api/playground — the playground's single endpoint.
 *
 * Constraints (per notes/playground-design.md):
 * - Preset whitelist only: no free-form prompts ever reach the model.
 * - NO response cache: every click is a real request. Cost control is the
 *   preset whitelist + IP rate limit + the provider's prompt cache.
 * - IP rate limit: 20 requests/hour sliding window (in-memory; per-instance
 *   under serverless — a known, accepted limitation for a demo endpoint).
 * - Demo mode: evolution runs compute what WOULD change; nothing is persisted.
 *
 * Streaming: recall presets run the ported episodic-recall colleague (a real
 * streamText tool loop, src/lib/playground/agent/) and stream SSE events:
 *   {"type":"progress","line":…}              — each exploration tool start
 *   {"type":"line","line":…,"stage":…}        — the live subtitle: current
 *                                               thinking/writing line
 *   {"type":"delta","text":…}                 — answer deltas (streamed out of
 *                                               the report tool's input)
 *   {"type":"report","result":…}              — the final, schema-validated RecallResult
 *   {"type":"error","message":…}              — failures (localized)
 * evolution / anatomy presets keep the one-shot JSON response.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import matter from "gray-matter";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { getPreset, isPresetId, type PlaygroundPreset } from "@/lib/playground/presets";
import { playgroundRateLimiter } from "@/lib/playground/rate-limit";
import { buildPrompt } from "@/lib/playground/prompts";
import { getSnapshot, type PlaygroundSnapshot } from "@/lib/playground/snapshot";
import {
  anatomyModelSchema,
  evolutionModelSchema,
  recallResultSchema,
  type PlaygroundError,
  type PlaygroundResult,
} from "@/lib/playground/contracts";
import { runPlaygroundRecall } from "@/lib/playground/agent/recall";

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

function errorText(
  code: PlaygroundError["code"],
  locale: string,
): string {
  return ERROR_TEXT[locale === "zh" ? "zh" : "en"][
    code === "bad_request"
      ? "badRequest"
      : code === "rate_limited"
        ? "rateLimited"
        : code === "unavailable"
          ? "unavailable"
          : "upstream"
  ];
}

function errorResponse(
  status: number,
  code: PlaygroundError["code"],
  locale: string,
): NextResponse<PlaygroundError> {
  return NextResponse.json(
    { error: errorText(code, locale), code },
    { status },
  );
}

/* ------------------------------------------------------------------ */
/*  DeepSeek — one-shot path (evolution / anatomy presets)             */
/* ------------------------------------------------------------------ */

async function callDeepSeek(
  system: string,
  user: string,
  maxTokens = 1500,
): Promise<unknown> {
  // The caller 503s when DEEPSEEK_API_KEY is unset, so it's always set here.
  const apiKey = process.env.DEEPSEEK_API_KEY!;

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
      max_tokens: maxTokens,
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
  snapshot: PlaygroundSnapshot,
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
      // cardBefore comes from the dataset's current card, not the model — the
      // diff is honest by construction.
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
/*  Recall — the real streaming tool loop, over SSE                    */
/* ------------------------------------------------------------------ */

function recallStreamResponse(
  preset: PlaygroundPreset,
  snapshot: PlaygroundSnapshot,
  locale: "en" | "zh",
): Response {
  const provider = createOpenAICompatible({
    name: "deepseek",
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY!,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        } catch {
          // Client disconnected mid-run — nothing left to do.
        }
      };

      try {
        const res = await runPlaygroundRecall({
          question: preset.questionEn,
          snapshot,
          locale,
          model: provider.chatModel("deepseek-chat"),
          onProgressLine: (line) => send({ type: "progress", line }),
          onLine: (line, stage) => send({ type: "line", line, stage }),
          onAnswerDelta: (delta) => send({ type: "delta", text: delta }),
        });

        if (!res.ok) {
          console.error("[playground] recall failed", res.error);
          send({ type: "error", message: errorText("upstream", locale) });
          return;
        }
        // Envelope-level validation — the report already passed the agent's
        // own schema; this keeps the SSE contract exactly the RecallResult
        // the client renders.
        const parsed = recallResultSchema.safeParse(res.result);
        if (!parsed.success) {
          console.error("[playground] recall report failed contract validation");
          send({ type: "error", message: errorText("upstream", locale) });
          return;
        }
        send({ type: "report", result: parsed.data });
      } catch (err) {
        console.error("[playground] recall stream failure", err);
        send({ type: "error", message: errorText("upstream", locale) });
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}

/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest): Promise<Response> {
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

  if (!process.env.DEEPSEEK_API_KEY) {
    return errorResponse(503, "unavailable", body.locale);
  }

  const snapshot = await getSnapshot();
  const preset = getPreset(body.presetId)!;

  // Recall presets run the ported recall colleague — a real streaming tool
  // loop — and answer with SSE events instead of a one-shot JSON body.
  if (preset.kind === "recall") {
    return recallStreamResponse(preset, snapshot, body.locale);
  }

  const { system, user } = buildPrompt(preset, snapshot, body.locale);

  let result: PlaygroundResult | null;
  try {
    // The evolution loop returns a full rewritten card plus the ledger and
    // direction movements — it needs more headroom than anatomy.
    const raw = await callDeepSeek(
      system,
      user,
      preset.kind === "evolution" ? 4096 : 1500,
    );
    if (raw === null) return errorResponse(503, "unavailable", body.locale);
    result = buildResult(body.presetId, raw, snapshot);
  } catch (err) {
    console.error("[playground] upstream failure", err);
    return errorResponse(502, "upstream", body.locale);
  }

  if (!result) {
    console.error("[playground] model output failed schema validation");
    return errorResponse(502, "upstream", body.locale);
  }

  return NextResponse.json({
    presetId: body.presetId,
    kind: preset.kind,
    result,
    cached: false,
  });
}
