/**
 * Markup splitting for generate output.
 *
 * The core never parses HTML itself: the host's `parseHtml` capability returns
 * a node-like root, and this module turns it into styled runs. Keeping it apart
 * from the Unit compiler makes the boundary explicit — everything here runs
 * only when a text value carries markup.
 *
 * `units/htmlUnit` and `richText/markup` also reuse this splitter because they
 * need the same restricted-markup semantics. The dependency is acyclic and the
 * module remains under the `output/*` public subpath; moving it to `units/` or
 * `richText/` would only trade one cross-directory import for another, so it
 * stays here as the output-side markup bridge.
 */
import type { HtmlRootLike } from "../host.js";
import type { TextUnit } from "../types/unit.js";
import { type CompiledTextUnit } from "../units/compile.js";
/**
 * Tags the core knows how to normalize.
 *
 * A value with no *complete, paired* tag stays literal text: prose like
 * `1 <b and 2 > 1` or `a<b` must not lose the text after `<b` just because the
 * parser would accept it as a start tag. A void (`<br>`) tag anywhere is enough
 * on its own, and so is a self-closing tag that makes up the whole value. A
 * non-void self-closing tag inside prose (`Use <b/> here`) stays literal:
 * HTML would treat it as a start tag and swallow the following text, which is
 * never what a sentence about markup means. Every other tag opens parsing only
 * when a closing tag is present too. Once parsing starts, unknown elements are
 * skipped as elements while their text content is kept, so
 * `a <div>b</div> <b>c</b>` becomes `a b c` rather than dropping the paragraph.
 */
export declare function looksLikeMarkup(text: string): boolean;
/**
 * Decode the entities the core can resolve without a parser. Unknown named
 * entities stay literal; a value that also carries a complete tag is handed to
 * the host parser, which decodes the full set.
 */
export declare function decodeEntities(text: string): string;
/**
 * Split one text value into styled runs.
 *
 * `parse` is the host's `parseHtml` capability; it is called only for text that
 * looks like markup. A host that cannot produce an element-like root is a
 * contract failure, not "leave the tags in place".
 */
export declare function splitTextUnitByMarkup(base: TextUnit, parse: (html: string) => HtmlRootLike | null): CompiledTextUnit[];
//# sourceMappingURL=markup.d.ts.map