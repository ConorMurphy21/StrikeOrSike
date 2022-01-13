const assert = require('chai').assert;
const {Prompts, retrieveMetas} = require('../../models/prompts');
const fs = require('fs');

describe('prompts tests', () => {

    describe('actual files', () => {

        before(() => {
            Prompts.metas = retrieveMetas('./resources/prompts');
        });

        it('pack indexing', (done) => {
            test_pack_indexing(done);
        });

        it('prompt indexing wo customPrompts', (done) => {
            test_indexing(done, []);
        });

        it('prompt indexing w customPrompts', (done) => {
            const customPrompts = ['test1', 'test2', 'test3', 'test4', 'test5'];
            test_indexing(done, customPrompts);
        });
    });

    describe('mock files', () => {
        before(() => {
            Prompts.metas = retrieveMetas('./tests/resources/prompts');
        });

        after(() => {
            Prompts.metas = retrieveMetas('./resources/prompts');
        });


        it('pack indexing', (done) => {
            test_pack_indexing(done);
        });

        it('indexing wo customPrompts', (done) => {
            test_indexing(done, []);
        });

        it('indexing w customPrompts', (done) => {
            const customPrompts = ['test1', 'test2', 'test3', 'test4', 'test5'];
            test_indexing(done, customPrompts);
        });
    });

    describe('random numbers', () => {

        it('all numbers used', () => {
            const len = 300;
            const customPrompts = [];
            customPrompts.length = len;
            const prompts = new Prompts([], customPrompts);
            const used = [];
            for(let i = 0; i < len; i++){
                const index = prompts._chooseRandomIndex();
                assert.notInclude(used, index);
                used.push(index);
            }
        });

    });


});

function test_indexing(done, customPrompts) {
    if (!Prompts.metas.length) {
        done();
        return;
    }
    const langs = [];
    for (const meta of Prompts.metas) {
        if(!langs.includes(meta.lang)) langs.push(meta.lang);
    }

    let promise = Promise.resolve();
    for (const lang of langs) {
        promise = promise.then(() => test_indexing_lang(customPrompts, lang));
    }
    promise.then(done);
}

function test_indexing_lang(customPrompts, lang) {

    let lines = [];
    const packs = [];

    for (const meta1 of Prompts.metas.filter(meta => meta.lang === lang)) {
        packs.push(meta1.name);
        lines = lines.concat(fs.readFileSync(meta1.path, 'utf-8').split('\n').filter(Boolean));
    }
    lines = lines.concat(customPrompts);

    const prompts = new Prompts(packs, customPrompts, lang);
    let promise = Promise.resolve();
    for (const prompt of lines) {
        const index = lines.indexOf(prompt);
        promise = promise.then(() => {
            return new Promise((resolve) => {
                prompts._getPrompt(index).then(value => {
                    assert.strictEqual(value, prompt.trim());
                    resolve();
                });
            });
        });
    }
    return promise;
}

function test_pack_indexing(done) {
    if (!Prompts.metas.length) {
        done();
        return;
    }
    let promise = Promise.resolve();
    for (const meta of Prompts.metas) {
        const lines = fs.readFileSync(meta.path, 'utf-8').split('\n').filter(Boolean);
        const prompts = new Prompts([meta.name], [], meta.lang);
        lines.forEach((prompt, index) => {
            promise = promise.then(() => {
                return new Promise((resolve) => {
                    prompts._getPrompt(index).then(value => {
                        assert.strictEqual(value, prompt.trim());
                        resolve();
                    });
                });
            }).catch(assert.fail);
        });
    }
    promise.then(done);
}