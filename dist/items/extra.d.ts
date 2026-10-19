/**
 * `extra` field syntax: the variable-line dialect Zotero itself reads and
 * writes (`Key: value`), plus Banyan's normalized key form.
 *
 * Part of the input-side convenience layer: it turns a Zotero-shaped string
 * field into the normalized map the author contract promises. Hosts that build
 * Banyan items from another source may skip it, but must still honour the key
 * form documented on `ExtraMap`.
 */
import type { ExtraMap } from "../types/item.js";
export type ParsedExtraLine = {
    raw: string;
    normalizedKey: string | null;
    value: string;
};
/** Split one `extra` line into its normalized key and value, or prose. */
export declare function parseExtraLine(raw: string): ParsedExtraLine;
/**
 * Whether a key can be written as, and read back from, a variable line. A key
 * refused here is one a write could never match again.
 */
export declare function isValidExtraKey(value: unknown): boolean;
/**
 * Normalize an extra-field key to canonical kebab-case.
 *
 * Digits are intentionally kept attached to letters (e.g. "date2" stays
 * "date2") so numeric-suffixed keys like `date2` / `issue2` remain stable.
 */
export declare function normalizeExtraKey(value: unknown): string;
/**
 * Convert an extra-field key to Zotero's preferred title-case form for
 * writing into the `extra` field (e.g. `Type`, `Genre`, `Status`,
 * `Citation Key`). Matching/comparison should still go through
 * `normalizeExtraKey()` (lowercase kebab-case).
 *
 * Existing capitals (e.g. acronyms like `DOI`, `arXiv`) are preserved.
 */
export declare function toTitleCaseExtraKey(value: unknown): string;
export declare function parseExtraLines(extraText: string): ParsedExtraLine[];
/**
 * Parse the whole `extra` field into the normalized map.
 *
 * Repeated keys become an array: a community convention Zotero itself never
 * writes, preserved as data instead of choosing one value.
 */
export declare function parseExtraMap(extraText: string): ExtraMap;
export declare function replaceExtraFieldBlock(extraText: string, normalizedKey: string, values: readonly string[]): string;
//# sourceMappingURL=extra.d.ts.map