/** Whether `name` is an item type a style can see. */
export declare function isZoteroItemType(name: string): boolean;
/** Whether `name` is a Zotero creator type. */
export declare function isZoteroCreatorType(name: string): boolean;
/**
 * Whether `name` is a Zotero field on any item type.
 *
 * Note that `extra` and `abstractNote` are real fields too, so a host that
 * decides "write to `extra` when this is not a field" must special-case `extra`
 * itself.
 */
export declare function isZoteroField(name: string): boolean;
/** The fields Zotero stores on `itemType`, or `[]` for an unknown type. */
export declare function itemTypeFieldsOf(itemType: string): readonly string[];
/** Whether Zotero stores `name` on `itemType` (an exact field name). */
export declare function isZoteroItemField(itemType: string, name: string): boolean;
/**
 * The field `name` means on `itemType`: the type-specific field when `name` is
 * a base field the type aliases (`publicationTitle` -> `bookTitle`), the name
 * itself when the type stores it directly, `null` when the type cannot store it.
 */
export declare function resolveZoteroField(itemType: string, name: string): string | null;
/** Whether `name` is a CSL item type (`type` values in CSL data). */
export declare function isCslItemType(name: string): boolean;
/** Whether `name` is a variable official CSL declares. */
export declare function isCslVariable(name: string): boolean;
/** Whether `name` is in the complete CSL-M item type schema. */
export declare function isCslMItemType(name: string): boolean;
/** Whether `name` is in the complete CSL-M variable schema. */
export declare function isCslMVariable(name: string): boolean;
/** Whether `name` is a CSL-M item type absent from official CSL. */
export declare function isCslMOnlyItemType(name: string): boolean;
/** Whether `name` is a CSL-M variable absent from official CSL. */
export declare function isCslMOnlyVariable(name: string): boolean;
//# sourceMappingURL=queries.d.ts.map