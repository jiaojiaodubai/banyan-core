/**
 * Text-case algorithms used by the `text-case` unit.
 *
 * This is the core's own implementation, written against the reference
 * implementation in `zotero/utilities` (pinned for this repository at
 * `4051881`; Zotero ships the same module as the submodule
 * `chrome/content/zotero/xpcom/utilities/utilities.js`): `capitalizeTitle`,
 * `sentenceCase`, `capitalizeName` and `trimInternal` are covered case for case,
 * including the skip-word list, the HTML-tag gymnastics, `nocase` spans and
 * acronym handling. The differential test in `tests/textCaseReference.test.ts`
 * compares the core against that reference on fixed and generated input and
 * keeps watching for drift.
 *
 * It is deliberately not a dependency on that module:
 * - `utilities.js` reads a `Zotero` global (its `capitalizeTitle` touches
 *   `Zotero.Prefs` even when `force` is set, others read `Zotero.isFx`/`isNode`),
 *   so every host would have to fake a `Zotero` global; the core reads none;
 * - the module pulls the bundled XRegExp (~125 KB minified) for one `\pL`, and
 *   requires `jsdom` down a Node-only branch that a bundler cannot ignore.
 *
 * Deliberate differences from the reference:
 * - `capitalizeTitle` always converts, i.e. it behaves like the reference with
 *   `force = true`; the `capitalizeTitles` preference and `Zotero.locale` are
 *   host concerns, not core ones;
 * - `capitalizeName` uses native Unicode property escapes instead of XRegExp.
 *
 * These algorithms are **not** a host capability: every host runs exactly this
 * code, so a style renders the same text everywhere. A style that needs
 * different casing says so itself.
 */
export interface TextCaseAlgorithms {
    /** JOHN -> John, GUTIÉRREZ-ALBILLA -> Gutiérrez-Albilla */
    capitalizeName(input: string): string;
    /** "the war of the worlds" -> "The War of the Worlds" */
    capitalizeTitle(input: string): string;
    /** "THE WAR OF THE WORLDS" -> "The war of the worlds" */
    sentenceCase(input: string): string;
}
/** Collapses internal whitespace; upstream `Zotero.Utilities.trimInternal`. */
export declare function trimInternal(value: string): string;
/** The one and only text-case implementation; hosts cannot swap it out. */
export declare const textCase: TextCaseAlgorithms;
//# sourceMappingURL=textCase.d.ts.map