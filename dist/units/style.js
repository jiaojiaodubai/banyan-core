import { sanitizeCssColor } from "../richText/html.js";
export function sanitizeRenderStyle(input) {
    if (!input || typeof input !== "object") {
        return {};
    }
    const raw = input;
    const out = {};
    if (typeof raw.italic === "boolean")
        out.italic = raw.italic;
    if (typeof raw.bold === "boolean")
        out.bold = raw.bold;
    if (raw.script === "superscript" || raw.script === "subscript") {
        out.script = raw.script;
    }
    if (typeof raw.color === "string") {
        const color = sanitizeCssColor(raw.color);
        if (color)
            out.color = color;
    }
    if (typeof raw.backgroundColor === "string") {
        const backgroundColor = sanitizeCssColor(raw.backgroundColor);
        if (backgroundColor)
            out.backgroundColor = backgroundColor;
    }
    return out;
}
//# sourceMappingURL=style.js.map