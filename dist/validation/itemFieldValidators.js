import { errorMessageOf } from "../sandbox/runtimeErrors.js";
import { isSandboxCallable } from "../host.js";
import { withDetail } from "../messages.js";
import { ZOTERO_ITEM_TYPES } from "../schema/zoteroSchema.js";
/** Budget for one asynchronous checker, in milliseconds. */
export const FIELD_CHECK_TIMEOUT_MS = 10_000;
/**
 * Internal control-flow markers: `runItemFieldValidators` catches these and
 * turns them into `FieldCheckEntry.error` reasons. They never cross the public
 * API and therefore do not need a `RuntimeCode`/`sourcePath`.
 */
class InvalidFieldCheckResultError extends Error {
    constructor() {
        super("The item field checker returned an unsupported result.");
        this.name = "InvalidFieldCheckResultError";
    }
}
/** Internal control-flow marker; see `InvalidFieldCheckResultError`. */
class FieldCheckTimeoutError extends Error {
    constructor() {
        super("The item field checker timed out.");
        this.name = "FieldCheckTimeoutError";
    }
}
/**
 * Normalize the `ITEM_FIELD_VALIDATORS` export: an object keyed by Zotero item
 * type, each value an array of `{ description, check }` entries. Invalid
 * entries are dropped with a diagnostic; the style itself still loads.
 */
export function normalizeItemFieldValidators(raw, context, messages) {
    if (raw === undefined || raw === null) {
        return undefined;
    }
    let exported;
    try {
        exported = context.exportValue(raw);
    }
    catch {
        exported = raw;
    }
    if (!isRecord(exported)) {
        warn(withDetail(messages, {
            declaration: { export: "ITEM_FIELD_VALIDATORS" },
        }), "ITEM_FIELD_VALIDATORS must be an object keyed by item type; ignored");
        return undefined;
    }
    const out = {};
    for (const [rawType, rawEntries] of Object.entries(exported)) {
        const itemType = rawType.trim();
        const groupMessages = withDetail(messages, {
            declaration: {
                export: "ITEM_FIELD_VALIDATORS",
                group: itemType || rawType,
            },
        });
        if (!isItemType(itemType)) {
            warn(groupMessages, `ITEM_FIELD_VALIDATORS: unknown item type '${rawType}'; ignored`);
            continue;
        }
        if (!Array.isArray(rawEntries)) {
            warn(groupMessages, `ITEM_FIELD_VALIDATORS['${itemType}'] must be an array of checkers; ignored`);
            continue;
        }
        const validators = [];
        for (const [index, rawEntry] of rawEntries.entries()) {
            const entryMessages = withDetail(groupMessages, {
                declaration: { index },
            });
            if (!isRecord(rawEntry)) {
                warn(entryMessages, `ITEM_FIELD_VALIDATORS['${itemType}'][${index}] is not an object; ignored`);
                continue;
            }
            const description = typeof rawEntry.description === "string"
                ? rawEntry.description.trim()
                : "";
            const namedEntryMessages = description
                ? withDetail(entryMessages, { declaration: { id: description } })
                : entryMessages;
            if (!description) {
                warn(namedEntryMessages, `ITEM_FIELD_VALIDATORS['${itemType}'][${index}] needs a non-empty string description; ignored`);
                continue;
            }
            const check = createHostCheck(rawEntry.check, context);
            if (!check) {
                warn(namedEntryMessages, `ITEM_FIELD_VALIDATORS['${itemType}']['${description}'] needs a check function; ignored`);
                continue;
            }
            validators.push({ description, check });
        }
        if (validators.length) {
            out[itemType] = validators;
        }
    }
    return Object.keys(out).length ? out : undefined;
}
/**
 * Run one item type's checkers against a snapshot. Checks run in declaration
 * order, each one awaited until it settles or its timeout expires; a throwing,
 * malformed, or timed-out checker becomes an `error` entry and the remaining
 * checkers still run.
 */
export async function runItemFieldValidators(validators, item, options = {}) {
    const timeoutMs = options.timeoutMs ?? FIELD_CHECK_TIMEOUT_MS;
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
        // Host programming error, not a style/run failure: keep it a RangeError
        // rather than inventing a RuntimeCode for a call-site mistake.
        throw new RangeError("runItemFieldValidators timeoutMs must be a positive finite number.");
    }
    const entries = [];
    for (const validator of validators) {
        try {
            const result = await withTimeout(Promise.resolve(validator.check(item)), timeoutMs);
            entries.push(toEntry(validator, result));
        }
        catch (error) {
            entries.push(errorEntry(validator, error));
        }
    }
    return entries;
}
/**
 * Bridge one sandbox checker to a host callable. The result is validated once
 * it settles so the runner can trust its type; a synchronous throw or a
 * rejected promise is handled by the runner.
 */
function createHostCheck(raw, context) {
    if (!isSandboxCallable(raw)) {
        return undefined;
    }
    return (item) => {
        const result = raw(context.importValue(item));
        if (isThenable(result)) {
            return Promise.resolve(result).then(normalizeFieldCheckValue);
        }
        return normalizeFieldCheckValue(result);
    };
}
function normalizeFieldCheckValue(value) {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        const message = value.trim();
        if (!message) {
            throw new InvalidFieldCheckResultError();
        }
        return message;
    }
    if (Array.isArray(value)) {
        const messages = [];
        for (const entry of value) {
            if (typeof entry !== "string" || !entry.trim()) {
                throw new InvalidFieldCheckResultError();
            }
            messages.push(entry.trim());
        }
        return messages;
    }
    throw new InvalidFieldCheckResultError();
}
function toEntry(validator, result) {
    if (result === true) {
        return pass(validator);
    }
    if (result === false) {
        return fail(validator, []);
    }
    if (typeof result === "string") {
        return fail(validator, [result]);
    }
    if (result.length === 0) {
        return pass(validator);
    }
    return fail(validator, [...result]);
}
function errorEntry(validator, error) {
    if (error instanceof InvalidFieldCheckResultError) {
        return {
            description: validator.description,
            status: "error",
            messages: [],
            error: "invalid-result",
        };
    }
    if (error instanceof FieldCheckTimeoutError) {
        return {
            description: validator.description,
            status: "error",
            messages: [],
            error: "timeout",
        };
    }
    const message = errorMessage(error);
    return {
        description: validator.description,
        status: "error",
        messages: message ? [message] : [],
        error: "thrown",
    };
}
async function withTimeout(promise, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new FieldCheckTimeoutError()), timeoutMs);
        promise.then((value) => {
            clearTimeout(timer);
            resolve(value);
        }, (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}
function isThenable(value) {
    return (typeof value === "object" &&
        value !== null &&
        "then" in value &&
        typeof value.then === "function");
}
function pass(validator) {
    return { description: validator.description, status: "pass", messages: [] };
}
function fail(validator, messages) {
    return { description: validator.description, status: "fail", messages };
}
function errorMessage(error) {
    // A checker may run in a different realm (the Node host's vm, a future
    // worker), so `instanceof Error` is not a reliable test. Read `message`
    // structurally, exactly as parameter validation and runtimeErrors do.
    if (error === undefined || error === null)
        return "";
    return errorMessageOf(error);
}
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isItemType(value) {
    return ZOTERO_ITEM_TYPES.has(value);
}
function warn(messages, message) {
    messages.report({
        severity: "warning",
        source: "item-field-validators",
        message,
    });
}
//# sourceMappingURL=itemFieldValidators.js.map