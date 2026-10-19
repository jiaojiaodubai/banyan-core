/**
 * The one Unit compiler.
 *
 * `compileUnitTree` walks a normalized unit tree and produces styled text runs.
 * Group/affix/fallback/`when` semantics, text-case and link sanitizing live here
 * and nowhere else: the generate-output normalizer and the author utilities
 * (`compile`, `plainText`) all call this module, so the two views of a Unit can
 * no longer drift.
 *
 * Markup is the only host-dependent part. A caller that has the `parseHtml`
 * capability passes `splitText`, which turns one text value into styled runs;
 * without it, text is taken as written (still entity-free: no HTML semantics
 * are invented by the core).
 *
 * DEBT(next feature in this file): compilation, text-case dispatch,
 * ignore-words and the small-caps table share this module; splitting them needs
 * one shared `CompiledTextUnit` protocol first.
 */
import type { RichText, TextCaseForm, TextUnit } from "../types/unit.js";
import { type RichTextRun } from "../richText/richText.js";
/**
 * A run produced by the compiler. `smallCaps` and `noCase` are intermediate
 * markers from parsed markup: they affect text-case and are resolved by
 * `finalizeCompiledUnit`, never carried into a `RichText`.
 */
export type CompiledTextUnit = RichTextRun & {
    /** The text was marked small-caps (`<sc>` / `font-variant`). */
    smallCaps?: boolean;
    /** The text came from a `nocase` span: exempt from text-case. */
    noCase?: boolean;
};
/** Turn one text value into styled runs (markup splitting for output). */
export type SplitText = (base: TextUnit) => CompiledTextUnit[];
export interface CompileOptions {
    /** Markup-aware text splitter; omitted, a text value stays one run. */
    splitText?: SplitText;
}
export declare function normalizeTextValue(value: unknown): string;
/**
 * Append a run, merging it into the previous one when the style matches.
 *
 * DEBT(representation drift): near-copies of this merge live in
 * `output/normalizeGenerateResult.pushMergedRun` and
 * `richText/richText.pushMergedSegment`; they differ by representation, so a
 * shared merger would need a cross-representation style protocol. Merge them
 * only when a style field drifts between the copies.
 */
export declare function pushMergedCompiled(out: CompiledTextUnit[], unit: CompiledTextUnit): void;
/** Compile a unit tree into styled runs (markers still present). */
export declare function compileUnitTree(unit: unknown, options?: CompileOptions): CompiledTextUnit[];
/** Resolve the intermediate markers and return a plain run. */
export declare function finalizeCompiledUnit(unit: CompiledTextUnit): RichTextRun;
/** Compile a unit tree all the way to `RichText`. */
export declare function compileRichText(unit: unknown, options?: CompileOptions): RichText;
/** Visible text of a unit tree, matches included. */
export declare function plainTextOfUnit(unit: unknown, options?: CompileOptions): string;
export declare function applyTextCase(str: string, form: TextCaseForm, ignoreWords?: string[]): string;
//# sourceMappingURL=compile.d.ts.map