/** `extra` key holding the records: one JSON object per line. */
export const CREATORS_EXT_KEY = "creators-ext";
/** Extension fields, in the window's field order. */
export const CREATOR_EXT_FIELDS = [
    "role",
    "nationality",
    "dynasty",
];
export function parseCreatorsExt(extra) {
    const value = extra?.[CREATORS_EXT_KEY];
    const lines = typeof value === "string" ? [value] : Array.isArray(value) ? value : [];
    const records = [];
    const issues = [];
    for (const [lineIndex, line] of lines.entries()) {
        let parsed;
        try {
            parsed = JSON.parse(line);
        }
        catch (error) {
            // Malformed lines are expected: `extra` is user-editable and older
            // writers may have used another format.
            issues.push({
                lineIndex,
                message: error instanceof Error ? error.message : String(error),
            });
            continue;
        }
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            issues.push({ lineIndex, message: "Record must be a JSON object" });
            continue;
        }
        const record = parsed;
        const validCreatorType = record.creatorType === undefined ||
            typeof record.creatorType === "string";
        const validFieldMode = record.fieldMode === undefined ||
            record.fieldMode === 0 ||
            record.fieldMode === 1;
        const validIndex = record.index === undefined ||
            (typeof record.index === "number" &&
                Number.isInteger(record.index) &&
                record.index >= 0);
        const validNames = ["firstName", "lastName", "name"].every((key) => record[key] === undefined || typeof record[key] === "string");
        const validExtensions = CREATOR_EXT_FIELDS.every((key) => record[key] === undefined || typeof record[key] === "string");
        const hasExtension = CREATOR_EXT_FIELDS.some((key) => typeof record[key] === "string");
        if (!validCreatorType ||
            !validFieldMode ||
            !validIndex ||
            !validNames ||
            !validExtensions ||
            !hasExtension) {
            issues.push({
                lineIndex,
                message: "Record does not match the creators-ext schema",
            });
            continue;
        }
        // Identity must be complete: a lone name part cannot identify anyone, and
        // carrying both forms is contradictory. Reject rather than match.
        const hasSingleName = typeof record.name === "string";
        const hasBothNameParts = typeof record.firstName === "string" &&
            typeof record.lastName === "string";
        const hasPartialNameParts = (record.firstName !== undefined || record.lastName !== undefined) &&
            !hasBothNameParts;
        const hasConflictingIdentity = hasSingleName &&
            (record.firstName !== undefined || record.lastName !== undefined);
        if (hasPartialNameParts || hasConflictingIdentity) {
            issues.push({
                lineIndex,
                message: "Record must identify its creator by `name`, or by both `firstName` and `lastName`",
            });
            continue;
        }
        records.push({
            lineIndex,
            record: record,
        });
    }
    return { records, issues };
}
/**
 * Identity match requires the same creator type and the same name mode, so a
 * stale record cannot capture an unrelated creator. The window's reload path
 * carries values over by the same rule.
 */
export function creatorMatchesExtIdentity(creator, record) {
    if (!record.creatorType || creator.creatorType !== record.creatorType) {
        return false;
    }
    if (typeof record.name === "string") {
        return "name" in creator && creator.name === record.name;
    }
    if (typeof record.firstName === "string" &&
        typeof record.lastName === "string") {
        return ("firstName" in creator &&
            creator.firstName === record.firstName &&
            creator.lastName === record.lastName);
    }
    return false;
}
function createCreatorExtFields(record) {
    const fields = {};
    for (const key of CREATOR_EXT_FIELDS) {
        const value = record[key];
        if (typeof value === "string") {
            fields[key] = value;
        }
    }
    return fields;
}
/** Whether the record carries a complete name identity (see `parseCreatorsExt`). */
function hasNameIdentity(record) {
    return (typeof record.name === "string" ||
        (typeof record.firstName === "string" &&
            typeof record.lastName === "string"));
}
/**
 * Creator to fall back to by position, or undefined: a record that claims an
 * `index` is taken at its word, one that never had any gets the first free
 * creator of the recorded type.
 */
