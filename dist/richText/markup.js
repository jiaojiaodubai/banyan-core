import { compileRichText } from "../units/compile.js";
import { decodeEntities, looksLikeMarkup, splitTextUnitByMarkup, } from "../output/markup.js";
/**
 * Parse restricted markup into `RichText`.
 *
 * Text without any whitelisted tag is treated as plain text (entities
 * decoded), so the parser is not called for the common case.
 */
export function richTextFromHtml(html, parse) {
    const source = typeof html === "string" ? html : "";
    if (!looksLikeMarkup(source)) {
        return { text: decodeEntities(source), marks: [] };
    }
    return compileRichText({ value: source }, { splitText: (base) => splitTextUnitByMarkup(base, parse) });
}
//# sourceMappingURL=markup.js.map