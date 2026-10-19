/**
 * The `console` a style sees, installed by the core so one call means the same
 * thing on every host:
 *
 * - `log` / `debug` / `trace` (and `dir`, `dirxml`, `table`) are the trace
 *   stream: budgeted per run, never kept.
 * - `info` / `warn` / `error` are findings, readable through
 *   `style.diagnostics`.
 * - `assert` reports like `error` when its condition is false.
 * - The remaining methods (`count`, `time`, `group`, …) do nothing.
 *
 * Nothing here throws and nothing returns a value a caller may depend on.
 */
import type { SandboxContext } from "../host.js";
import type { StyleMessageReporter } from "../messages.js";
export declare function installStyleConsole(context: SandboxContext, reporter: StyleMessageReporter): void;
//# sourceMappingURL=console.d.ts.map