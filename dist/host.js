import { createBanyanRuntimeError } from "./sandbox/runtimeErrors.js";
/** Keys of the required set, kept in step with the interface by this type. */
const REQUIRED_CAPABILITY_KEYS = {
    parseHtml: true,
    readFile: true,
    resolveMultilingualItems: true,
};
/** Capabilities a conforming host has to provide (see `dev/hostIntegration.md`). */
export const REQUIRED_HOST_CAPABILITIES = Object.keys(REQUIRED_CAPABILITY_KEYS);
/**
 * Report every missing required capability at once.
 *
 * `createStyle` deliberately does not preflight capabilities: a missing one is
 * reported when the style actually needs it, which keeps the check free for a
 * complete host (`dev/hostIntegration.md`, "Capabilities"). A host that would
 * rather assert completeness while assembling — `assertReady` is the natural
 * place — calls this instead of listing the capabilities itself.
 */
export function assertHostCapabilities(capabilities) {
    const missing = REQUIRED_HOST_CAPABILITIES.filter((name) => !capabilities?.[name]);
    if (!missing.length) {
        return;
    }
    const listed = missing.map((name) => `"${name}"`).join(", ");
    throw createBanyanRuntimeError(`The host does not provide the ${listed} capabilit${missing.length === 1 ? "y" : "ies"}.`, { code: "host-capability" });
}
/**
 * Take a capability the core cannot do without.
 *
 * A missing capability has no acceptable substitute — approximating it would
 * make the same style render differently per host — so it fails here, naming
 * what the host has to provide.
 */
export function requireCapability(capability, message) {
    if (!capability) {
        throw createBanyanRuntimeError(message, {
            code: "host-capability",
        });
    }
    return capability;
}
/**
 * Values a host bridges in, or that a style declares, reach the core as
 * `unknown`. A callable one stays callable — and stays typed, because
 * `typeof value === "function"` narrows to `Function`, which no signature
 * accepts.
 */
export function isSandboxCallable(value) {
    return typeof value === "function";
}
const EMPTY_CAPABILITIES = {};
export function resolveHost(host) {
    return {
        runtime: host.runtime,
        // Read through on every access instead of snapshotting: a binding may build
        // the host first and fill capabilities in later (before the first call, as
        // `StyleHost` requires), and that has to work whether it mutates the
        // capabilities object or replaces it.
        get capabilities() {
            return host.capabilities ?? EMPTY_CAPABILITIES;
        },
    };
}
//# sourceMappingURL=host.js.map