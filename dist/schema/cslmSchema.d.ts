/** Item types CSL-M adds to CSL (`type` values citeproc-js accepts). */
export declare const CSL_M_ONLY_ITEM_TYPES: ReadonlySet<string>;
/** Every CSL-M-only variable, regardless of group. */
export declare const CSL_M_ONLY_VARIABLES: ReadonlySet<string>;
/** Every item type in the complete CSL-M schema. */
export declare const CSL_M_ITEM_TYPES: ReadonlySet<string>;
/** Date variables in the complete CSL-M schema. */
export declare const CSL_M_DATE_VARIABLES: ReadonlySet<string>;
/** Name variables in the complete CSL-M schema. */
export declare const CSL_M_NAME_VARIABLES: ReadonlySet<string>;
/** Number variables in the complete CSL-M schema. */
export declare const CSL_M_NUMBER_VARIABLES: ReadonlySet<string>;
/** Title variables in the complete CSL-M schema. */
export declare const CSL_M_TITLE_VARIABLES: ReadonlySet<string>;
/** Plain string variables in the complete CSL-M schema. */
export declare const CSL_M_STRING_VARIABLES: ReadonlySet<string>;
/** Every variable in the complete CSL-M schema. */
export declare const CSL_M_VARIABLES: ReadonlySet<string>;
/** A schema model shaped like `CSL_SCHEMA`. */
export interface CslMSchemaModel {
    /** Every CSL-M item type (`type` values citeproc-js accepts). */
    readonly itemTypes: readonly string[];
    /** CSL-M variables by group: `dates`, `names`, `numbers`, `titles`, `strings`. */
    readonly variables: Readonly<Record<string, readonly string[]>>;
    /** Every CSL-M variable, regardless of group. */
    readonly variablesAll: readonly string[];
}
/**
 * The complete CSL-M schema: CSL plus the CSL-M additions and modifications.
 *
 * This is curated rather than generated: the CSL-M schema is defined by
 * citeproc-js, not by the official `csl-schema` package. The `CSL_M_ONLY_*`
 * tables above are the delta when a caller needs CSL-M-specific names.
 */
export declare const CSL_M_SCHEMA: CslMSchemaModel;
//# sourceMappingURL=cslmSchema.d.ts.map