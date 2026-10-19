import type { StyleUtils } from "../types/styleUtils.js";
import type { ResolvedHost, SandboxContext } from "../host.js";
export type SandboxGlobal = Record<string, unknown>;
export declare function runtimeSafeRecord(object: Record<string, unknown>): Record<string, string>;
export declare function runtimeFormatDate<T>(value: string | number, callback: (parts: {
    year: string;
    month: string;
    day: string;
}) => T): T | string;
export declare const RUNTIME_UTILITY_NAMES: Array<keyof StyleUtils>;
/**
 * Serialized sources of one sandbox, in installation order. Exposed for the
 * contract test, which asserts that everything serialized here passes the
 * helper-ledger scan.
 */
export declare function buildSandboxRuntimeSources(): {
    helpersSource: string;
    utilitiesSource: string;
};
/**
 * Install the style utilities in a context: helper ledger first (the source
 * below is serialized from this bundle and may reference toolchain helpers),
 * then the utility table, with the host bridge visible only while it is being
 * read.
 */
export declare function installUtilities(context: SandboxContext, host: ResolvedHost): void;
//# sourceMappingURL=utilities.d.ts.map