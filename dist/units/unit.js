import { compileRichText, normalizeTextValue, plainTextOfUnit, } from "./compile.js";
// The text-case algorithms stay the core's own decision (`./compile` applies
// them); hosts cannot swap them out.
export { applyTextCase, normalizeTextValue } from "./compile.js";
function toUnit(value, style) {
    return {
        value: normalizeTextValue(value),
        ...style,
    };
}
export function plainText(input) {
    const units = Array.isArray(input) ? input : [input];
    return units.map((unit) => plainTextOfUnit(unit)).join("");
}
export const unitUtils = {
    text: toUnit,
    plainText,
    group: (units, delimiter) => ({
        type: "group",
        units,
        ...(delimiter === undefined ? {} : { delimiter }),
    }),
    affix: (unit, prefix, suffix) => ({
        type: "affix",
        unit,
        ...(prefix === undefined ? {} : { prefix }),
        ...(suffix === undefined ? {} : { suffix }),
    }),
    fallback: (units) => {
        return { type: "fall", units };
    },
    when: (condition, trueUnit, elseUnit) => ({
        type: "when",
        condition,
        trueUnit,
        ...(elseUnit === undefined ? {} : { elseUnit }),
    }),
    textCase: (unit, form, ignoreWords) => ({
        type: "text-case",
        unit,
        form,
        ...(ignoreWords === undefined ? {} : { ignoreWords }),
    }),
    withStyle: (unit, style) => {
        return { type: "style", unit, style };
    },
    link: (unit, link) => {
        return { type: "link", unit, link };
    },
};
/** Compile a unit tree with the core's own semantics. */
export function compile(unit) {
    return compileRichText(unit);
}
//# sourceMappingURL=unit.js.map