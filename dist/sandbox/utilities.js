import { requireCapability } from "../host.js";
import { isBanyanItem } from "../items/fields.js";
import { findLanguageMatch, normalizeStyleLanguageTag, } from "../items/language.js";
import { sanitizeLink } from "../richText/html.js";
import { normalizeTextValue, plainText as plainUnitText } from "../units/unit.js";
import { toHostUnit } from "../units/normalize.js";
import { unitFromHtml, unitToHtml as unitToMarkup } from "../units/htmlUnit.js";
import { errorMessageOf } from "./runtimeErrors.js";
import { buildTranspileHelperSource, serializeRuntimeFunction, } from "./transpileHelpers.js";
function capabilityUnavailableMessage(capability, utilityName) {
    return `The host does not provide the "${capability}" capability; ${utilityName} is unavailable.`;
}
/**
 * Report a missing capability before the handler runs.
 *
 * A utility that quietly works around an absent capability would make the same
 * style render differently per host, so the requirement is declared next to the
 * utility and enforced here — no handler has to remember to check, and none can
 * substitute a different result.
 */
function guardMissingCapability(handler, host, capability, utilityName) {
    return (...args) => {
        requireCapability(host.capabilities[capability], capabilityUnavailableMessage(capability, utilityName));
        return handler(...args);
    };
}
function runtimeSafeString(value) {
    switch (typeof value) {
        case "string":
            return value;
        case "number":
        case "boolean":
            return String(value);
        default:
            return "";
    }
}
function hostUuid() {
    return crypto.randomUUID();
}
export function runtimeSafeRecord(object) {
    const target = object && typeof object === "object" ? object : {};
    return new Proxy(target, {
        set() {
            // The docs promise that writes are ignored, and style code is strict
            // mode: returning false would throw instead of ignoring the write.
            return true;
        },
        defineProperty() {
            return true;
        },
        deleteProperty() {
            // Same promise as `set`: deleting a key from the readonly view is a
            // write, and strict mode would throw if the trap returned false.
            return true;
        },
        setPrototypeOf() {
            return false;
        },
        preventExtensions() {
            return false;
        },
        get(currentTarget, prop) {
            if (typeof prop !== "string") {
                return "";
            }
            try {
                return runtimeSafeString(currentTarget[prop]);
            }
            catch {
                return "";
            }
        },
    });
}
function runtimeGetExtraValue(item, key, mode) {
    const source = item && typeof item === "object"
        ? item.extra
        : undefined;
    const extra = source && typeof source === "object"
        ? source
        : {};
    const value = extra[runtimeSafeString(key)];
    if (mode === "array") {
        // The `"array"` mode exposes repeated `extra` keys: a community convention
        // Banyan reads but never writes.
        if (value === undefined) {
            return [];
        }
        return Array.isArray(value)
            ? value.map(runtimeSafeString)
            : [runtimeSafeString(value)];
    }
    if (Array.isArray(value)) {
        return runtimeSafeString(value[0]);
    }
    return runtimeSafeString(value);
}
export function runtimeFormatDate(value, callback) {
    if (typeof value === "number") {
        const date = new Date(value);
        if (Number.isNaN(date.getTime()))
            return String(value);
        return callback({
            year: String(date.getUTCFullYear()),
            month: String(date.getUTCMonth() + 1).padStart(2, "0"),
            day: String(date.getUTCDate()).padStart(2, "0"),
        });
    }
    const source = value.trim();
    if (!source)
        return value;
    const monthNames = {
        jan: 1,
        january: 1,
        feb: 2,
        february: 2,
        mar: 3,
        march: 3,
        apr: 4,
        april: 4,
        may: 5,
        jun: 6,
        june: 6,
        jul: 7,
        july: 7,
        aug: 8,
        august: 8,
        sep: 9,
        sept: 9,
        september: 9,
        oct: 10,
        october: 10,
        nov: 11,
        november: 11,
        dec: 12,
        december: 12,
    };
    const createParts = (year, month = "", day = "") => {
        const yearNumber = Number(year);
        const monthNumber = month ? Number(month) : 0;
        const dayNumber = day ? Number(day) : 0;
        if (!/^\d{1,4}$/.test(year) || yearNumber < 1)
            return undefined;
        if (month && (monthNumber < 1 || monthNumber > 12))
            return undefined;
        if (day) {
            const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));
            if (dayNumber < 1 ||
                dayNumber > 31 ||
                date.getUTCFullYear() !== yearNumber ||
                date.getUTCMonth() !== monthNumber - 1 ||
                date.getUTCDate() !== dayNumber) {
                return undefined;
            }
        }
        return {
            year: year.padStart(4, "0"),
            month: month ? String(monthNumber).padStart(2, "0") : "",
            day: day ? String(dayNumber).padStart(2, "0") : "",
        };
    };
    const numeric = /^(\d{4})[-/.]?(\d{2})[-/.]?(\d{2})$/.exec(source);
    const yearOnly = /^(\d{1,4})$/.exec(source);
    const yearMonth = /^(\d{1,4})[-/.](\d{1,2})(?:$|[T\s])/.exec(source);
    const ymd = /^(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,2})(?:$|[T\s])/.exec(source);
    const slashDate = /^(\d{1,2})[/-](\d{1,2})[/-](\d{1,4})(?:$|\s)/.exec(source);
    const named = /^(?:(\d{1,2})\s+)?([A-Za-z]+)(?:\s+(\d{1,2}))?,?\s+(\d{1,4})$/.exec(source);
    const yearNamed = /^(\d{1,4})\s+([A-Za-z]+)(?:\s+(\d{1,2}))?$/.exec(source);
    const chinese = /^(\d{1,4})年(?:\s*(\d{1,2})月)?(?:\s*(\d{1,2})日)?$/.exec(source);
    let parts;
    if (numeric) {
        parts = createParts(numeric[1] ?? "", numeric[2] ?? "", numeric[3] ?? "");
    }
    else if (yearOnly) {
        parts = createParts(yearOnly[1] ?? "");
    }
    else if (ymd) {
        parts = createParts(ymd[1] ?? "", ymd[2] ?? "", ymd[3] ?? "");
    }
    else if (yearMonth) {
        parts = createParts(yearMonth[1] ?? "", yearMonth[2] ?? "");
    }
    else if (slashDate) {
        const first = Number(slashDate[1] ?? 0);
        const second = Number(slashDate[2] ?? 0);
        const month = first > 12 ? second : first;
        const day = first > 12 ? first : second;
        parts = createParts(slashDate[3] ?? "", String(month), String(day));
    }
    else if (named || yearNamed) {
        const monthName = (named ? named[2] : yearNamed?.[2])?.toLowerCase();
        const month = monthNames[monthName ?? ""];
        const year = (named ? named[4] : yearNamed?.[1]) ?? "";
        const day = (named ? named[1] || named[3] : yearNamed?.[3]) ?? "";
        if (month && year)
            parts = createParts(year, String(month), day);
    }
    else if (chinese) {
        parts = createParts(chinese[1] ?? "", chinese[2] ?? "", chinese[3] ?? "");
    }
    return parts ? callback(parts) : value;
}
function hostText(value, style) {
    return {
        value: normalizeTextValue(value),
        ...(style || {}),
    };
}
function hostPlainText(input) {
    return plainUnitText(input);
}
function hostGroup(units, delimiter) {
    const normalized = toHostUnit(delimiter);
    return {
        type: "group",
        units: Array.isArray(units) ? units : [],
        ...(normalized === undefined ? {} : { delimiter: normalized }),
    };
}
function hostAffix(input, prefix, suffix) {
    const resolvedPrefix = toHostUnit(prefix);
    const resolvedSuffix = toHostUnit(suffix);
    return {
        type: "affix",
        unit: input,
        ...(resolvedPrefix === undefined ? {} : { prefix: resolvedPrefix }),
        ...(resolvedSuffix === undefined ? {} : { suffix: resolvedSuffix }),
    };
}
function hostFallback(units) {
    return { type: "fall", units };
}
function hostChoose(condition, trueUnit, elseUnit) {
    return {
        type: "when",
        condition,
        trueUnit,
        ...(elseUnit === undefined ? {} : { elseUnit }),
    };
}
function hostTextCase(input, form, ignoreWords) {
    return {
        type: "text-case",
        unit: input,
        form,
        ...(ignoreWords === undefined ? {} : { ignoreWords }),
    };
}
function hostWithStyle(input, style) {
    return {
        type: "style",
        unit: input,
        style,
    };
}
function hostLink(input, link) {
    return {
        type: "link",
        unit: input,
        link: sanitizeLink(link) ?? "",
    };
}
function normalizeLanguagePreferences(language) {
    const inputs = Array.isArray(language) ? language : [language];
    const seen = new Set();
    const normalized = [];
    for (const input of inputs) {
        // Styles may pass tags the dialog's strict validation refuses (script and
        // variant subtags, macro-regions), so only empty values are dropped here.
        const value = normalizeStyleLanguageTag(input);
        if (!value || seen.has(value)) {
            continue;
        }
        seen.add(value);
        normalized.push(value);
    }
    return normalized;
}
function serializeHostSyncRuntimeFunction(exportedName) {
    return `const ${exportedName} = function (...args) { return __host.${exportedName}(...args); };`;
}
function serializeHostAsyncRuntimeFunction(exportedName) {
    return `const ${exportedName} = function (...args) { return new Promise((resolve, reject) => { __host.${exportedName}(...args, resolve, (reason) => { const error = new Error(typeof reason === "string" ? reason : String(reason)); error.code = "host-capability"; error.sourcePath = ${JSON.stringify(exportedName)}; reject(error); }); }); };`;
}
function serializeReadonlyHostAsyncRuntimeFunction(exportedName) {
    return `const ${exportedName} = function (...args) { return new Promise((resolve, reject) => { __host.${exportedName}(...args, (value) => { resolve(typeof __banyanWrapContextView__ === "function" ? __banyanWrapContextView__(value) : value); }, (reason) => { const error = new Error(typeof reason === "string" ? reason : String(reason)); error.code = "host-capability"; error.sourcePath = ${JSON.stringify(exportedName)}; reject(error); }); }); };`;
}
function defineLocalUtility(runtime) {
    return {
        buildRuntimeSource: (name) => serializeRuntimeFunction(name, runtime),
    };
}
function defineCloningHostSyncUtility(host) {
    return {
        buildRuntimeSource: (name) => serializeHostSyncRuntimeFunction(name),
        buildHostHandler: (_name, context, _host) => (...args) => cloneHostUtilityResult(host(...args), context),
    };
}
function cloneHostUtilityResult(value, context) {
    if (!value || typeof value !== "object") {
        return value;
    }
    return context.importValue(value);
}
function defineCapabilitySyncUtility(requires, build) {
    return {
        requires,
        buildRuntimeSource: (name) => serializeHostSyncRuntimeFunction(name),
        buildHostHandler: (name, context, host) => createSyncHostBridgeHandler(name, build(host), context),
    };
}
function createSyncHostBridgeHandler(_name, handler, context) {
    return (...args) => cloneHostUtilityResult(handler(...args), context);
}
function defineCapabilityAsyncUtility(requires, build) {
    return {
        requires,
        buildRuntimeSource: (name) => serializeHostAsyncRuntimeFunction(name),
        buildHostHandler: (name, context, host) => createAsyncHostBridgeHandler(name, build(host), context),
    };
}
function defineReadonlyCapabilityAsyncUtility(requires, build) {
    return {
        requires,
        buildRuntimeSource: (name) => serializeReadonlyHostAsyncRuntimeFunction(name),
        buildHostHandler: (name, context, host) => createAsyncHostBridgeHandler(name, build(host), context),
    };
}
function materializeUtilityDefinitions(definitions) {
    const materialized = {};
    for (const name of Object.keys(definitions)) {
        const definition = definitions[name];
        const runtimeSource = definition.buildRuntimeSource(name);
        const buildHostHandlerFactory = definition.buildHostHandler;
        if (!buildHostHandlerFactory) {
            materialized[name] = { runtimeSource };
            continue;
        }
        const requires = definition.requires;
        materialized[name] = {
            runtimeSource,
            buildHostHandler: (context, host) => {
                const handler = buildHostHandlerFactory(name, context, host);
                return requires
                    ? guardMissingCapability(handler, host, requires, name)
                    : handler;
            },
        };
    }
    return materialized;
}
const UTILITY_DEFINITION_FACTORIES = {
    readBytes: defineCapabilityAsyncUtility("readFile", (host) => (relPath, options) => readBytes(relPath, options, host)),
    readText: defineCapabilityAsyncUtility("readFile", (host) => (relPath, options) => readText(relPath, options, host)),
    readJSON: defineCapabilityAsyncUtility("readFile", (host) => (relPath, options) => readJSON(relPath, options, host)),
    getMultilingualItems: defineReadonlyCapabilityAsyncUtility("resolveMultilingualItems", (host) => (item) => readMultilingualItemsForStyle(item, host)),
    getMultilingualItem: defineReadonlyCapabilityAsyncUtility("resolveMultilingualItems", (host) => (item, language) => readMultilingualItemForStyle(item, language, host)),
    text: defineCloningHostSyncUtility(hostText),
    plainText: defineCloningHostSyncUtility(hostPlainText),
    textCase: defineCloningHostSyncUtility(hostTextCase),
    uuid: defineCloningHostSyncUtility(hostUuid),
    getExtraValue: defineLocalUtility(runtimeGetExtraValue),
    formatDate: defineLocalUtility(runtimeFormatDate),
    htmlToUnit: defineCapabilitySyncUtility("parseHtml", (host) => {
        // The capability guard around the handler reports a missing `parseHtml`
        // at call time; resolving it here must not throw while the table is built.
        return (html) => {
            const parseHtml = host.capabilities.parseHtml;
            if (!parseHtml) {
                throw new Error('htmlToUnit requires the "parseHtml" capability.');
            }
            return unitFromHtml(html, parseHtml);
        };
    }),
    unitToHtml: defineCloningHostSyncUtility(unitToMarkup),
    safeString: defineLocalUtility(runtimeSafeString),
    safeRecord: defineLocalUtility(runtimeSafeRecord),
    affix: defineCloningHostSyncUtility(hostAffix),
    group: defineCloningHostSyncUtility(hostGroup),
    fallback: defineCloningHostSyncUtility(hostFallback),
    when: defineCloningHostSyncUtility(hostChoose),
    withStyle: defineCloningHostSyncUtility(hostWithStyle),
    link: defineCloningHostSyncUtility(hostLink),
};
const UTILITY_DEFINITIONS = materializeUtilityDefinitions(UTILITY_DEFINITION_FACTORIES);
export const RUNTIME_UTILITY_NAMES = Object.keys(UTILITY_DEFINITIONS);
function buildSandboxUtilitiesSource() {
    // The sandbox evaluates script text, so the utility table is generated as one
    // source string. Composing it from typed TypeScript functions keeps every body
    // type-checked and debuggable in the host bundle.
    const lines = ["(function (__host) {", '  "use strict";'];
    for (const name of RUNTIME_UTILITY_NAMES) {
        lines.push(`  ${UTILITY_DEFINITIONS[name].runtimeSource}`);
    }
    lines.push("  Object.defineProperties(globalThis, {");
    for (const name of RUNTIME_UTILITY_NAMES) {
        lines.push(`    ${name}: { value: ${name}, writable: false, configurable: false, enumerable: true },`);
    }
    lines.push("  });");
    lines.push("})(__banyanHostUtils__);");
    return lines.join("\n");
}
let sandboxUtilitiesSourceCache = null;
// Built on first use, not at import time: the builder scans serialized
// fragments and throws when a toolchain helper is unregistered, and that
// failure belongs to style creation, not to loading the core module.
function getSandboxUtilitiesSource() {
    sandboxUtilitiesSourceCache ??= buildSandboxUtilitiesSource();
    return sandboxUtilitiesSourceCache;
}
/**
 * Serialized sources of one sandbox, in installation order. Exposed for the
 * contract test, which asserts that everything serialized here passes the
 * helper-ledger scan.
 */
