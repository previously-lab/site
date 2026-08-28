/**
 * Ported from previously-lab/agent src/lib/agents/sub-agent-runner.ts @ 0601d19
 * (simplified port).
 *
 * One `runAgent` call = one bounded model invocation on `streamText`:
 *   - steps:    `stopWhen: isStepCount(maxSteps)` + a `prepareStep` passthrough
 *               (recall forces its report tool on the final step).
 *   - timeout:  `AbortSignal.timeout(timeoutMs)` aborts the stream cleanly;
 *               timeouts return the accumulated partial (`timedOut: true`)
 *               instead of throwing.
 *   - output:   the report-tool pattern — the model reports through a
 *               designated tool whose input is zod-validated into `report`.
 *   - progress: `onToolProgress` maps each tool start to a progress line,
 *               streamed via `onProgressLine`.
 *   - channels: BOTH model channels are consumed from `fullStream` —
 *               reasoning-delta (stage "thinking") and text-delta (stage
 *               "writing"). Like the kernel, `onLine` receives the CURRENT
 *               line (text after the last newline) on every delta so the
 *               caller can render a single live subtitle line; text wins over
 *               reasoning once the model starts writing.
 *
 * Playground addition (no kernel counterpart): the playground has no main
 * agent, so the report itself must stream. When `streamedReportField` is set,
 * the runner incrementally decodes that string field out of the report tool's
 * streaming input JSON (`tool-input-delta`) and emits it via `onAnswerDelta`
 * — this is what lets the final answer render token-by-token.
 *
 * Dropped from the kernel version: ModelConfig resolution / provider effort
 * injection (the caller passes providerOptions directly), the workflow
 * `data-tool-progress` emitter, the DeepSeek thinking×tool_choice retry (the
 * recall caller owns that fallback), sources, and the withStepTimeout
 * backstop. The runner NEVER throws — every failure is a structured
 * `{ ok: false }`.
 */
import {
  isStepCount,
  streamText,
  type LanguageModel,
  type PrepareStepFunction,
  type ToolSet,
} from "ai";
import type { z } from "zod";

/** Extract the report tool's input from the run's tool calls, zod-validated. */
function extractToolReport<S extends z.ZodType>(
  toolCalls: ReadonlyArray<{ toolName: string; input: unknown }>,
  reportToolName: string,
  reportSchema: S,
): z.infer<S> | undefined {
  const call = toolCalls.find((tc) => tc.toolName === reportToolName);
  if (!call || call.input === undefined || call.input === null) return undefined;
  const parsed = reportSchema.safeParse(call.input);
  return parsed.success ? parsed.data : undefined;
}

/** Detect the `AbortSignal.timeout()` abort — it surfaces as "AbortError". */
function isTimeoutAbort(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "name" in err &&
    (err as { name?: unknown }).name === "AbortError"
  );
}

/**
 * Incrementally decode one string field out of a partially-streamed JSON
 * object (the report tool's input as it arrives in `tool-input-delta`
 * chunks). Each `push` returns the newly-decoded suffix of the field's value,
 * or undefined when nothing new can be decoded yet (incomplete escape
 * sequences are held back until they complete).
 */
function createStreamingFieldDecoder(field: string) {
  let json = "";
  let emitted = 0; // decoded chars already handed out
  let closed = false; // the field's closing quote has arrived
  const keyRe = new RegExp(`"${field}"\\s*:\\s*"`);

  return function push(delta: string): string | undefined {
    if (closed && emitted > 0) return undefined;
    json += delta;
    const m = keyRe.exec(json);
    if (!m) return undefined;
    const raw = json.slice(m.index + m[0].length);

    // Find the closing quote (an unescaped `"`).
    let end = -1;
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === "\\") {
        i++;
        continue;
      }
      if (raw[i] === '"') {
        end = i;
        break;
      }
    }
    let partial = end >= 0 ? raw.slice(0, end) : raw;
    if (end >= 0) closed = true;
    // A trailing lone backslash is an incomplete escape — hold it back.
    if (!closed && partial.endsWith("\\")) partial = partial.slice(0, -1);

    let decoded: string;
    try {
      decoded = JSON.parse(`"${partial}"`) as string;
    } catch {
      return undefined; // incomplete \uXXXX etc. — wait for more input
    }
    if (decoded.length <= emitted) return undefined;
    const out = decoded.slice(emitted);
    emitted = decoded.length;
    return out;
  };
}

export interface RunAgentOptions<Report> {
  /** Pre-built model instance (the playground constructs DeepSeek itself). */
  model: LanguageModel;
  /** Static system prompt — shared prefix for provider prompt caches. */
  system: string;
  /** The dynamic user prompt: question, strands hint, language. */
  prompt: string;
  /** Tool set — at minimum the report tool the agent reports through. */
  tools: ToolSet;
  /** Name of the report tool whose input is extracted + validated. */
  reportToolName: string;
  /** Zod schema the report tool's input is validated against. */
  reportSchema: z.ZodType<Report>;
  /** Hard step cap (`stopWhen: isStepCount(maxSteps)`). */
  maxSteps: number;
  /** Per-step override passthrough — e.g. recall forcing its report tool when
   *  the step budget is nearly exhausted. */
  prepareStep?: PrepareStepFunction<ToolSet>;
  /** Provider-specific options (e.g. DeepSeek thinking + reasoningEffort). */
  providerOptions?: Record<string, Record<string, unknown>>;
  /** Map each tool start to a progress line. Return undefined to skip. */
  onToolProgress?: (toolCall: {
    toolName: string;
    input: unknown;
  }) => string | undefined;
  /** Receives each progress line as the matching tool starts. */
  onProgressLine?: (line: string) => void;
  /**
   * Receives the CURRENT line (text after the last newline) on every thinking
   * or writing delta, unthrottled — the kernel's live-subtitle channel. The
   * stage is "writing" once answer text has started, "thinking" before.
   */
  onLine?: (line: string, stage: "thinking" | "writing") => void;
  /**
   * Name of a string field inside the report tool's input to stream
   * incrementally (e.g. "answer") — the playground has no main agent, so the
   * report itself is the streamed reply.
   */
  streamedReportField?: string;
  /** Receives each newly-decoded delta of `streamedReportField`. */
  onAnswerDelta?: (delta: string) => void;
  /** Wall-clock budget in ms (AbortSignal.timeout). */
  timeoutMs: number;
  /** Sampling temperature. Default 0.3 (episodic understanding). */
  temperature?: number;
}

