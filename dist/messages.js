/**
 * Findings one style keeps. One additional entry may be the truncation notice
 * once the cap is reached, so `diagnostics.length` can be one larger.
 */
export const MAX_DIAGNOSTICS = 200;
/** Trace lines one run may emit before the rest is suppressed. */
export const MAX_TRACE_LINES_PER_RUN = 1_000;
/** Stable keys for detail JSON cannot represent, so bad values stay distinct. */
const unserializableDetailIds = new WeakMap();
let nextUnserializableDetailId = 0;
/** A finding's detail is part of its identity, but a bad value must not throw. */
function detailKey(detail) {
    if (!detail)
        return "";
    try {
        const serialized = JSON.stringify(detail);
        if (serialized !== undefined)
            return serialized;
    }
    catch {
        // Fall through to the identity-backed key.
    }
    let id = unserializableDetailIds.get(detail);
    if (id === undefined) {
        id = nextUnserializableDetailId;
        nextUnserializableDetailId += 1;
        unserializableDetailIds.set(detail, id);
    }
    return `unserializable:${id}`;
}
/**
 * Detail keys whose value is an object another scope may extend. A new nested
 * key must be added here, or the shallow spread below would replace it whole.
 */
const NESTED_DETAIL_KEYS = ["style", "declaration"];
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Merge two detail records, keeping the nested style/declaration objects. */
function mergeDetail(base, extra) {
    if (!base)
        return extra;
    if (!extra)
        return base;
    const merged = { ...base, ...extra };
    for (const key of NESTED_DETAIL_KEYS) {
        const baseValue = base[key];
        const extraValue = extra[key];
        if (isRecord(baseValue) && isRecord(extraValue)) {
            merged[key] = { ...baseValue, ...extraValue };
        }
    }
    return merged;
}
/** Attach declaration/group facts to every record a subsystem reports. */
export function withDetail(messages, detail) {
    return {
        get code() {
            return messages.code;
        },
        get diagnostics() {
            return messages.diagnostics;
        },
        report(input) {
            const merged = mergeDetail(detail, input.detail);
            messages.report(merged
                ? // Every `withDetail()` chain starts at a scope that supplies
                    // `declaration.export`; the inner patch may only narrow it.
                    { ...input, detail: merged }
                : input);
        },
        beginRun(runCode) {
            return messages.beginRun(runCode);
        },
    };
}
export function createStyleMessageReporter(sink, 
/**
 * Facts shared by every record, read when a record is reported. The core
 * uses it for the style identity once `INFO` has been copied to the host.
 */
baseDetail) {
    // One array for the instance's lifetime: `createStyle` hands this reference
    // over, so a caller that holds it sees each run's settlement.
    const diagnostics = [];
    const seen = new Set();
    let code = "style-load";
    // Code of the one truncation notice, or null while there is room again. It
    // follows the run that filled the cap, so a later run can report its own.
    let overflowNoticeCode = null;
    // Set when a run settles: a style's dangling async work can still report
    // afterwards, and those findings belong to the run that produced them, not to
    // a new load phase. The next `beginRun` clears it.
    let closedRunCode = null;
    // The load phase is a run too: its trace output is budgeted from the start,
    // and `beginRun` saves/restores this budget around a generate run.
    let traceBudget = {
        lines: 0,
        truncated: false,
    };
    /** The code a message is filed under right now. */
    const attributedCode = () => code === "style-load" && closedRunCode ? closedRunCode : code;
    const keyOf = (message) => `${message.severity}\u0000${message.source}\u0000${message.code}\u0000${message.message}\u0000${detailKey(message.detail)}`;
    /** Forget one code's findings: a new run replaces its own, not the load's. */
    const dropCode = (dropped) => {
        if (!diagnostics.some((message) => message.code === dropped)) {
            return;
        }
        for (let index = diagnostics.length - 1; index >= 0; index -= 1) {
            if (diagnostics[index]?.code === dropped) {
                diagnostics.splice(index, 1);
            }
        }
        if (overflowNoticeCode === dropped) {
            overflowNoticeCode = null;
        }
        seen.clear();
        for (const message of diagnostics) {
            seen.add(keyOf(message));
        }
    };
    /** One clear signal that findings were dropped, instead of a silent cut. */
    const reportOverflow = (noticeCode) => {
        if (overflowNoticeCode !== null) {
            return;
        }
        overflowNoticeCode = noticeCode;
        const notice = {
            severity: "warning",
            source: "core",
            code: noticeCode,
            message: `Findings exceeded ${MAX_DIAGNOSTICS}; further findings are suppressed.`,
        };
        diagnostics.push(notice);
        seen.add(keyOf(notice));
        emit(notice);
    };
    const emit = (message) => {
        try {
            sink?.(message);
        }
        catch {
            // A sink must not break the run it reports on.
        }
    };
    const report = (input) => {
        // `baseDetail()` and `input.detail` are both complete records; `mergeDetail`
        // accepts patches so inner scopes can narrow a declaration.
        const detail = mergeDetail(baseDetail?.(), input.detail);
        const record = detail ? { ...input, detail } : input;
        if (record.severity === "trace") {
            if (traceBudget.lines >= MAX_TRACE_LINES_PER_RUN) {
                if (!traceBudget.truncated) {
                    traceBudget.truncated = true;
                    report({
                        severity: "warning",
                        source: "core",
                        message: `Trace output exceeded ${MAX_TRACE_LINES_PER_RUN} lines; further lines are suppressed.`,
                    });
                }
                return;
            }
            traceBudget.lines += 1;
            emit({ ...record, code: attributedCode() });
            return;
        }
        const message = {
            ...record,
            severity: record.severity,
            code: attributedCode(),
        };
        const key = keyOf(message);
        if (!seen.has(key)) {
            if (diagnostics.length < MAX_DIAGNOSTICS) {
                seen.add(key);
                diagnostics.push(message);
            }
            else {
                reportOverflow(message.code);
            }
        }
        emit(message);
    };
    return {
        get code() {
            return attributedCode();
        },
        get diagnostics() {
            return diagnostics;
        },
        report,
        beginRun(runCode) {
            const previousCode = code;
            const previousBudget = traceBudget;
            code = runCode;
            closedRunCode = null;
            traceBudget = { lines: 0, truncated: false };
            dropCode(runCode);
            let restored = false;
            return () => {
                if (restored) {
                    return;
                }
                restored = true;
                code = previousCode;
                closedRunCode = runCode;
                traceBudget = previousBudget;
            };
        },
    };
}
//# sourceMappingURL=messages.js.map