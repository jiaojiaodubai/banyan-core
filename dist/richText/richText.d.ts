import type { RichText, TextUnit } from "../types/unit.js";
/** Guards one `RichText` value against a synchronous, unbounded mark walk. */
export declare const MAX_RICH_TEXT_MARKS = 10000;
/** Guards mark values (links, colors) against absurd payloads. */
export declare const MAX_MARK_VALUE_LENGTH = 2000;
export type RichTextLike = {
    text: string;
    marks: readonly unknown[];
};
/**
 * Structural test for a value that claims to be `RichText`. Marks are not
 * validated here; `normalizeRichText` is the authority for that.
 */
export declare function isRichTextLike(value: unknown): value is RichTextLike;
export type RichTextRun = TextUnit & {
    link?: string;
};
export type RichTextSegment = TextUnit & {
    start: number;
    end: number;
    link?: string;
};
export declare function emptyRichText(): RichText;
export declare function textToRichText(text: string): RichText;
export declare function richTextFromRuns(units: readonly RichTextRun[]): RichText;
export declare function getRichTextSegments(input: RichTextLike): RichTextSegment[];
export declare function normalizeRichText(input: unknown): RichText | null;
//# sourceMappingURL=richText.d.ts.map