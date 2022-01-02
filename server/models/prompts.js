// retrieve meta data
const fs = require('fs');
const through2 = require('through2');
const path = require('path');
const klaw = require('klaw');

const excludeDirFilter = through2.obj(function (item, enc, next) {
    const basename = path.basename(item.path);
    const c = basename.charAt(0);
    const startsNumeric = c >= '0' && c <= '9';
    if (!item.stats.isDirectory() && startsNumeric) this.push(item);
    next();
});

// retrieve meta info for what prompts can be served
const metas = []
const promptsPath = './resources/prompts/';
klaw(promptsPath)
    .pipe(excludeDirFilter)
    .on('data', item => {
        const lang = path.basename(path.dirname(item.path));
        const basename = path.basename(item.path);
        const regex = /^([\d]*)x([\d]*)(.*).txt$/
        const [_, width, height, underscoredName] = basename.match(regex);
        const name = underscoredName.split('_').join(' ');
        metas.push({
            lang,
            path: item.path,
            width,
            height,
            name
        });
    });

const Prompts = class {
    constructor(packNames, customPrompts) {
        this.customPrompts = customPrompts;
        this.numPrompts = customPrompts.length;
        this.packs = [];
        this.used = [];
        this.remaining = [];
        // retrieve meta for each pack
        packNames.forEach((name) => {
            const meta = metas.find(meta => meta.name === name);
            this.packs.push(meta);
            this.numPrompts += meta.height;
        });
    }


    newPrompt() {
        // wrap in promise to avoid blocking
        return new Promise((resolve) => {
            let r;
            if(this.used.length === this.numPrompts){
                resolve('');
            }
            if (this.used.length > this.numPrompts * 3 / 4) {
                r = this._chooseFromRemaining();
            } else {
                r = this._chooseRegular();
            }
            let resolved = false;
            this.packs.forEach((pack) => {
                if(resolved || r >= pack.height) {
                    r -= pack.height;
                    return;
                }
                resolved = true;
                this._getPrompt(pack, r).then(value => resolve(value));
            });
            if(!resolved){
                resolve(this.customPrompts[r]);
            }
        });
    }

    _getPrompt(pack, index) {
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

module.exports = {Prompts};