function findCreatorByPosition(record, creators, matched) {
    const typeMatches = (creator) => !record.creatorType || creator.creatorType === record.creatorType;
    if (typeof record.index === "number") {
        const creator = creators[record.index];
        return creator && !matched.has(record.index) && typeMatches(creator)
            ? record.index
            : undefined;
    }
    const index = creators.findIndex((creator, position) => !matched.has(position) && typeMatches(creator));
    return index < 0 ? undefined : index;
}
/**
 * Match records to creators by identity, then by the record's `index`, then by
 * row order; the last two apply only while the recorded positions still hold,
 * so a stale record stays unmatched instead of binding to whoever moved into
 * its slot.
 */
export function reconcileCreatorsExt(records, creators) {
    const bindings = new Map();
    const issues = [];
    const matched = new Set();
    const matchedRecordLineIndexes = new Set();
    const unresolved = [];
    let positionsTrusted = true;
    // Identity first, so the position fallbacks cannot take a creator that some
    // record still claims by name.
    for (const { lineIndex, record } of records) {
        const identity = creators
            .map((creator, index) => ({ creator, index }))
            .filter(({ creator, index }) => !matched.has(index) && creatorMatchesExtIdentity(creator, record));
        let creatorIndex;
        if (identity.length === 1) {
            creatorIndex = identity[0]?.index;
        }
        else if (identity.length > 1) {
            const indexed = identity.find(({ index }) => index === record.index);
            if (indexed) {
                creatorIndex = indexed.index;
            }
            else {
                issues.push(`Record ${lineIndex + 1} has an ambiguous creator identity`);
                continue;
            }
        }
        if (creatorIndex === undefined) {
            unresolved.push({ lineIndex, record });
            continue;
        }
        if (typeof record.index === "number" && record.index !== creatorIndex) {
            positionsTrusted = false;
        }
        matched.add(creatorIndex);
        matchedRecordLineIndexes.add(lineIndex);
        bindings.set(creatorIndex, createCreatorExtFields(record));
    }
    for (const { lineIndex, record } of unresolved) {
        // Row order is only evidence for a record that claims nothing at all; a
        // failed identity must not silently become a position guess.
        const hasEvidence = typeof record.index === "number" || !hasNameIdentity(record);
        const creatorIndex = positionsTrusted && hasEvidence
            ? findCreatorByPosition(record, creators, matched)
            : undefined;
        if (creatorIndex === undefined) {
            continue;
        }
        matched.add(creatorIndex);
        matchedRecordLineIndexes.add(lineIndex);
        bindings.set(creatorIndex, createCreatorExtFields(record));
    }
    if (!positionsTrusted) {
        issues.push("Recorded creator positions no longer match the item, so position fallback was skipped");
    }
    for (const { lineIndex } of unresolved) {
        if (!matchedRecordLineIndexes.has(lineIndex)) {
            issues.push(`Record ${lineIndex + 1} could not be matched to a creator`);
        }
    }
    return {
        bindings,
        issues,
        unmatchedRecordLineIndexes: records
            .filter(({ lineIndex }) => !matchedRecordLineIndexes.has(lineIndex))
            .map(({ lineIndex }) => lineIndex),
    };
}
/**
 * Attach the parsed extension fields to the creators they belong to, reporting
 * unusable records through `log` (diagnostics only; the item stays usable).
 */
export function bindCreatorsExt(item, log = () => { }) {
    const parsed = parseCreatorsExt(item.extra);
    const reconciled = reconcileCreatorsExt(parsed.records, item.creators);
    for (const issue of parsed.issues) {
        log(`Invalid creators-ext record ${issue.lineIndex + 1}: ${issue.message}`);
    }
    for (const issue of reconciled.issues) {
        log(`Invalid creators-ext data: ${issue}`);
    }
    for (const [index, fields] of reconciled.bindings) {
        const creator = item.creators[index];
        if (creator) {
            Object.assign(creator, fields);
        }
    }
}
//# sourceMappingURL=creatorsExt.js.map