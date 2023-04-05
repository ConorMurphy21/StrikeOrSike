import {nextTick} from 'vue';
import {Tooltip} from 'bootstrap';

const placementRE = /^(auto|top(left|right)?|bottom(left|right)?|left(top|bottom)?|right(top|bottom)?)$/i
const delayShowRE = /^ds\d+$/i
const delayHideRE = /^dh\d+$/i

const parseBindings = (bindings) => /* istanbul ignore next: not easy to test */ {
    // We start out with a basic config
    let config = {
        title: undefined,
        triggers: 'hover', // Default set below if needed
        placement: 'top',
        delay: {show: 500, hide: 100},
    }

    config.title = bindings.value;

    // Process modifiers
    Object.keys(bindings.modifiers).forEach(mod => {
        if (placementRE.test(mod)) {
            // Placement of tooltip
            config.placement = mod;
        } else if (delayShowRE.test(mod)) {
            // Delay show value
            config.delay.show = parseInt(mod.slice(2));
        } else if (delayHideRE.test(mod)) {
            // Delay hide value
            config.delay.hide = parseInt(mod.slice(2));
        }
    })
    // Return the config
    return config;
}

const applyTooltip = (el, bindings) => {
    const config = parseBindings(bindings);
    const tooltip = Tooltip.getInstance(el);
    if (tooltip && tooltip.title !== config.title) {
        tooltip.dispose();
    }
    new Tooltip(el, config);
};

const removeTooltip = (el) => {
    const tooltip = Tooltip.getInstance(el);
    tooltip?.dispose();
}

// Export our directive
export const CBSTooltip = {
    beforeMount(el, bindings, vnode) {
        applyTooltip(el, bindings, vnode)
    },
    updated(el, bindings, vnode) {
        // Performed in a `$nextTick()` to prevent render update loops
        nextTick(() => {
            applyTooltip(el, bindings, vnode)
        })
    },
    unmounted(el) {
        removeTooltip(el)
    }
}