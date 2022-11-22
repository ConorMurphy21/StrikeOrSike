// retrieve meta data
const fs = require('fs');
const path = require('path');
const klawSync = require('klaw-sync');

const CUSTOM = 'custom';

// retrieve meta info for what prompts can be served
const retrieveMetas = (root) => {
    const metas = []
    const items = klawSync(root, {nodir: true});
    for (const item of items) {
        const lang = path.basename(path.dirname(item.path));
        const id = path.basename(item.path, '.txt').split(/\. ?/)[1];
        const prompts = fs.readFileSync(item.path, 'utf-8')
            .split(/\r?\n/)
            .map(p => p.trim())
            .filter(Boolean);
        metas.push({
            id,
            path: item.path,
            lang,
            prompts
        });
    }
    return metas;
}

/*
    returns: a map of intersections
    an id to the intersection is id1 + id2, for example if pack1 is standard and pack2 is canadian than standardcanadian
    is an index
    the intersection just lists the index of each intersecting value
 */
const retrieveIntersections = (metas) => {
    const intersections = {};
    for (const meta1 of metas) {
        for (const meta2 of metas) {
            if (meta1.id === meta2.id || meta1.lang !== meta2.lang) continue;
            // already computed this intersection
            if (intersections[meta2.id + meta1.id]) continue;
            const overlapsA = new Set();
            const overlapsB = new Set();
            for (let i = 0; i < meta1.prompts.length; i++) {
                for (let j = 0; j < meta2.prompts.length; j++) {
                    if (meta1.prompts[i] === meta2.prompts[j]) {
                        overlapsA.add(i)
                        overlapsB.add(j)
                    }
                }
            }
            intersections[meta1.id + meta2.id] = {};
            intersections[meta1.id + meta2.id][meta1.id] = overlapsA;
            intersections[meta1.id + meta2.id][meta2.id] = overlapsB;
        }
    }
    return intersections;
}

const promptsRoot = './resources/prompts/';

const Prompts = class {

    static metas = retrieveMetas(promptsRoot);
    static intersections = retrieveIntersections(this.metas);

    static packOptions(lang) {
        const packs = {}
        for (const meta of Prompts.metas) {
            if (meta.lang === lang) {
                packs[meta.id] = false;
            }
        }
        packs['standard'] = true;
        packs['custom'] = false;
        return packs;
    }

    constructor(packs, customPrompts, lang = 'en-CA', oldPrompts) {
        this.numPrompts = customPrompts?.length ?? 0;
        this.numRemaining = 0;
        this.packs = [];
        // retrieve meta for each pack
        const packIds = [];
        for (const id in packs) {
            if (packs[id]) {
                const meta = Prompts.metas.find(meta => meta.id === id && meta.lang === lang);
                // skip any packs that can't be found
                if(!meta) continue;

                packIds.push(id);
                this.packs.push({
                    id: meta.id, prompts: meta.prompts,
                    used: new Set(), // used by the room
                    oou: new Set(),  // out of use (used to avoid repeats)
                    remaining: new Set()
                }); // for alternative method when too much storage is required
            }
        }
        // use prompts to avoid intersection between packs
        for (let i = 0; i < packIds.length; i++) {
            for (let j = i + 1; j < packIds.length; j++) {
                let intersect = Prompts.intersections[packIds[i] + packIds[j]] ??
                    Prompts.intersections[packIds[j] + packIds[i]];
                this.packs[i].oou = new Set([...this.packs[i].oou, ...intersect[packIds[i]]]); // Always use the smaller i to avoid intersections
            }
        }
        // add customPrompts to packs list
        customPrompts = customPrompts.map(p => p.trim());
        this.packs.push({id: CUSTOM, prompts: customPrompts, used: new Set(), oou: new Set(), remaining: new Set()})
        this._keepOldUsed(oldPrompts);

        // set counters
        for (const pack of this.packs) {
            this.numPrompts += pack.prompts.length;
            this.numRemaining += pack.prompts.length - new Set([...pack.used, ...pack.oou]).size;
        }

        if (this._useRemainingMethod(this.numRemaining)) {
            this._setRemainingSets();
        }
    }

    _keepOldUsed(oldPrompts) {
        // this will only work as long as the prompts are the same
        if (!oldPrompts) return;
        for (const oldPack of oldPrompts.packs) {
            if (oldPack.id === CUSTOM || oldPack.used.size === 0) continue;
            for (const newPack of this.packs) {
                if (newPack.id === CUSTOM) break;
                if (oldPack.id === newPack.id) {
                    newPack.used = new Set([...newPack.used, ...oldPack.used])
                } else {
                    let intersect = Prompts.intersections[oldPack.id + newPack.id] ??
                        Prompts.intersections[newPack.id + oldPack.id];
                    for (const u of oldPack.used) {
                        if (intersect[oldPack.id].has(u)) {
                            const index = [...intersect[oldPack.id]].indexOf(u);
                            newPack.used.add([...intersect[newPack.id]][index]);
                        }
                    }
                }
            }

        }
        // check for overlapping custom prompts since the old custom prompts are not necessarily the same as the new ones
        const oldCustomPack = oldPrompts.packs[oldPrompts.packs.length - 1];
        const customPack = this.packs[this.packs.length - 1];
        for (const i of oldCustomPack.used) {
            for (let j = 0; j < customPack.prompts.length; j++) {
                if (oldCustomPack.prompts[i] === customPack.prompts[j]) {
                    customPack.used.add(i);
                }
            }
        }
    }

    _useRemainingMethod(numRemaining) {
        return numRemaining < this.numPrompts / 6;
    }

    _setRemainingSets() {
        for (const pack of this.packs) {
            pack.remaining = new Set(Array.from({length: this.numPrompts}, (v, i) => i)
                .filter(index => !(pack.used.has(index) || pack.oou.has(index))));
        }
    }

    newPrompt(players) {
        if (this.numRemaining <= 0) {
            return '';
        }
        let retVal = '';
        if (this._useRemainingMethod()) {
            retVal = this._chooseFromRemaining();
        } else {
            retVal = this._chooseRegular();
        }
        this.numRemaining--;
        return this._fillPlayerName(players, retVal);
    }

    _fillPlayerName(players, prompt){
        if(prompt.includes('!n')){
            const chosen = players[Math.floor(Math.random() * players.length)];
            return prompt.replace('!n', chosen.name);
        }
        // if there's nothing to replace
        return prompt;
    }

    // non-deterministic but with enough prompts should be better
    _chooseRegular() {
        let r;
        let pack;
        do {
            r = Math.floor(Math.random() * this.numPrompts);
            for (pack of this.packs) {
                if (r >= pack.prompts.length) {
                    r -= pack.prompts.length;
                } else {
                    break;
                }
            }
        } while (pack.used.has(r) || pack.oou.has(r));
        pack.used.add(r);
        return pack.prompts[r];
    }

    // more consistent but more memory usage, avoided if possible but fallback on if the number of prompts is small
    _chooseFromRemaining() {
        // this means this is the first time using the remaining method
        if (!this._useRemainingMethod(this.numRemaining + 1)) {
            this._setRemainingSets();
        }
        let rr = Math.floor(Math.random() * this.numRemaining);
        let pack;
        for (pack of this.packs) {
            if (rr >= pack.remaining.length) {
                rr -= pack.remaining.length;
            } else {
                break;
            }
        }
        const r = pack.remaining[rr];
        pack.used.push(r);
        pack.remaining.splice(rr, 1);
        return r;
    }
}

module.exports = {Prompts, retrieveMetas, retrieveIntersections};