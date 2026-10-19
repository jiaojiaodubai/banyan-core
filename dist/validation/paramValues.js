import { isThenable } from "./thenable.js";
/**
 * Resolve document-wide style options.
 *
 * Unknown keys are dropped: these values belong to the style, not to the
 * document, so a key no current version declares has no meaning.
 */
export function resolveStyleOptionState(params, rawValues, resolveOptions = {}) {
    const declarations = (params ?? []);
    const raw = rawValues && typeof rawValues === "object" && !Array.isArray(rawValues)
        ? rawValues
        : {};
    const storedValues = {};
    const valueSources = {};
    const cellSources = {};
    for (const declaration of declarations) {
        const stored = normalizeStoredValue(declaration, raw[declaration.id]);
        storedValues[declaration.id] = stored.value;
        valueSources[declaration.id] = stored.source;
        if (stored.cellSources)
            cellSources[declaration.id] = stored.cellSources;
    }
    const { effectiveValues, states } = resolveDeclarations(declarations, storedValues, cellSources, (effective) => [effective], resolveOptions.validate !== false);
    return {
        storedValues: storedValues,
        valueSources,
        effectiveValues: effectiveValues,
        states,
    };
}
/** Resolve one citation's parameters. The returned citation carries effective params. */
export function resolveCitationParamValues(params, citation, options, resolveOptions = {}) {
    const declarations = (params ?? []);
    const rawParams = citation.params ?? {};
    const storedValues = { ...rawParams };
    const valueSources = {};
    const cellSources = {};
    for (const declaration of declarations) {
        const stored = normalizeStoredValue(declaration, rawParams[declaration.id]);
        storedValues[declaration.id] = stored.value;
        valueSources[declaration.id] = stored.source;
        if (stored.cellSources)
            cellSources[declaration.id] = stored.cellSources;
    }
    const buildArgs = (effective) => [
        { ...citation, params: effective },
        options,
    ];
    const { effectiveValues, states } = resolveDeclarations(declarations, storedValues, cellSources, buildArgs, resolveOptions.validate !== false);
    return {
        citation: { ...citation, params: effectiveValues },
        storedValues,
        valueSources,
        effectiveValues,
        states,
    };
}
/** Resolve one cite's parameters. Parent citation/options are already effective. */
export function resolveCiteParamValues(params, cite, citation, options, resolveOptions = {}) {
    const declarations = (params ?? []);
    const rawParams = cite.params ?? {};
    const storedValues = { ...rawParams };
    const valueSources = {};
    const cellSources = {};
    for (const declaration of declarations) {
        const stored = normalizeStoredValue(declaration, rawParams[declaration.id]);
        storedValues[declaration.id] = stored.value;
        valueSources[declaration.id] = stored.source;
        if (stored.cellSources)
            cellSources[declaration.id] = stored.cellSources;
    }
    const buildArgs = (effective) => [
        { ...cite, params: effective },
        citation,
        options,
    ];
    const { effectiveValues, states } = resolveDeclarations(declarations, storedValues, cellSources, buildArgs, resolveOptions.validate !== false);
    return {
        cite: { ...cite, params: effectiveValues },
        citation,
        storedValues,
        valueSources,
        effectiveValues,
        states,
    };
}
function resolveDeclarations(declarations, storedValues, cellSources, buildArgs, validate) {
    // Every scope starts from the normalized stored/default snapshot. Earlier
    // declarations replace their entry as they resolve; later ones still show
    // their stored/default value to a callback.
    const effectiveValues = { ...storedValues };
    const states = {};
    for (const declaration of declarations) {
        const stored = storedValues[declaration.id] ?? neutralValue(declaration);
        const args = buildArgs(effectiveValues);
        if (declaration.applicable) {
            let applicable = true;
            try {
                applicable = declaration.applicable(...args) !== false;
            }
            catch {
                applicable = true;
            }
            if (!applicable) {
                const value = neutralValue(declaration);
                effectiveValues[declaration.id] = value;
                states[declaration.id] = { mode: "hidden", value };
                continue;
            }
        }
        if (declaration.forcedValue !== undefined) {
            let resolved;
            try {
                resolved =
                    typeof declaration.forcedValue === "function"
                        ? declaration.forcedValue(...args)
                        : declaration.forcedValue;
            }
            catch {
                resolved = undefined;
            }
            if (resolved === null) {
                effectiveValues[declaration.id] = stored;
                states[declaration.id] = freeState(declaration, stored, args, validate, cellSources[declaration.id]);
                continue;
            }
            const forced = normalizeForcedValue(declaration, resolved);
            if (forced !== undefined) {
                effectiveValues[declaration.id] = forced;
                states[declaration.id] = { mode: "forced", value: forced };
                continue;
            }
        }
        effectiveValues[declaration.id] = stored;
        states[declaration.id] = freeState(declaration, stored, args, validate, cellSources[declaration.id]);
    }
    return { effectiveValues, states };
}
/**
 * A free value is the only place validation applies: hidden and forced values
 * are not the user's input. List fields are validated row by row, so a host can
 * mark the exact input that needs attention.
 */
