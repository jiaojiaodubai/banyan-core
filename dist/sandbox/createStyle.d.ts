import { type StyleHost } from "../host.js";
import type { StyleInstance } from "../messages.js";
import { type StyleMessageSink } from "../messages.js";
export type CreateStyleOptions = {
    /**
     * Optional outlet for the records as they happen, traces included. Findings
     * are also readable afterwards through `style.diagnostics`.
     */
    messageSink?: StyleMessageSink;
    /**
     * Async budget for one `generate()` call, in milliseconds. The default is
     * `GENERATE_TIMEOUT_MS` (15 minutes); hosts and tests override it so a stuck
     * style cannot pin a document for that long.
     */
    generateTimeoutMs?: number;
    /**
     * Best-effort synchronous budget for evaluating the style script and invoking
     * its `generate()`, in milliseconds. It is passed to `SandboxContext.evaluate`
     * and each host applies it where its platform supports one (the Node host
     * does; Gecko ignores it). Omitted by default: a host that needs protection
     * from `while (true) {}` opts in.
     */
    evaluateTimeoutMs?: number;
};
export declare function createStyle(host: StyleHost, code: string, options?: CreateStyleOptions): Promise<StyleInstance>;
//# sourceMappingURL=createStyle.d.ts.map