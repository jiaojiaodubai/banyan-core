/**
 * Shape checks and defaults for what a caller hands to `generate()`.
 *
 * Mapping Zotero, RDF or API data onto Banyan Items is the host's job (see
 * `dev/hostIntegration.md`, "Preparing style input"), and the core does not
 * validate item contents. It does validate the context array, because a
 * malformed one would otherwise surface much later as an unmatchable citation
 * id — a message that sends the author looking in the wrong place.
 *
 * The returned array is a copy with `params` defaulted to `{}`; a missing
 * `params` object would otherwise put `undefined` into the published
 * `Citation.source` shape and make the sandbox's safe view leak `undefined`.
 */
import type { CitationContext } from "../types/style.js";
export declare function normalizeCitationContexts(contexts: unknown): CitationContext[];
//# sourceMappingURL=contexts.d.ts.map