export function buildSandboxRuntimeSources() {
    return {
        helpersSource: buildTranspileHelperSource(),
        utilitiesSource: getSandboxUtilitiesSource(),
    };
}
/**
 * Install the style utilities in a context: helper ledger first (the source
 * below is serialized from this bundle and may reference toolchain helpers),
 * then the utility table, with the host bridge visible only while it is being
 * read.
 */
export function installUtilities(context, host) {
    const hostBridge = context.createObject();
    for (const [name, fn] of Object.entries(createHostUtilityHandlers(context, host))) {
        if (typeof fn !== "function")
            continue;
        context.defineFunction(hostBridge, name, fn);
    }
    context.defineGlobal("__banyanHostUtils__", hostBridge);
    try {
        context.evaluate(buildTranspileHelperSource(), {
            filename: "banyan-transpile-helpers.js",
        });
        context.evaluate(getSandboxUtilitiesSource(), {
            filename: "banyan-style-utils.js",
        });
    }
    finally {
        context.deleteGlobal("__banyanHostUtils__");
    }
}
function createHostUtilityHandlers(context, host) {
    const handlers = {};
    for (const name of RUNTIME_UTILITY_NAMES) {
        const buildHostHandler = UTILITY_DEFINITIONS[name].buildHostHandler;
        if (!buildHostHandler) {
            continue;
        }
        handlers[name] = buildHostHandler(context, host);
    }
    return handlers;
}
function createAsyncHostBridgeHandler(name, host, context) {
    const hostBridge = host;
    return (...args) => {
        const resolve = args[args.length - 2];
        const reject = args[args.length - 1];
        // Capability arguments come from the sandbox object graph. Cross-realm
        // proxies can look empty to the host, so hand the capability host-owned
        // data instead of the raw wrapper.
        const params = args
            .slice(0, -2)
            .map((argument) => context.cloneToHost(argument));
        if (typeof resolve !== "function" || typeof reject !== "function") {
            throw new TypeError(`Host bridge '${name}' expects resolve/reject callbacks.`);
        }
        settleBridgePromise(Promise.resolve(hostBridge(...params)), context, resolve, reject);
    };
}
function settleBridgePromise(promise, context, resolve, reject) {
    Promise.resolve(promise).then((value) => {
        try {
            resolve(context.importValue(value));
        }
        catch (error) {
            reject(errorMessageOf(error));
        }
    }, (error) => {
        reject(errorMessageOf(error));
    });
}
function assertFileReadAvailable(host) {
    return requireCapability(host.capabilities.readFile, 'The host does not provide the "readFile" capability; readBytes/readText/readJSON are unavailable.');
}
async function readBytes(relPath, options, host) {
    return assertFileReadAvailable(host)(relPath, options);
}
async function readText(relPath, options, host) {
    const bytes = await assertFileReadAvailable(host)(relPath, options);
    return new TextDecoder().decode(bytes);
}
async function readJSON(relPath, options, host) {
    return JSON.parse(await readText(relPath, options, host));
}
/**
 * Resolve the multilingual group of a style item through the host.
 *
 * The relation is data the style can observe, so it cannot be approximated:
 * a host without it is reported rather than answered with an empty group.
 */