export interface RunAgentResult<Report> {
  /** The model call completed (report may still be absent — check `report`). */
  ok: boolean;
  /** The validated report-tool input, when the model reported and it parsed. */
  report?: Report;
  /** Any generated text (write-as-you-go partial answer). */
  text?: string;
  /** The thinking trail, when the provider returned one. */
  reasoning?: string;
  /** True when the run hit its wall-clock budget (ok is false). */
  timedOut?: boolean;
  /** Human-readable failure reason (ok is false). */
  error?: string;
}

/**
 * Run one bounded sub-agent invocation. NEVER throws: timeouts and errors
 * return structured `{ ok: false, timedOut?, error }` results so the caller's
 * degradation path stays in control.
 */
export async function runAgent<Report>(
  opts: RunAgentOptions<Report>,
): Promise<RunAgentResult<Report>> {
  const {
    model,
    system,
    prompt,
    tools,
    reportToolName,
    reportSchema,
    maxSteps,
    prepareStep,
    providerOptions,
    onToolProgress,
    onProgressLine,
    onLine,
    streamedReportField,
    onAnswerDelta,
    timeoutMs,
    temperature = 0.3,
  } = opts;

  // Accumulated answer text and thinking trail — returned on completion AND
  // interruption (the kernel's partial semantics: a timeout keeps whatever
  // was streamed).
  let text = "";
  let reasoning = "";
  const toolCalls: Array<{ toolName: string; input: unknown }> = [];

  // Live subtitle: forward the CURRENT line (text after the last newline) so
  // the client shows a growing single line that resets at line boundaries.
  // Writing wins over thinking once the model starts its answer (kernel rule).
  const pushLine = () => {
    const source = text || reasoning;
    if (!source) return;
    const line = source.slice(source.lastIndexOf("\n") + 1);
    onLine?.(line, text ? "writing" : "thinking");
  };

  // Report-answer streaming (playground addition): decode the configured
  // field out of the report tool's input JSON as it streams.
  let reportInputId: string | null = null;
  let decodeReportField: ((delta: string) => string | undefined) | null = null;

  try {
    const stream = streamText({
      model,
      system,
      prompt,
      tools,
      toolChoice: "auto",
      temperature,
      ...(providerOptions
        ? { providerOptions: providerOptions as never }
        : {}),
      stopWhen: isStepCount(maxSteps),
      ...(prepareStep ? { prepareStep } : {}),
      abortSignal: AbortSignal.timeout(timeoutMs),
    });

    let timedOut = false;
    try {
      for await (const part of stream.fullStream) {
        if (part.type === "text-delta") {
          text += part.text;
          pushLine();
        } else if (part.type === "reasoning-delta") {
          reasoning += part.text;
          pushLine();
        } else if (part.type === "tool-input-start") {
          if (streamedReportField && part.toolName === reportToolName) {
            reportInputId = part.id;
            decodeReportField = createStreamingFieldDecoder(streamedReportField);
          }
        } else if (part.type === "tool-input-delta") {
          if (decodeReportField && part.id === reportInputId) {
            const out = decodeReportField(part.delta);
            if (out) onAnswerDelta?.(out);
          }
        } else if (part.type === "tool-call") {
          toolCalls.push({ toolName: part.toolName, input: part.input });
          const line = onToolProgress?.({
            toolName: part.toolName,
            input: part.input,
          });
          if (line) onProgressLine?.(line);
        } else if (part.type === "abort") {
          timedOut = true;
        }
      }
    } catch (err) {
      if (isTimeoutAbort(err)) timedOut = true;
      else throw err;
    }

    if (timedOut) {
      return {
        ok: false,
        timedOut: true,
        text,
        ...(reasoning ? { reasoning } : {}),
        error: `Sub-agent did not finish within ${Math.round(timeoutMs / 1000)}s.`,
      };
    }

    return {
      ok: true,
      report: extractToolReport(toolCalls, reportToolName, reportSchema),
      text,
      ...(reasoning ? { reasoning } : {}),
    };
  } catch (err) {
    if (isTimeoutAbort(err)) {
      return {
        ok: false,
        timedOut: true,
        text,
        ...(reasoning ? { reasoning } : {}),
        error: `Sub-agent did not finish within ${Math.round(timeoutMs / 1000)}s.`,
      };
    }
    return {
      ok: false,
      text,
      ...(reasoning ? { reasoning } : {}),
      error: err instanceof Error ? err.message : "Sub-agent failed",
    };
  }
}
