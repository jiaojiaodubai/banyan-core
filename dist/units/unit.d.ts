import type { AffixUnit, FallbackUnit, GroupUnit, LinkUnit, PrintableValue, RenderStyle, TextCaseForm, TextCaseUnit, TextUnit, Unit, WhenUnit, WithStyleUnit } from "../types/unit.js";
import type { RichText } from "../types/unit.js";
export { applyTextCase, normalizeTextValue } from "./compile.js";
declare function toUnit(value: PrintableValue, style?: RenderStyle): TextUnit;
export declare function plainText(input: Unit | readonly Unit[]): string;
export declare const unitUtils: {
    text: typeof toUnit;
    plainText: typeof plainText;
    group: (units: Unit[], delimiter?: Unit) => GroupUnit;
    affix: (unit: Unit, prefix?: Unit, suffix?: Unit) => AffixUnit;
    fallback: (units: Unit[]) => FallbackUnit;
    when: (condition: boolean, trueUnit: Unit, elseUnit?: Unit) => WhenUnit;
    textCase: (unit: Unit, form: TextCaseForm, ignoreWords?: string[]) => TextCaseUnit;
    withStyle: (unit: Unit, style: RenderStyle) => WithStyleUnit;
    link: (unit: Unit, link: string) => LinkUnit;
};
/** Compile a unit tree with the core's own semantics. */
export declare function compile(unit: Unit): RichText;
//# sourceMappingURL=unit.d.ts.map