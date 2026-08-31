import { siteConfig } from "@/lib/site";
import { PRESET_IDS } from "@/lib/playground/presets";

/**
 * GET /openapi.json — OpenAPI 3.1 description of the site's one HTTP API:
 * the playground demo endpoint (POST /api/playground).
 *
 * The playground is a preset-whitelisted demo (no free-form prompts), so the
 * spec is small by design. Published so agents can discover the API surface
 * automatically; linked from /llms.txt.
 */

const errorSchema = {
  type: "object",
  required: ["error", "code"],
  properties: {
    error: { type: "string", description: "Human-readable, localized message." },
    code: {
      type: "string",
      enum: ["bad_request", "rate_limited", "unavailable", "upstream"],
      description: "Machine-readable error code.",
    },
  },
} as const;

function errorResponse(description: string) {
  return {
    description,
    content: { "application/json": { schema: errorSchema } },
  };
}

export function GET(): Response {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${siteConfig.name} Playground API`,
      version: "1.0.0",
      description:
        "Demo endpoint for the Previously playground. Runs one of a fixed set of preset demonstrations against a vendored memory snapshot. Free-form prompts are not accepted. Rate limit: 20 requests/hour per IP.",
    },
    servers: [{ url: siteConfig.url }],
    paths: {
      "/api/playground": {
        post: {
          operationId: "runPlaygroundPreset",
          summary: "Run a playground preset",
          description:
            "Executes one preset demonstration. Presets of kind 'recall' respond with a Server-Sent Events stream (text/event-stream); all other kinds return a single JSON object.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["presetId", "locale"],
                  properties: {
                    presetId: {
                      type: "string",
                      enum: [...PRESET_IDS],
                      description: "Which preset demonstration to run.",
                    },
                    locale: {
                      type: "string",
                      enum: ["en", "zh"],
                      description: "Language of the generated answer.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Preset result. JSON object { presetId, kind, result, cached: false } for one-shot presets; an SSE stream of progress/line/delta/report/error events for recall presets.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["presetId", "kind", "result", "cached"],
                    properties: {
                      presetId: { type: "string", enum: [...PRESET_IDS] },
                      kind: {
                        type: "string",
                        enum: ["recall", "evolution", "anatomy"],
                      },
                      result: { type: "object" },
                      cached: { type: "boolean", enum: [false] },
                    },
                  },
                },
                "text/event-stream": {
                  schema: {
                    type: "string",
                    description:
                      "SSE events: {type:'progress'|'line'|'delta'|'report'|'error', ...}. The 'report' event carries the final result object.",
                  },
                },
              },
            },
            "400": errorResponse(
              "Body failed validation — unknown presetId or locale.",
            ),
            "429": errorResponse(
              "Rate limit exceeded (20 requests/hour per IP). See the Retry-After header.",
            ),
            "502": errorResponse("Upstream model failure — retry."),
            "503": errorResponse(
              "Playground not configured on this deployment (missing API key).",
            ),
          },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
