import { escapeAttribute, escapeHtml } from "./html.js";
import { getRichTextSegments } from "./richText.js";
export function renderRichTextToHtml(richText, options = {}) {
    if (options.includeLinks === false) {
        return getRichTextSegments(richText)
            .map((unit) => renderUnitVisualToHtml(unit))
            .join("");
    }
    const out = [];
    let currentLink = "";
    let currentLinkParts = [];
    const flushLink = () => {
        if (!currentLink) {
            return;
        }
        out.push(`<a href="${escapeAttribute(currentLink)}">${currentLinkParts.join("")}</a>`);
        currentLink = "";
        currentLinkParts = [];
    };
    for (const unit of getRichTextSegments(richText)) {
        const html = renderUnitVisualToHtml(unit);
        // Segments come back with normalized marks, so the link is already
        // protocol-checked; rendering must not re-implement that policy.
        const link = unit.link;
        if (!link) {
            flushLink();
            out.push(html);
            continue;
        }
        if (currentLink && currentLink !== link) {
            flushLink();
        }
        currentLink = link;
        currentLinkParts.push(html);
    }
    flushLink();
    return out.join("");
}
export function renderRichTextToText(richText) {
    return richText.text;
}
export function renderBibliographyLineToHtml(line) {
    const inner = renderRichTextToHtml(line.content);
    if (line.type === "bibliography-title") {
        return `<h1>${inner}</h1>`;
    }
    return `<p>${inner}</p>`;
}
function renderUnitVisualToHtml(unit) {
    // A line break is a `<br>`: a raw newline in HTML text is collapsed by the
    // browser, which would silently drop the break the model carries.
    let text = escapeHtml(unit.value).replace(/\n/g, "<br>");
    if (unit.bold)
        text = `<strong>${text}</strong>`;
    if (unit.italic)
        text = `<em>${text}</em>`;
    if (unit.script === "superscript")
        text = `<sup>${text}</sup>`;
    if (unit.script === "subscript")
        text = `<sub>${text}</sub>`;
    const style = [];
    if (unit.color)
        style.push(`color:${escapeAttribute(unit.color)}`);
    if (unit.backgroundColor) {
        style.push(`background-color:${escapeAttribute(unit.backgroundColor)}`);
    }
    if (style.length)
        text = `<span style="${style.join(";")}">${text}</span>`;
    return text;
}
//# sourceMappingURL=render.js.map