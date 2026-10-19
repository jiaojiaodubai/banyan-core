/**
 * Sanitizing and whitelisting a `RenderStyle`.
 *
 * The declaration is data: only the keys `RenderStyle` defines survive, and a
 * color that is not a plain CSS color is dropped rather than copied into marks.
 * Used by both generate-output normalization and the public compile path.
 */
import type { RenderStyle } from "../types/unit.js";
export declare function sanitizeRenderStyle(input: unknown): RenderStyle;
//# sourceMappingURL=style.d.ts.map