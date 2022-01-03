// retrieve meta data
const fs = require('fs');
const path = require('path');
const klawSync = require('klaw-sync');


const regex = /^([\d]*)x([\d]*)(.*).txt$/

const walkFilter = (item) => {
    const basename = path.basename(item.path);
    return regex.test(basename);
};

// retrieve meta info for what prompts can be served
const retrieveMetas = (root) => {
    const metas = []

    const items = klawSync(root,{nodir: true}).filter(walkFilter);

    items.forEach(item => {
        const lang = path.basename(path.dirname(item.path));
        const basename = path.basename(item.path);
        const [_, width, height, name] = basename.match(regex);
        metas.push({
            lang,
            path: item.path,
            width: parseInt(width),
            height: parseInt(height),
            name
        });
    });

    return metas;
}

const promptsRoot = './resources/prompts/';

const Prompts = class {

    static metas = retrieveMetas(promptsRoot);

    constructor(packNames, customPrompts, lang = 'en') {
        this.customPrompts = customPrompts;
        this.numPrompts = customPrompts?.length ?? 0;
        this.packs = [];
        this.used = [];
        this.remaining = [];
        // retrieve meta for each pack
        packNames.forEach((name) => {
            const meta = Prompts.metas.find(meta => meta.name === name && meta.lang === lang);
            this.packs.push(meta);
            this.numPrompts += meta.height;
        });
    }

    newPrompt() {
        if(this.used.length === this.numPrompts){
            return Promise.resolve('');
        }
        const r = this._chooseRandomIndex();
        return this._getPrompt(r);
    }

    _getPrompt(index) {
        return new Promise(resolve => {
            let resolved = false;
            this.packs.forEach((pack) => {
                if(resolved || index >= pack.height) {
                    index -= pack.height;
                    return;
                }
                resolved = true;
                this._getPromptFromPack(pack, index).then(value => resolve(value));
            });
            if(!resolved){
                resolve(this.customPrompts[index]);
            }
        });
    }

    _getPromptFromPack(pack, index) {
        return new Promise((resolve) => {
            fs.open(pack.path, 'r', (err, fd) => {
                let buffer = Buffer.alloc(pack.width);
                fs.read(fd, buffer, 0, pack.width, index * pack.width, (err, bytesRead, buffer) => {
                    if(err){}
                    resolve(buffer.toString().trim());
                });
            });
        });
    }

    _chooseRandomIndex(){
        if (this.used.length > this.numPrompts * 3 / 4) {
            return this._chooseFromRemaining();
        } else {
            return this._chooseRegular();
        }
    }

    // non-deterministic but with enough prompts should be better
    _chooseRegular() {
        let r = Math.floor(Math.random() * this.numPrompts);
        while (this.used.includes(r)) {
            r = Math.floor(Math.random() * this.numPrompts);
        }
        this.used.push(r);
        return r;
    }

    // more consistent but more memory usage, avoided if possible but fallback on if the number of prompts is small
    _chooseFromRemaining() {
        if (!this.remaining) {
            this.remaining = Array.from({length: this.numPrompts}, (v, i) => i)
                .filter(index => !this.used.includes(index));
        }
        const rr = Math.floor(Math.random() * this.remaining);
        const r = this.remaining[rr];
        this.used.push(r);
        this.remaining.splice(r, 1);
        return r;
    }
}

module.exports = {Prompts, retrieveMetas};