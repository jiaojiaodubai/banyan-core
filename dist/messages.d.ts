/**
 * What a run reports.
 *
 * A run produces records; failures travel as exceptions instead, and
 * `code` says which part failed. Severity describes the record:
 *
 * - `trace` — a stream: budgeted per run and never kept.
 * - `info` / `warning` / `error` — findings: kept as data, deduplicated and
 *   capped, with one notice when further findings are dropped.
 *
 * The core never prints: a caller that wants records as they happen passes a
 * sink, and findings are readable afterwards through `style.diagnostics`.
 */
import type { RuntimeCode } from "./sandbox/runtimeErrors.js";
import type { CitationContext, Style, StyleOptionValues, StyleResult } from "./types/style.js";
export type StyleSeverity = "trace" | "info" | "warning" | "error";
/** Reserved `source` values; a subsystem may also use its own name. */
export type StyleMessageSource = "style" | "host" | "core";
/** Top-level style export a declaration finding can point at. */
export type StyleDeclarationExport = "STYLE_OPTIONS" | "CITATION_PARAMS" | "CITE_PARAMS" | "ITEM_FIELD_PRESETS" | "ITEM_FIELD_VALIDATORS";
/**
 * Machine-readable facts about one record.
 *
 * `message` stays the human line; `detail` is what a host groups, filters, or
 * navigates by without parsing that line. The core fills the keys it owns and
 * leaves the rest open to hosts.
 */
export interface StyleDeclarationLocation {
    /** The top-level export that owns the declaration. */
    export: StyleDeclarationExport;
    /** Parameter/preset id, when the declaration has one. */
    id?: string;
    /** Zero-based entry index in the exported array. */
    index?: number;
    /** List-field id inside a list parameter. */
    field?: string;
    /** Zero-based index of a list field inside its `fields` array. */
    fieldIndex?: number;
    /** `ITEM_FIELD_VALIDATORS` group (a Zotero item type). */
    group?: string;
}
export interface StyleMessageDetail {
    /** Style identity, present once `INFO` is readable. */
    style?: {
        id?: string;
        title?: string;
    };
    /**
     * The declaration the finding belongs to. `export` is present on every
     * finding the core attributes; inner scopes add `id`/`field` as they narrow.
     */
    declaration?: StyleDeclarationLocation;
    /** Hosts may add their own facts; the keys above are the core's own. */
    [key: string]: unknown;
}
/**
 * A scope's addition to `detail`: the outer scope supplies `export`, while an
 * inner scope narrows it with `id`/`field` and must not be able to drop it.
 * Only `withDetail()` consumes this shape; records carry `StyleMessageDetail`.
 */
export interface StyleMessageDetailPatch {
    style?: {
        id?: string;
        title?: string;
    };
    declaration?: Partial<StyleDeclarationLocation>;
    [key: string]: unknown;
}
export interface StyleMessage {
    severity: StyleSeverity;
    /** Who produced it: `style` (author code), `host`, `core`, or a subsystem. */
    source: string;
    /** What the run was doing (see `RuntimeCode`). */
    code: RuntimeCode;
    /** One line, ready to be shown as is. */
    message: string;
    /** Values a host may render instead of parsing `message` (see `StyleMessageDetail`). */
    detail?: StyleMessageDetail;
}
/** A message before the reporter fills in the code. */
export type StyleMessageInput = Omit<StyleMessage, "code">;
export type StyleMessageSink = (message: StyleMessage) => void;
/** Severities a caller keeps: `trace` is a stream, the rest are findings. */
export type StyleDiagnosticLevel = Exclude<StyleSeverity, "trace">;
export type StyleDiagnostic = StyleMessage & {
    severity: StyleDiagnosticLevel;
};
export type StyleDiagnostics = StyleDiagnostic[];
/**
 * Findings one style keeps. One additional entry may be the truncation notice
 * once the cap is reached, so `diagnostics.length` can be one larger.
 */
export declare const MAX_DIAGNOSTICS = 200;
/** Trace lines one run may emit before the rest is suppressed. */
export declare const MAX_TRACE_LINES_PER_RUN = 1000;
export interface StyleMessageReporter {
    /**
     * Code the next message is attributed to: the current run while one is open,
     * otherwise the last run that settled (load findings before the first run).
     */
    readonly code: RuntimeCode;
    /**
     * Load findings plus the latest generate run's, deduplicated by
     * severity/source/code/message/detail and capped at `MAX_DIAGNOSTICS`, plus a
     * one-time truncation notice when more arrive. A generate run replaces its
     * own previous findings and keeps the load ones.
     *
     * The array is live and stable by reference. When a run starts, its previous
     * findings are removed before the new ones arrive, so during a run the array
     * can be missing that code's entries; read it after the generate promise
     * settles for the complete view.
     */
    readonly diagnostics: readonly StyleDiagnostic[];
    /** Send one message: to the sink, and to `diagnostics` when it is a finding. */
    report(input: StyleMessageInput): void;
    /**
     * Start a run: attribute messages to `code`, drop the findings of the previous
     * run with the same code, and give traces a fresh budget. Returns the restore
     * function (idempotent).
     */
    beginRun(code: RuntimeCode): () => void;
}
/**
 * `createStyle()` result: the style contract plus what its runs reported.
 * `diagnostics` is a host-side view, not something a style exports.
 *
 * Unlike an author script's `generate` (which may be synchronous), the
 * host-side entry point always returns a promise: the bridge settles the
 * style's sync or async result through the host realm either way.
 */
export interface StyleInstance extends Omit<Style, "generate"> {
    generate(contexts: CitationContext[], options?: StyleOptionValues): Promise<StyleResult>;
    readonly diagnostics: readonly StyleDiagnostic[];
}
/** Attach declaration/group facts to every record a subsystem reports. */
export declare function withDetail(messages: StyleMessageReporter, detail: StyleMessageDetailPatch): StyleMessageReporter;
export declare function createStyleMessageReporter(sink?: StyleMessageSink, 
/**
 * Facts shared by every record, read when a record is reported. The core
 * uses it for the style identity once `INFO` has been copied to the host.
 */
baseDetail?: () => StyleMessageDetail | undefined): StyleMessageReporter;
//# sourceMappingURL=messages.d.ts.map