/**
 * HTML named character references the core can decode without a parser.
 *
 * The table covers the HTML 4 Latin-1 set plus common punctuation and symbol
 * references, which is what plain prose typically uses.
 * Names are case-sensitive, as in HTML: `&Eacute;` and `&eacute;` are different
 * characters. HTML5-only names stay literal when no parser is involved; a value
 * that also carries a complete tag is handed to the host parser, which decodes
 * the full set.
 */
export declare const NAMED_ENTITIES: Readonly<Record<string, string>>;
//# sourceMappingURL=entities.d.ts.map