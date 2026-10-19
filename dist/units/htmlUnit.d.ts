/**
 * Unit <-> restricted markup, used by the author utilities `htmlToUnit` and
 * `unitToHtml`.
 *
 * Rich-text editors store structured `RichText`, which is already a Unit. A
 * style that receives restricted markup from a parameter or an external source
 * can convert it here and never parses or concatenates HTML by hand.
 *
 * Casing is resolved while parsing: `<sc>` becomes Unicode small capitals and a
 * `nocase` span loses its case protection, because neither has a Unit form.
 */
import type { HtmlRootLike } from "../host.js";
import type { Unit } from "../types/unit.js";
export type ParseHtml = (html: string) => HtmlRootLike | null;
/**
 * Parse restricted markup into one Unit. Styles inside the markup become
 * `TextUnit` styles, `<sc>` becomes a small-caps text case and links become
 * `link()` units; the value can then be composed with the other builders.
 */
export declare function unitFromHtml(html: string, parse: ParseHtml): Unit;
/**
 * Serialize a Unit to restricted markup. Unlike generate output, markup inside
 * a text value is escaped rather than parsed: the caller is asking for the
 * markup form of this unit, not for a second round of HTML interpretation.
 */
export declare function unitToHtml(unit: Unit): string;
//# sourceMappingURL=htmlUnit.d.ts.map