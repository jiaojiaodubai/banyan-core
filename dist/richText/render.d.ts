/**
 * Default HTML rendering of compiled style output.
 *
 * This is a convenience implementation, not a contract: the style result is
 * structured data (`citations` / `bibliography`), and a host may render it into
 * visually equivalent but structurally richer HTML of its own. Snapshot tests
 * therefore only guard this implementation's own stability.
 */
import type { BibliographyLine } from "../types/style.js";
import type { RichText } from "../types/unit.js";
export type RenderRichTextToHtmlOptions = {
    includeLinks?: boolean;
};
export declare function renderRichTextToHtml(richText: RichText, options?: RenderRichTextToHtmlOptions): string;
export declare function renderRichTextToText(richText: RichText): string;
export declare function renderBibliographyLineToHtml(line: BibliographyLine): string;
//# sourceMappingURL=render.d.ts.map