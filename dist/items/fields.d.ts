/**
 * Field-level helpers on Banyan items: base-field aliases, field/creator
 * display text and the item type guard.
 *
 * The field tables come from the core's own Zotero schema data
 * (`src/schema/zoteroSchema.ts`), so every host resolves type-specific fields
 * the same way.
 */
import type { Item } from "../types/item.js";
import type { ScriptItem } from "../types/style.js";
/**
 * Fields a citation never needs: dropped from items and left out of the
 * author-facing `Item` type, which `scripts/genZoteroSchema.ts` generates.
 *
 * All but `abstractNote` are `Zotero.Item.toJSON()` record metadata, not items
 * of author data — `version` above all is the *record* version (a number that
 * changes on sync), never a field: the Software item type's "Version" field is
 * `versionNumber`, so excluding `version` leaves it untouched. `abstractNote`
 * is a real field on nearly every type; it is dropped because abstract-length
 * text would weigh on what a host stores and on the data crossing to its UI,
 * and no style needs it. A tool that lints style code can warn when a style
 * reads either kind by mistake.
 */
export declare const EXCLUDED_FIELDS: Set<string>;
/** Drop the fields a citation never needs, in place. */
export declare function stripExcludedFields(json: unknown): void;
/**
 * Copy type-specific fields onto their base-field names (e.g. `bookTitle` ->
 * `title`), so styles may read the base field. Existing base values win, and
 * fields the schema does not alias for this item type stay untouched.
 */
export declare function assignBaseFieldAliases(itemType: string, record: Record<string, unknown>): void;
/**
 * The fields that store `base` on this item type, sorted.
 *
 * The inverse of `assignBaseFieldAliases`: a host holding a value by its base
 * name (an RDF predicate, a CSL variable) needs the name Zotero actually stores
 * it under — `bookTitle` on a `bookSection`, `publicationTitle` on a
 * `journalArticle` (which is absent from the alias map because it is the base
 * name itself, so callers must fall back to `base`).
 */
export declare function specificFieldsForBase(itemType: string, base: string): string[];
/**
 * The field a base name means on this item type: the type-specific field when
 * the schema aliases one, the base name itself otherwise.
 */
export declare function fieldForBase(itemType: string, base: string): string;
export declare function isBanyanItem(value: unknown): value is Item | ScriptItem;
export declare function getItemFieldText(item: Item, field: string): string;
export declare function getItemFirstCreatorName(item: Item): string;
/**
 * User-friendly display label for an item, matching the citation dialog
 * bubble: first creator's name plus date when available, falling back to
 * the item title (or "Untitled").
 */
export declare function getItemDisplayLabel(item: Item): string;
//# sourceMappingURL=fields.d.ts.map