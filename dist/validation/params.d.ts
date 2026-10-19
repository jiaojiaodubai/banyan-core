/**
 * Normalize the parameter declarations a style exports.
 *
 * A parameter is data: `state` is a closed state, `value` is an open string
 * (plain or restricted rich markup), and `list` is a repeated set of value
 * fields. The host derives widgets from these declarations. The core bridges
 * the three runtime callbacks (`applicable`, `forcedValue`, `validate`) and
 * runs all of them during resolution, so a host never calls style code for a
 * parameter.
 */
import type { CitationParam, CiteParam, StyleOptionParam } from "../types/style.js";
import type { SandboxContext } from "../host.js";
import { type StyleMessageReporter } from "../messages.js";
export declare function normalizeStyleParams(raw: unknown, context: SandboxContext, messages: StyleMessageReporter): StyleOptionParam[] | undefined;
export declare function normalizeCitationParams(raw: unknown, context: SandboxContext, messages: StyleMessageReporter): CitationParam[] | undefined;
export declare function normalizeCiteParams(raw: unknown, context: SandboxContext, messages: StyleMessageReporter): CiteParam[] | undefined;
//# sourceMappingURL=params.d.ts.map