/**
 * Normalization of the raw values a style hands back: unit trees are untrusted
 * input, so every layer is re-checked and bounded here before compilation.
 */
import type { TextCaseForm, TextUnit, Unit } from "../types/unit.js";
/**
 * Walk state for one normalization pass. `seen` holds the containers on the
 * current path, so a cyclic tree is reported instead of overflowing the stack;
 * shared (non-cyclic) sub-units stay allowed but count against a total-node
 * budget, so a small DAG cannot expand exponentially.
 */
type UnitWalk = {
    seen: WeakSet<object>;
    depth: number;
    nodes: number;
};
export declare function assertArrayLengthWithinBudget(value: readonly unknown[], fieldName: string, maxLength: number): void;
/**
 * Normalize a unit coming from the sandbox into a plain host-side unit, used by
 * the unit-builder utilities before the value crosses back.
 */
export declare function toHostUnit(input?: Unit): Unit | undefined;
export declare function normalizeUnitInput(input: unknown, walk?: UnitWalk): Unit | null;
export declare function normalizeUnitList(input: unknown, walk?: UnitWalk): Unit[];
export declare function normalizeOptionalUnit(input: unknown, walk?: UnitWalk): Unit | undefined;
export declare function normalizeTextCaseForm(form: unknown): TextCaseForm | undefined;
export declare function normalizeStringArray(input: unknown): string[] | undefined;
export declare function normalizeTextUnit(input: Record<string, unknown>): TextUnit;
export {};
//# sourceMappingURL=normalize.d.ts.map