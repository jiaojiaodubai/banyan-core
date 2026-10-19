/**
 * The readonly `contexts` view.
 *
 * Style scripts must never see `undefined` for a missing field and must never
 * write into the data they are handed, so the guard runs *inside* the sandbox:
 * the source below is generated from this file and evaluated there.
 */
import type { SandboxContext } from "../host.js";
/** Install the view builder in the context; call once per context. */
export declare function installContextViewRuntime(context: SandboxContext): void;
/** Install the readonly `contexts` global for one `generate()` call. */
export declare function installSandboxContexts(contexts: unknown, context: SandboxContext): void;
/** Install the readonly `options` global for one `generate()` call. */
export declare function installSandboxOptions(options: unknown, context: SandboxContext): void;
//# sourceMappingURL=contextView.d.ts.map