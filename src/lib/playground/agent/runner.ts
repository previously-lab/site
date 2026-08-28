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
 *               streamed via `onProgressLine`; answer text streams via
 *               `onTextDelta`.
 *
 * Dropped from the kernel version: ModelConfig resolution / provider effort
 * injection (the playground passes a pre-built LanguageModel), the workflow
 * `data-tool-progress` emitter (the route streams SSE directly), the DeepSeek
 * thinking×tool_choice retry (this port runs non-thinking), sources, and the
 * withStepTimeout backstop. The runner NEVER throws — every failure is a
 * structured `{ ok: false }`.
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
  /** Map each tool start to a progress line. Return undefined to skip. */
  onToolProgress?: (toolCall: {
    toolName: string;
    input: unknown;
  }) => string | undefined;
  /** Receives each progress line as the matching tool starts. */
  onProgressLine?: (line: string) => void;
  /** Receives every answer text delta, unthrottled. */
  onTextDelta?: (delta: string) => void;
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
    onToolProgress,
    onProgressLine,
    onTextDelta,
    timeoutMs,
    temperature = 0.3,
  } = opts;

  // Accumulated answer text — returned on completion AND interruption (the
  // kernel's partial semantics: a timeout keeps whatever was streamed).
  let text = "";
  const toolCalls: Array<{ toolName: string; input: unknown }> = [];

  try {
    const stream = streamText({
      model,
      system,
      prompt,
      tools,
      toolChoice: "auto",
      temperature,
      stopWhen: isStepCount(maxSteps),
      ...(prepareStep ? { prepareStep } : {}),
      abortSignal: AbortSignal.timeout(timeoutMs),
    });

    let timedOut = false;
    try {
      for await (const part of stream.fullStream) {
        if (part.type === "text-delta") {
          text += part.text;
          onTextDelta?.(part.text);
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
        error: `Sub-agent did not finish within ${Math.round(timeoutMs / 1000)}s.`,
      };
    }

    return {
      ok: true,
      report: extractToolReport(toolCalls, reportToolName, reportSchema),
      text,
    };
  } catch (err) {
    if (isTimeoutAbort(err)) {
      return {
        ok: false,
        timedOut: true,
        text,
        error: `Sub-agent did not finish within ${Math.round(timeoutMs / 1000)}s.`,
      };
    }
    return {
      ok: false,
      text,
      error: err instanceof Error ? err.message : "Sub-agent failed",
    };
  }
}
