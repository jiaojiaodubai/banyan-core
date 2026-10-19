/**
 * `creators-ext` records: Banyan's per-creator extension data, stored as one
 * JSON object per `extra` line under the `creators-ext` key.
 *
 * Part of the input-side convenience layer (see `dev/hostIntegration.md`,
 * "Preparing style input"): the record shape is a Banyan convention validated
 * here, so authors may build items from any source as long as they follow it.
 */
import type { Creator, CreatorExtFields, CreatorExtRecord, ExtraMap } from "../types/item.js";
export type ParsedCreatorExtRecord = {
    lineIndex: number;
    record: CreatorExtRecord;
};
export type CreatorExtParseIssue = {
    lineIndex: number;
    message: string;
};
export type CreatorExtParseResult = {
    records: ParsedCreatorExtRecord[];
    issues: CreatorExtParseIssue[];
};
export type CreatorExtReconciliationResult = {
    bindings: Map<number, CreatorExtFields>;
    issues: string[];
    unmatchedRecordLineIndexes: number[];
};
/** `extra` key holding the records: one JSON object per line. */
export declare const CREATORS_EXT_KEY = "creators-ext";
/** Extension fields, in the window's field order. */
export declare const CREATOR_EXT_FIELDS: readonly ["role", "nationality", "dynasty"];
export declare function parseCreatorsExt(extra: ExtraMap | undefined): CreatorExtParseResult;
/**
 * Identity match requires the same creator type and the same name mode, so a
 * stale record cannot capture an unrelated creator. The window's reload path
 * carries values over by the same rule.
 */
export declare function creatorMatchesExtIdentity(creator: Creator, record: CreatorExtRecord): boolean;
/**
 * Match records to creators by identity, then by the record's `index`, then by
 * row order; the last two apply only while the recorded positions still hold,
 * so a stale record stays unmatched instead of binding to whoever moved into
 * its slot.
 */
export declare function reconcileCreatorsExt(records: readonly ParsedCreatorExtRecord[], creators: readonly Creator[]): CreatorExtReconciliationResult;
/**
 * Attach the parsed extension fields to the creators they belong to, reporting
 * unusable records through `log` (diagnostics only; the item stays usable).
 */
export declare function bindCreatorsExt(item: {
    extra?: ExtraMap;
    creators: Creator[];
}, log?: (message: string) => void): void;
//# sourceMappingURL=creatorsExt.d.ts.map