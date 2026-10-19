/**
 * Language tag normalization and matching.
 *
 * Two normalizers exist on purpose: the strict one (`normalizeLanguageCode`)
 * validates dialog input against CLDR and rejects tags with no data, while the
 * lenient one (`normalizeStyleLanguageTag`) never rejects, because a style may
 * query any tag a user typed. Matching prefers an exact canonical tag and falls
 * back to the prefix rule (`zh` <-> `zh-CN`).
 */
export type StyleLanguageCandidate<T> = {
    item: T;
    /** Leniently normalized tag; never empty (items without one are dropped). */
    language: string;
    isSource?: boolean;
};
/** Strict BCP 47 for dialog input; memoized, rejects tags with no data. */
export declare function normalizeLanguageCode(value: unknown): string | null;
/** Lenient BCP 47 for lookups; never rejects a tag, unlike the strict one. */
export declare function normalizeStyleLanguageTag(value: unknown): string;
/**
 * Best match among already-normalized candidates: exact canonical tag first,
 * then the prefix rule (`zh` ↔ `zh-CN`); ties break by source, tag, ID.
 */
export declare function findLanguageMatch<T extends {
    id: string;
}>(candidates: readonly StyleLanguageCandidate<T>[], preference: string): T | null;
//# sourceMappingURL=language.d.ts.map