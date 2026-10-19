import { type SandboxContext } from "../host.js";
import { type StyleMessageReporter } from "../messages.js";
import type { Item } from "../types/item.js";
import type { FieldCheckResult, FieldValidator, ItemFieldValidators } from "../types/style.js";
export type FieldCheckStatus = "pass" | "fail" | "error";
export type FieldCheckErrorReason = "thrown" | "invalid-result" | "timeout";
/** Budget for one asynchronous checker, in milliseconds. */
export declare const FIELD_CHECK_TIMEOUT_MS = 10000;
/** One checker's outcome, ready to be rendered in a host report. */
export type FieldCheckEntry = {
    description: string;
    status: FieldCheckStatus;
    messages: string[];
    /** Set when `status` is `error`; the host localizes the reason. */
    error?: FieldCheckErrorReason;
};
/**
 * Normalize the `ITEM_FIELD_VALIDATORS` export: an object keyed by Zotero item
 * type, each value an array of `{ description, check }` entries. Invalid
 * entries are dropped with a diagnostic; the style itself still loads.
 */
export declare function normalizeItemFieldValidators(raw: unknown, context: SandboxContext, messages: StyleMessageReporter): ItemFieldValidators | undefined;
/**
 * Run one item type's checkers against a snapshot. Checks run in declaration
 * order, each one awaited until it settles or its timeout expires; a throwing,
 * malformed, or timed-out checker becomes an `error` entry and the remaining
 * checkers still run.
 */
export declare function runItemFieldValidators(validators: readonly FieldValidator[], item: Readonly<Item>, options?: {
    timeoutMs?: number;
}): Promise<FieldCheckEntry[]>;
export type { FieldCheckResult };
//# sourceMappingURL=itemFieldValidators.d.ts.map