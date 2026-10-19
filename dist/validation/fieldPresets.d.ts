import type { FieldPreset } from "../types/style.js";
import { type StyleMessageReporter } from "../messages.js";
import type { SandboxContext } from "../host.js";
/**
 * Primary (non-itemData) keys a preset must never target: writing them either
 * throws in `Zotero.Item.setField()` or changes item identity. Callers that
 * expose field selection in a UI should reuse this set instead of keeping a
 * second copy.
 */
export declare const DENIED_KEYS: ReadonlySet<string>;
/**
 * Normalize the `ITEM_FIELD_PRESETS` export to host-side presets, as
 * `normalizeParams()` does: waive the value out of the sandbox, validate entry
 * by entry, and drop what is unusable with a diagnostic.
 */
export declare function normalizeFieldPresets(raw: unknown, context: SandboxContext, messages: StyleMessageReporter): FieldPreset[] | undefined;
/** Whether applying the preset still needs a value from the user. */
export declare function hasDeferredFieldValues(preset: FieldPreset): boolean;
/**
 * Menu text of a preset: its label, plus an ellipsis when a value is to be filled
 * at apply time.
 */
export declare function getFieldPresetMenuLabel(preset: FieldPreset): string;
//# sourceMappingURL=fieldPresets.d.ts.map