import { serializeRuntimeFunction } from "./transpileHelpers.js";
/** Recursively wrap a value into the readonly, empty-string-safe view. */
function runtimeWrapContextView(input) {
    const seen = new WeakMap();
    // This view is a strict read-only snapshot: a write throws in the style's
    // strict mode instead of being ignored. `safeRecord` is the opposite
    // contract (writes are silently ignored), so the two traps are not shared.
    const readonlyTrap = {
        set() {
            return false;
        },
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        setPrototypeOf() {
            return false;
        },
        preventExtensions() {
            return false;
        },
    };
    const wrap = (value) => {
        if (!value || typeof value !== "object") {
            return value;
        }
        const cached = seen.get(value);
        if (cached) {
            return cached;
        }
        if (Array.isArray(value)) {
            const target = [];
            const proxy = new Proxy(target, readonlyTrap);
            seen.set(value, proxy);
            for (const entry of value) {
                target.push(wrap(entry));
            }
            return proxy;
        }
        const target = Object.create(null);
        const proxy = new Proxy(target, {
            ...readonlyTrap,
            get(currentTarget, prop, receiver) {
                if (typeof prop !== "string") {
                    return Reflect.get(currentTarget, prop, receiver);
                }
                if (!Object.prototype.hasOwnProperty.call(currentTarget, prop)) {
                    return "";
                }
                const result = Reflect.get(currentTarget, prop, receiver);
                return result === undefined ? "" : result;
            },
        });
        seen.set(value, proxy);
        for (const [key, nested] of Object.entries(value)) {
            target[key] = wrap(nested);
        }
        return proxy;
    };
    return wrap(input);
}
let contextViewSourceCache = null;
function getContextViewSource() {
    contextViewSourceCache ??= buildContextViewSource();
    return contextViewSourceCache;
}
function buildContextViewSource() {
    const lines = ["(function () {", '  "use strict";'];
    lines.push(`  ${serializeRuntimeFunction("__banyanWrapContextView", runtimeWrapContextView)}`);
    lines.push('  Object.defineProperty(globalThis, "__banyanWrapContextView__", { value: __banyanWrapContextView, writable: false, configurable: false, enumerable: false });');
    lines.push("})();");
    return lines.join("\n");
}
/** Install the view builder in the context; call once per context. */
export function installContextViewRuntime(context) {
    context.evaluate(getContextViewSource(), {
        filename: "banyan-style-context-view.js",
    });
}
/**
 * Install one readonly global that shares the context-view wrapper: import the
 * raw value, wrap it inside the context (so the proxy belongs to the sandbox
 * realm), then expose it as a non-writable global.
 */
function installReadonlyGlobal(name, rawName, value, context, filename) {
    context.defineGlobal(rawName, context.importValue(value));
    try {
        context.evaluate([
            `Object.defineProperty(globalThis, ${JSON.stringify(name)}, {`,
            '  value: typeof __banyanWrapContextView__ === "function"',
            `    ? __banyanWrapContextView__(${rawName})`,
            `    : ${rawName},`,
            "  writable: false,",
            "  configurable: true,",
            "  enumerable: true,",
            "});",
        ].join("\n"), { filename });
    }
    finally {
        context.deleteGlobal(rawName);
    }
}
/** Install the readonly `contexts` global for one `generate()` call. */
export function installSandboxContexts(contexts, context) {
    installReadonlyGlobal("contexts", "__banyanRawContexts__", contexts, context, "banyan-style-contexts.js");
}
/** Install the readonly `options` global for one `generate()` call. */
export function installSandboxOptions(options, context) {
    installReadonlyGlobal("options", "__banyanRawOptions__", options, context, "banyan-style-options.js");
}
//# sourceMappingURL=contextView.js.map