async function readMultilingualItemsForStyle(item, host) {
    if (!isBanyanItem(item)) {
        throw new TypeError("Multilingual utilities expect a Banyan item from citation contexts.");
    }
    const resolveMultilingualItems = requireCapability(host.capabilities.resolveMultilingualItems, 'The host does not provide the "resolveMultilingualItems" capability; getMultilingualItems/getMultilingualItem are unavailable.');
    return (await resolveMultilingualItems(item));
}
async function readMultilingualItemForStyle(item, language, host) {
    const preferences = normalizeLanguagePreferences(language);
    if (!preferences.length) {
        throw new TypeError("getMultilingualItem expects a non-empty language selector.");
    }
    if (!isBanyanItem(item)) {
        throw new TypeError("Multilingual utilities expect a Banyan item from citation contexts.");
    }
    const relatedItems = await readMultilingualItemsForStyle(item, host);
    // Normalized once, not per preference: `Intl.Locale` is the expensive part.
    const candidates = [];
    for (const candidate of [item, ...relatedItems]) {
        const candidateLanguage = normalizeStyleLanguageTag(candidate.language);
        if (!candidateLanguage) {
            continue;
        }
        candidates.push({
            item: candidate,
            language: candidateLanguage,
            isSource: candidate === item,
        });
    }
    for (const preference of preferences) {
        const match = findLanguageMatch(candidates, preference);
        if (match) {
            return match;
        }
    }
    return item;
}
//# sourceMappingURL=utilities.js.map