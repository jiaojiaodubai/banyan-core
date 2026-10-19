import type { BibliographyLine, Citation, CitationContext, Style } from "../types/style.js";
import { type HtmlRootLike } from "../host.js";
/**
 * Validate and normalize the raw output of `generate()`.
 *
 * The result shapes are the author contract; the HTML parser is the only thing
 * the core cannot supply itself, so it arrives as a getter and is resolved on
 * use (a host may attach the capability after the style was created). Text-case
 * algorithms are the core's own, never a host choice.
 */
export type ParseHtmlProvider = () => ParseHtml | undefined;
type ParseHtml = (html: string) => HtmlRootLike | null;
export type NormalizedGenerateResult = {
    citations: Citation[];
    bibliography: BibliographyLine[];
};
export declare function createGenerateOutputNormalizer(getParseHtml?: ParseHtmlProvider): (raw: unknown, contexts: CitationContext[], styleName: string, citationType: Style["INFO"]["citationType"]) => NormalizedGenerateResult;
export declare function normalizeStyleCitationType(input: unknown, styleName: string): Style["INFO"]["citationType"];
export {};
//# sourceMappingURL=normalizeGenerateResult.d.ts.map