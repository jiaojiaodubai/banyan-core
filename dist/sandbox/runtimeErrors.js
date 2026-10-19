export const GENERATE_TIMEOUT_MS = 15 * 60 * 1000;
/**
 * What a run was doing, as a mechanical code a host can branch on without
 * reading messages: `style-load` / `style-contract` while the script is
 * evaluated and validated, `host-capability` for the host's side,
 * `generate` for the style's own code, and `generate-input` / `generate-output`
 * / `generate-timeout` for what `generate()` was given, returned or took.
 * Failures and findings use the same codes.
 */
const RUNTIME_CODES = [
    "style-load",
    "style-contract",
    "host-capability",
    "generate",
    "generate-input",
    "generate-output",
    "generate-timeout",
];
const RUNTIME_CODE_SET = new Set(RUNTIME_CODES);
export function isRuntimeCode(value) {
    return typeof value === "string" && RUNTIME_CODE_SET.has(value);
}
/**
 * Attribute a thrown value to a code, unless it already carries one: the core
 * sets codes where it throws, so this labels what a style threw on its own.
 */
export function withRuntimeCode(value, runCode) {
    const record = value && typeof value === "object"
        ? value
        : null;
    if (!record || isRuntimeCode(record.code)) {
        return value;
    }
    try {
        record.code = runCode;
    }
    catch {
        // A frozen or exotic throwable stays as it is; the caller still sees it.
    }
    return value;
}
function toFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value)
        ? value
        : undefined;
}
export function inheritSandboxErrorMetadata(target, source) {
    const sourceRecord = source && typeof source === "object"
        ? source
        : null;
    if (!sourceRecord) {
        return;
    }
    const fileName = typeof sourceRecord.fileName === "string" && sourceRecord.fileName.trim()
        ? sourceRecord.fileName
        : undefined;
    const lineNumber = toFiniteNumber(sourceRecord.lineNumber);
    const columnNumber = toFiniteNumber(sourceRecord.columnNumber);
    const stack = typeof sourceRecord.stack === "string" && sourceRecord.stack.trim()
        ? sourceRecord.stack
        : undefined;
    if (fileName) {
        target.fileName = fileName;
    }
    if (lineNumber !== undefined) {
        target.lineNumber = lineNumber;
    }
    if (columnNumber !== undefined) {
        target.columnNumber = columnNumber;
    }
    if (stack) {
        target.stack = `${target.name}: ${target.message}\nCaused by: ${stack}`;
    }
}
export function createBanyanRuntimeError(message, details) {
    const error = new Error(message);
    if (details) {
        Object.assign(error, details);
    }
    return error;
}
export function createGenerateTimeoutError(styleName, timeoutMs = GENERATE_TIMEOUT_MS) {
    return createBanyanRuntimeError(`Style "${styleName}" generate() exceeded ${formatTimeout(timeoutMs)}. Async work may be stuck or waiting forever.`, {
        code: "generate-timeout",
        sourcePath: "generate()",
    });
}
function formatTimeout(timeoutMs) {
    if (timeoutMs >= 60_000 && timeoutMs % 1_000 === 0) {
        return `${timeoutMs / 1_000} seconds`;
    }
    return `${timeoutMs} ms`;
}
/**
 * Reject a run that takes too long.
 *
 * LIMIT(platform): this only abandons the wait — the sandboxed promise chain
 * cannot be interrupted from here, so a timed-out run may keep executing and
 * reading whatever globals are installed later. Hosts that need strict
 * isolation must discard the style instance. The 15-minute default is a safety
 * net for a document operation, not a UI budget; a host that shares its main
 * thread with the user should pass a smaller value.
 */
export function withGenerateTimeout(promise, styleName, timeoutMs = GENERATE_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(createGenerateTimeoutError(styleName, timeoutMs));
        }, timeoutMs);
        promise.then((value) => {
            clearTimeout(timer);
            resolve(value);
        }, (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}
/**
 * Message of a thrown value without relying on `instanceof Error`: values from
 * another realm (a Gecko sandbox, `node:vm`) are not host-realm Errors even
 * when they carry `message` and `stack`.
 */
export function errorMessageOf(value) {
    if (typeof value === "string") {
        return value;
    }
    if (value && typeof value === "object") {
        const message = value.message;
        if (typeof message === "string" && message) {
            return message;
        }
    }
    return String(value);
}
/**
 * Rebuild a style-thrown value as a host-realm error.
 *
 * Only known metadata is copied: arbitrary own fields may still be
 * sandbox-realm objects, and cloning them here would defeat `cloneToHost`'s
 * data-only boundary. A plain non-Error object therefore keeps its message and
 * recognized metadata, not every property; richer author diagnostics belong in
 * `console.*`, which already reaches the sink.
 */
export function toHostGenerateError(reason) {
    const error = createBanyanRuntimeError(errorMessageOf(reason));
    if (reason && typeof reason === "object") {
        const source = reason;
        if (typeof source.name === "string" && source.name) {
            error.name = source.name;
        }
        if (isRuntimeCode(source.code)) {
            error.code = source.code;
        }
        if (typeof source.sourcePath === "string" && source.sourcePath) {
            error.sourcePath = source.sourcePath;
        }
        if ("cause" in source) {
            error.cause = source.cause;
        }
        inheritSandboxErrorMetadata(error, reason);
    }
    return error;
}
//# sourceMappingURL=runtimeErrors.js.map