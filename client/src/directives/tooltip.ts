import { DirectiveBinding, nextTick } from "vue";
import {Tooltip} from 'bootstrap';
import {useSettingsStore} from "@/stores/settings.js";

const placementRE = /^(auto|top|bottom|left|right)$/i
const delayShowRE = /^ds\d+$/i
const delayHideRE = /^dh\d+$/i

function isPlacementType(mod: string): mod is Tooltip.PopoverPlacement {
    return placementRE.test(mod);
}

function parseBindings(bindings: DirectiveBinding) {
    // We start out with a basic config
    let config = {
        title: '',
        trigger: 'hover' as 'hover', // Default set below if needed
        placement: 'left' as Tooltip.PopoverPlacement,
        delay: {show: 500, hide: 100},
    }

    if (typeof bindings.value === 'string'){
        config.title = bindings.value;
    } else {
        config = {...config, ...bindings.value}
    }

    // Process modifiers
    Object.keys(bindings.modifiers).forEach(mod => {
        if (isPlacementType(mod)) {
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

function applyTooltip(el: Element, bindings: DirectiveBinding){
    removeTooltip(el);
    const settings = useSettingsStore();
    if(!settings.showTooltips){
        return;
    }
    const config = parseBindings(bindings);
    new Tooltip(el, config);
}

function removeTooltip(el: Element) {
    const tooltip = Tooltip.getInstance(el);
    tooltip?.dispose();
}

// Export our directive
export const CBSTooltip = {
    beforeMount(el: Element, bindings: DirectiveBinding) {
        const settings = useSettingsStore();
        settings.addTooltipUpdateFunc(bindings.instance!.$forceUpdate);
        applyTooltip(el, bindings);
    },
    updated(el: Element, bindings: DirectiveBinding) {
        // Performed in a `$nextTick()` to prevent render update loops
        nextTick(() => {
            applyTooltip(el, bindings);
        }).then(() => {});
    },
    unmounted(el: Element, bindings: DirectiveBinding) {
        const settings = useSettingsStore();
        settings.removeTooltipUpdateFunc(bindings.instance!.$forceUpdate);
        removeTooltip(el);
    }
}