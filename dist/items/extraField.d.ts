/**
 * Pure helpers for reading and writing the `extra` field. Line classification
 * and key normalization are owned by `./extra`; the interactive conflict prompt
 * belongs to the caller's UI.
 */
import { type ParsedExtraLine } from "./extra.js";
export type { ParsedExtraLine };
/**
 * Values of one normalized `extra` key, in file order. Repeated keys are read
 * (a community convention), never written.
 */
export declare function analyzeExtraField(extraText: string, normalizedKey: string): {
    values: string[];
};
/**
 * Whether writing `value` over `existingValues` needs a user decision. An empty
 * list, or exactly the wanted value, writes straight away; anything else —
 * including repeated lines of one key — asks first.
 */
export declare function needsConflictDecision(existingValues: readonly string[], value: string): boolean;
/**
 * Text one `extra` key contributes to a reading-oriented surface (an item-tree
 * column): every line of that key, joined, or `""` when the key is unset. The
 * input key is normalized here, so callers may pass what the user typed.
 */
export declare function getExtraValueForDisplay(extraText: string, key: string): string;
/**
 * Write one `extra` line, keeping the key/value block at the top of the field and
 * sorting it by normalized key, so citeproc reads the pairs before any prose. The
 * written key replaces the first occurrence and collapses any remaining
 * duplicates; a replaced line is written back in the modern `Key: value` form.
 */
export declare function mergeExtraField(extraText: string, writeKey: string, normalizedKey: string, value: string): string;
//# sourceMappingURL=extraField.d.ts.map