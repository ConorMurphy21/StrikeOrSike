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

        it('mock pack indexing', (done) => {
            test_pack_indexing(done);
        });

        it('mock indexing wo customPrompts', (done) => {
            test_indexing(done, []);
        });

        it('mock indexing w customPrompts', (done) => {
            const customPrompts = ['test1', 'test2', 'test3', 'test4', 'test5'];
            test_indexing(done, customPrompts);
        });
    });


});

function test_indexing(done, customPrompts) {
    if (!Prompts.metas.length) {
        done();
        return;
    }
    const langs = [];
    Prompts.metas.forEach(meta => {
        if(!langs.includes(meta.lang)) langs.push(meta.lang);
    });

    let promise = Promise.resolve();
    langs.forEach(lang => {
        promise = promise.then(test_indexing_lang(done, customPrompts, lang));
    });
    promise.then(done);
}

function test_indexing_lang(customPrompts, lang) {

    let lines = [];
    const packs = [];

    Prompts.metas.filter(meta => meta.lang === lang).forEach(meta => {
        packs.push(meta.name);
        lines = lines.concat(fs.readFileSync(meta.path, 'utf-8').split('\n').filter(Boolean));
    });
    lines = lines.concat(customPrompts);

    const prompts = new Prompts(packs, customPrompts, lang);
    let promise = Promise.resolve();
    lines.forEach((prompt, index) => {
        promise = promise.then(() => {
            return new Promise((resolve) => {
                prompts._getPrompt(index).then(value => {
                    assert.strictEqual(value, prompt.trim());
                    resolve();
                });
            });
        });
    });

    return promise;
}

function test_pack_indexing(done) {
    if (!Prompts.metas.length) {
        done();
        return;
    }
    Prompts.metas.forEach(meta => {
        const lines = fs.readFileSync(meta.path, 'utf-8').split('\n').filter(Boolean);
        const prompts = new Prompts([meta.name]);
        let promise = Promise.resolve();
        lines.forEach((prompt, index) => {
            promise = promise.then(() => {
                return new Promise((resolve) => {
                    prompts._getPrompt(index).then(value => {
                        assert.strictEqual(value, prompt.trim());
                        if (index === lines.length - 1) {
                            done();
                        }
                        resolve();
                    });
                });
            });
        });
    });
}