function freeState(declaration, value, args, validate, cellSources) {
    const state = { mode: "free", value };
    if (!validate)
        return state;
    if (declaration.kind === "value" &&
        typeof value === "string" &&
        typeof declaration.validate === "function") {
        state.validation = runValidation(declaration.validate, value, args);
        return state;
    }
    if (declaration.kind === "list" && Array.isArray(value)) {
        const fieldValidation = runListValidation(declaration.fields, value, args, cellSources);
        if (fieldValidation) {
            state.fieldValidation = fieldValidation;
        }
    }
    return state;
}
/**
 * Validate every list cell for this resolution.
 *
 * DEBT(second host): no cross-resolution cache is kept — the validator is
 * author code and the surrounding citation/options can change between calls. A
 * bounded per-cite cache is the planned direction once a second host needs it;
 * until then a cached result would silently assume validator purity.
 */
function runListValidation(fields, rows, args, cellSources) {
    if (!fields?.length)
        return undefined;
    const results = {};
    let hasValidator = false;
    for (const field of fields) {
        if (typeof field.validate !== "function")
            continue;
        hasValidator = true;
        const validate = field.validate;
        results[field.id] = rows.map((row, index) => ({
            ...runValidation(validate, row[field.id] ?? field.defaultValue ?? "", [
                row,
                ...args,
            ]),
            source: cellSources?.[field.id]?.[index] ?? "provided",
        }));
    }
    return hasValidator ? results : undefined;
}
function runValidation(validate, value, args) {
    let result;
    try {
        result = validate(value, ...args);
    }
    catch (error) {
        return { valid: false, message: validatorErrorMessage(error) };
    }
    if (result === true)
        return { valid: true };
    if (result === false)
        return { valid: false };
    if (typeof result === "string") {
        const message = result.trim();
        return message ? { valid: false, message } : { valid: false };
    }
    if (isThenable(result)) {
        // Validation is part of synchronous resolution; consume a rejection so a
        // mistaken async validator does not leak an unhandled promise.
        void Promise.resolve(result).catch(() => { });
        return {
            valid: false,
            message: "A parameter validator must return synchronously; resolve async data before validating.",
        };
    }
    return {
        valid: false,
        message: "The parameter validator returned an unsupported result; use true, false, or a message.",
    };
}
function validatorErrorMessage(error) {
    // `instanceof Error` does not cross realms; a validator throws a sandbox
    // error object, so read `message` structurally instead.
    if (error && typeof error === "object") {
        const message = error.message;
        if (typeof message === "string" && message.trim()) {
            return message.trim();
        }
    }
    if (typeof error === "string" && error.trim()) {
        return error.trim();
    }
    return "The parameter validator threw an error.";
}
function normalizeStoredValue(declaration, raw) {
    const fallback = () => {
        const value = neutralValue(declaration);
        return {
            value,
            source: "invalid",
            ...(declaration.kind === "list"
                ? { cellSources: defaultCellSources(declaration, value) }
                : {}),
        };
    };
    if (raw === undefined || raw === null) {
        const value = neutralValue(declaration);
        return {
            value,
            source: "default",
            ...(declaration.kind === "list"
                ? { cellSources: defaultCellSources(declaration, value) }
                : {}),
        };
    }
    switch (declaration.kind) {
        case "state":
            if (declaration.states) {
                return typeof raw === "string" && Object.hasOwn(declaration.states, raw)
                    ? { value: raw, source: "provided" }
                    : fallback();
            }
            return typeof raw === "boolean"
                ? { value: raw, source: "provided" }
                : fallback();
        case "value":
            return typeof raw === "string"
                ? { value: raw, source: "provided" }
                : fallback();
        case "list": {
            if (!Array.isArray(raw)) {
                return fallback();
            }
            const normalized = normalizeRows(declaration.fields ?? [], raw);
            if (!normalized) {
                return fallback();
            }
            // Every supplied row was unusable: this is the same case as a wrong-kind
            // value, so fall back to the declared default rather than storing [].
            if (!normalized.rows.length && raw.length) {
                return fallback();
            }
            return {
                value: normalized.rows,
                source: normalized.repaired ? "repaired" : "provided",
                cellSources: normalized.cellSources,
            };
        }
    }
}
/** Every cell of a fallback/default list comes from the declaration. */
function defaultCellSources(declaration, value) {
    const rows = Array.isArray(value) ? value : [];
    const sources = {};
    for (const field of declaration.fields ?? []) {
        sources[field.id] = rows.map(() => "default");
    }
    return sources;
}
function normalizeForcedValue(declaration, raw) {
    switch (declaration.kind) {
        case "state":
            if (declaration.states) {
                return typeof raw === "string" && Object.hasOwn(declaration.states, raw)
                    ? raw
                    : undefined;
            }
            return typeof raw === "boolean" ? raw : undefined;
        case "value":
            return typeof raw === "string" ? raw : undefined;
        case "list": {
            if (!Array.isArray(raw)) {
                return undefined;
            }
            const normalized = normalizeRows(declaration.fields ?? [], raw);
            if (!normalized || (!normalized.rows.length && raw.length)) {
                return undefined;
            }
            return normalized.rows;
        }
    }
}
function normalizeRows(fields, raw) {
    const rows = [];
    const cellSources = {};
    for (const field of fields) {
        cellSources[field.id] = [];
    }
    let repaired = false;
    for (const entry of raw) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            repaired = true;
            continue;
        }
        const record = entry;
        const row = {};
        for (const field of fields) {
            const value = record[field.id];
            const sources = cellSources[field.id];
            if (typeof value === "string") {
                row[field.id] = value;
                sources.push("provided");
            }
            else {
                row[field.id] = String(field.defaultValue ?? "");
                sources.push("default");
                repaired = true;
            }
        }
        rows.push(row);
    }
    return { rows, cellSources, repaired };
}
function neutralValue(declaration) {
    switch (declaration.kind) {
        case "state":
            if (declaration.states) {
                return String(declaration.defaultValue ?? Object.keys(declaration.states)[0] ?? "");
            }
            return typeof declaration.defaultValue === "boolean"
                ? declaration.defaultValue
                : false;
        case "value":
            return typeof declaration.defaultValue === "string"
                ? declaration.defaultValue
                : "";
        case "list":
            return Array.isArray(declaration.defaultValue)
                ? declaration.defaultValue
                : [];
    }
}
/** Kept for callers that only need stored style options. */
export function resolveStoredStyleOptionValues(params, rawValues) {
    return resolveStyleOptionState(params, rawValues, { validate: false })
        .storedValues;
}
//# sourceMappingURL=paramValues.js.map