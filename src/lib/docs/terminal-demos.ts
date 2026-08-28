/**
 * Terminal demo data — real captured `previously` CLI output, sanitized
 * (paths rewritten to canonical `~/...` form). Rendered by
 * `@/components/mdx/terminal.tsx` via `<Terminal demo="..." />`.
 *
 * Colors are written as ANSI SGR escapes; the Terminal component parses a
 * small subset (reset, bold, standard/bright fg, 24-bit fg).
 */

const E = "\x1b[";
const reset = `${E}0m`;
const bold = (s: string) => `${E}1m${s}${reset}`;
const blue = (s: string) => `${E}38;2;0;102;255m${s}${reset}`;
const green = (s: string) => `${E}32m${s}${reset}`;
const yellow = (s: string) => `${E}33m${s}${reset}`;
const gray = (s: string) => `${E}90m${s}${reset}`;

function visibleWidth(s: string): number {
  return s.replace(/\x1b\[[0-9;]*m/g, "").length;
}

/** Assemble content lines into the CLI's signature rounded panel. */
function panel(lines: string[]): string {
  const width = Math.max(...lines.map(visibleWidth));
  const bar = "─".repeat(width + 2);
  const rows = lines.map(
    (line) =>
      `${blue("│")} ${line}${" ".repeat(width - visibleWidth(line))} ${blue("│")}`,
  );
  return [blue(`╭${bar}╮`), ...rows, blue(`╰${bar}╯`)].join("\n");
}

/** Bare `previously` right after init: nothing running yet, next step shown. */
const statusFresh = panel([
  "",
  `${bold("Home:")}      ${blue("~/.previously")}`,
  `${bold("Config:")}    ${blue("~/.previously/config.json")}`,
  `${bold("Kernel:")}    ${gray("not running")}`,
  `${bold("Version:")}   0.9.0 (pinned 0.9.0 — ${green("compatible")}, source: pointer)`,
  `${bold("Port:")}      ${blue("127.0.0.1:3210")} ${gray("unreachable")}`,
  `${bold("Storage:")}   local (memory root: ${blue("~/Documents/Previously")})`,
  `${bold("Memory repo:")} main — clean, last commit 2026-08-28T05:23:38Z`,
  `${bold("Backend:")}   claude`,
  `  bridge ${bold("claude")}: ${green("found (/usr/local/bin/claude)")}`,
  `  bridge ${bold("codex")}: ${yellow('not found — "codex" not on PATH')}`,
  `  bridge ${bold("kimi")}: ${green("found (~/.kimi-code/bin/kimi)")}`,
  `${bold("Scribe:")}    ${gray("not running")}`,
  `  ${bold("claude-code")}: 225/225 files, 0 events, 0 parse errors, last event —`,
  `  ${bold("codex")}: ${yellow("! root absent (~/.codex/sessions)")}`,
  `  ${bold("kimi-code")}: 227/227 files, 6 events, 0 parse errors, last event 2026-08-28T05:23:34Z`,
  `  ${bold("gemini")}: ${yellow("! root absent (~/.gemini/tmp)")}`,
  `${yellow(bold("Next:"))}      run \`previously start\` to start the kernel`,
  "",
]);

/** After `previously start`: kernel + scribe running, port reachable. */
const statusRunning = panel([
  "",
  `${bold("Home:")}      ${blue("~/.previously")}`,
  `${bold("Config:")}    ${blue("~/.previously/config.json")}`,
  `${bold("Kernel:")}    ${green("running (pid 13584)")}`,
  `${bold("Version:")}   0.9.0 (pinned 0.9.0 — ${green("compatible")}, source: pointer)`,
  `${bold("Port:")}      ${blue("127.0.0.1:3210")} ${green("reachable")}`,
  `${bold("Storage:")}   local (memory root: ${blue("~/Documents/Previously")})`,
  `${bold("Memory repo:")} main — clean, last commit 2026-08-28T05:23:38Z`,
  `${bold("Backend:")}   claude`,
  `  bridge ${bold("claude")}: ${green("found (/usr/local/bin/claude)")}`,
  `  bridge ${bold("codex")}: ${yellow('not found — "codex" not on PATH')}`,
  `  bridge ${bold("kimi")}: ${green("found (~/.kimi-code/bin/kimi)")}`,
  `${bold("Scribe:")}    ${green("running (pid 20040)")}`,
  `  ${bold("claude-code")}: 225/225 files, 0 events, 0 parse errors, last event —`,
  `  ${bold("codex")}: ${yellow("! root absent (~/.codex/sessions)")}`,
  `  ${bold("kimi-code")}: 234/234 files, 1790 events, 0 parse errors, last event 2026-08-28T05:23:34Z`,
  `  ${bold("gemini")}: ${yellow("! root absent (~/.gemini/tmp)")}`,
  "",
]);

export const terminalDemos: Record<string, { title: string; ansi: string }> = {
  "status-fresh": { title: "previously", ansi: statusFresh },
  "status-running": { title: "previously", ansi: statusRunning },
};
