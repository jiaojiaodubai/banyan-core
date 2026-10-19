/**
 * Transpile-helper ledger.
 *
 * Function bodies that reach the sandbox are serialized from the *host* bundle
 * (`Function.prototype.toString`), so a toolchain that rewrites functions can
 * leave references to its own helpers behind: esbuild emits `__name` when it
 * keeps names, and tsx enables that. The sandbox has no such helpers, and a
 * missing one fails with a bare `ReferenceError` deep inside style execution.
 *
 * The core owns both halves of the answer:
 * - a fixed ledger, installed idempotently before any generated source runs;
 * - a generation-time scan of every serialized fragment, so an unknown helper
 *   fails loudly at creation time with the helper's name in the message.
 *
 * The ledger carries what the toolchains actually leave behind, not everything
 * a bundler can emit: object spread, class fields and async/await are native at
 * the targets in use (`firefox115`, ES2022), CJS interop helpers live at module
 * scope and never inside a serialized function body, and `keepNames` is only
 * enabled by the toolchains that opt into it. `dev/node-host/helperLedger.test.ts`
 * measures the generated sources against a real style build, so an entry cannot
 * linger as decoration and a new one cannot go unnoticed: the scan below fails
 * loudly and names it.
 */
/** Identifiers a generated fragment may reference without defining them. */
export declare function transpileHelperNames(): string[];
/**
 * Ledger bodies, keyed by helper name.
 *
 * Exposed for the tests that check the ledger against what the toolchain emits,
 * so they read the same source the sandbox installs.
 */
export declare function transpileHelperBodies(): Readonly<Record<string, string>>;
/**
 * Source that installs the ledger, guarded so repeated evaluation is a no-op
 * and the helpers stay invisible to style authors (non-enumerable, like the
 * utility table itself).
 */
export declare function buildTranspileHelperSource(): string;
/**
 * Serialize one runtime function as sandbox source under a fixed binding name.
 *
 * The function runs on the host (`Function.prototype.toString`), so the result
 * must pass the ledger scan before it is evaluated; scanning here rather than
 * at each call site means no generated fragment can skip it. A function whose
 * own name differs from the binding keeps that name as an alias, so stack
 * traces and self-references stay readable.
 */
export declare function serializeRuntimeFunction(bindingName: string, fn: (...args: never[]) => unknown): string;
/**
 * Fail fast when a generated fragment references a helper the ledger does not
 * carry, naming both the helper and where to register it.
 */
export declare function assertKnownTranspileHelpers(source: string, fragmentName: string): void;
//# sourceMappingURL=transpileHelpers.d.ts.map