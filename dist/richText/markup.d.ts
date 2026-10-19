/**
 * Markup <-> `RichText` for hosts that edit rich-text parameters.
 *
 * Editors store structured `RichText`; this is the editor boundary, where the
 * host parses restricted markup and serializes it back with the same whitelist
 * (`b/strong/i/em/sup/sub/a/span/br/sc`, `a.href` protocol-checked).
 */
import type { HtmlRootLike } from "../host.js";
import type { RichText } from "../types/unit.js";
export type ParseHtml = (html: string) => HtmlRootLike | null;
/**
 * Parse restricted markup into `RichText`.
 *
 * Text without any whitelisted tag is treated as plain text (entities
 * decoded), so the parser is not called for the common case.
 */
export declare function richTextFromHtml(html: string, parse: ParseHtml): RichText;
//# sourceMappingURL=markup.d.ts.map