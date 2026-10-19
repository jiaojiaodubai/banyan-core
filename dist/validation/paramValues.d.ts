/**
 * Resolve declared parameters into stored and effective views.
 *
 * Callbacks run in declaration order. Each callback sees the effective values
 * already resolved for earlier parameters; later parameters still read their
 * stored/default value. That keeps the common "declare the dependency first"
 * style natural without an explicit dependency graph.
 *
 * A free value is also validated in this pass, so a host never runs style code
 * for a parameter itself; `generate()` turns validation off because it is
 * editor feedback, not part of rendering.
 */
import type { CitationContext, CitationParam, Cite, CiteParam, ParamValue, StyleOptionParam, StyleOptionValues } from "../types/style.js";
export type ParamMode = "free" | "hidden" | "forced";
/** Where one list cell's value came from. */
export type ListCellSource = "provided" | "default";
/** Outcome of a style-declared `validate` callback. */
export type ParamValidation = {
    valid: boolean;
    /** The validator's message, or the error it threw; omitted when it gave none. */
    message?: string;
    /**
     * Set for a validated list cell. `default` means the row supplied no usable
     * value for this field and the core filled the field's own default; the
     * result is a fact about the declaration, not an input the user can clear.
     * A host should not block the run on an invalid `default` cell.
     */
    source?: ListCellSource;
};
export type ParamState = {
    mode: ParamMode;
    value: ParamValue;
    /**
     * Set on a free `value` parameter that declares `validate`. Hidden and forced
     * parameters are never validated.
     */
    validation?: ParamValidation;
    /**
     * Set on a free `list` parameter: field id -> one result per row. Only fields
     * that declare `validate` appear.
     */
    fieldValidation?: Record<string, readonly ParamValidation[]>;
};
/** Options for resolving parameters; `validate` defaults to true. */
export type ParamResolveOptions = {
    /**
     * Run `validate` callbacks. Generate turns this off: validation is editor
     * feedback, not part of rendering.
     */
    validate?: boolean;
};
/**
 * Where a declared stored value came from. `repaired` means the caller supplied
 * a list the core could use only after dropping or patching rows; a host that
 * persists values should not present the patched result as the user's exact
 * choice without saying so.
 */
export type ParamValueSource = "provided" | "default" | "invalid" | "repaired";
export type ParamResolution = {
    /** Persisted choices, with declared defaults filled in. */
    storedValues: Record<string, ParamValue>;
    /**
     * Where each declared stored value came from. `invalid` means the caller
     * supplied something unusable and the core fell back to the default; a host
     * that persists values can warn or reset instead of treating the fallback as
     * the stored choice.
     */
    valueSources: Record<string, ParamValueSource>;
    /** What the style sees after applicable/forcedValue resolution. */
    effectiveValues: Record<string, ParamValue>;
    states: Record<string, ParamState>;
};
export type StyleOptionState = {
    storedValues: StyleOptionValues;
    valueSources: Record<string, ParamValueSource>;
    effectiveValues: StyleOptionValues;
    states: Record<string, ParamState>;
};
export type ResolvedCitation = ParamResolution & {
    citation: CitationContext;
};
export type ResolvedCite = ParamResolution & {
    cite: Cite;
    citation: CitationContext;
};
/**
 * Resolve document-wide style options.
 *
 * Unknown keys are dropped: these values belong to the style, not to the
 * document, so a key no current version declares has no meaning.
 */
export declare function resolveStyleOptionState(params: readonly StyleOptionParam[] | undefined, rawValues: unknown, resolveOptions?: ParamResolveOptions): StyleOptionState;
/** Resolve one citation's parameters. The returned citation carries effective params. */
export declare function resolveCitationParamValues(params: readonly CitationParam[] | undefined, citation: Readonly<CitationContext>, options: Readonly<StyleOptionValues>, resolveOptions?: ParamResolveOptions): ResolvedCitation;
/** Resolve one cite's parameters. Parent citation/options are already effective. */
export declare function resolveCiteParamValues(params: readonly CiteParam[] | undefined, cite: Readonly<Cite>, citation: Readonly<CitationContext>, options: Readonly<StyleOptionValues>, resolveOptions?: ParamResolveOptions): ResolvedCite;
/** Kept for callers that only need stored style options. */
export declare function resolveStoredStyleOptionValues(params: readonly StyleOptionParam[] | undefined, rawValues: unknown): StyleOptionValues;
//# sourceMappingURL=paramValues.d.ts.map