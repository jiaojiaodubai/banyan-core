import { compileRichText } from "../units/compile.js";
import { renderRichTextToHtml } from "../richText/render.js";
import { splitTextUnitByMarkup } from "../output/markup.js";
function runToUnit(run) {
    const { value, smallCaps, noCase: _noCase, link, ...style } = run;
    let unit = { value, ...style };
    if (smallCaps) {
        // Small caps is content, not a visual mark: `text-case` resolves it to
        // Unicode small capitals, exactly like Zotero's rich-text normalization.
        unit = { type: "text-case", unit, form: "small-caps" };
    }
    if (link) {
        unit = { type: "link", unit, link };
    }
    return unit;
}
/**
 * Parse restricted markup into one Unit. Styles inside the markup become
 * `TextUnit` styles, `<sc>` becomes a small-caps text case and links become
 * `link()` units; the value can then be composed with the other builders.
 */
export function unitFromHtml(html, parse) {
    const runs = splitTextUnitByMarkup({ value: typeof html === "string" ? html : "" }, parse);
    return { type: "group", units: runs.map(runToUnit) };
}
/**
 * Serialize a Unit to restricted markup. Unlike generate output, markup inside
 * a text value is escaped rather than parsed: the caller is asking for the
 * markup form of this unit, not for a second round of HTML interpretation.
 */
export function unitToHtml(unit) {
    return renderRichTextToHtml(compileRichText(unit));
}
//# sourceMappingURL=htmlUnit.js.map