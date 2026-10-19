export declare const GENERATE_TIMEOUT_MS: number;
/**
 * What a run was doing, as a mechanical code a host can branch on without
 * reading messages: `style-load` / `style-contract` while the script is
 * evaluated and validated, `host-capability` for the host's side,
 * `generate` for the style's own code, and `generate-input` / `generate-output`
 * / `generate-timeout` for what `generate()` was given, returned or took.
 * Failures and findings use the same codes.
 */
declare const RUNTIME_CODES: readonly ["style-load", "style-contract", "host-capability", "generate", "generate-input", "generate-output", "generate-timeout"];
export type RuntimeCode = (typeof RUNTIME_CODES)[number];
export declare function isRuntimeCode(value: unknown): value is RuntimeCode;
export type BanyanRuntimeError = Error & {
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    cause?: unknown;
    code?: RuntimeCode;
    sourcePath?: string;
};
/**
 * Attribute a thrown value to a code, unless it already carries one: the core
 * sets codes where it throws, so this labels what a style threw on its own.
 */
export declare function withRuntimeCode<T>(value: T, runCode: RuntimeCode): T;
export type SandboxScriptError = BanyanRuntimeError & {
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    cause?: unknown;
};
export declare function inheritSandboxErrorMetadata(target: SandboxScriptError, source: unknown): void;
export declare function createBanyanRuntimeError(message: string, details?: Partial<BanyanRuntimeError>): BanyanRuntimeError;
export declare function createGenerateTimeoutError(styleName: string, timeoutMs?: number): BanyanRuntimeError;
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
export declare function withGenerateTimeout<T>(promise: Promise<T>, styleName: string, timeoutMs?: number): Promise<T>;
/**
 * Message of a thrown value without relying on `instanceof Error`: values from
 * another realm (a Gecko sandbox, `node:vm`) are not host-realm Errors even
 * when they carry `message` and `stack`.
 */
export declare function errorMessageOf(value: unknown): string;
/**
 * Rebuild a style-thrown value as a host-realm error.
 *
 * Only known metadata is copied: arbitrary own fields may still be
 * sandbox-realm objects, and cloning them here would defeat `cloneToHost`'s
 * data-only boundary. A plain non-Error object therefore keeps its message and
 * recognized metadata, not every property; richer author diagnostics belong in
 * `console.*`, which already reaches the sink.
 */
export declare function toHostGenerateError(reason: unknown): BanyanRuntimeError;
export {};
//# sourceMappingURL=runtimeErrors.d.ts.map