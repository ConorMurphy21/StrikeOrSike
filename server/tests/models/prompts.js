const assert = require('chai').assert;
const {Prompts, retrieveMetas, retrieveIntersections} = require('../../models/prompts');
const fs = require('fs');

describe('prompts tests', () => {

    describe('actual files', () => {

        before(() => {
            Prompts.metas = retrieveMetas('./resources/prompts');
            Prompts.intersections = retrieveIntersections(Prompts.metas);
        });

        it('single pack', () => {
            const prompts = new Prompts(z(['standard']), []);
            test_prompts(prompts, 'en-CA', []);
        });

        it('double pack', () => {
            const prompts = new Prompts(z(['standard', 'canadian']), []);
            test_prompts(prompts, 'en-CA', []);
        });

        it('custom only', () => {
            const custom = ['test1', 'test2', 'test3', 'test4', 'test5'];
            const prompts = new Prompts({}, custom);
            test_prompts(prompts, 'en-CA', custom);
        });


        it('double pack w custom', () => {
            const custom = ['test1', 'test2', 'test3', 'test4', 'test5']
            const prompts = new Prompts(z(['standard', 'canadian']), custom);
            test_prompts(prompts, 'en-CA', custom);
        });

        describe('carryover', () => {
            it('single pack', () => {
                test_old_prompt_carryover(z(['standard']), [], 'en-CA');
            });

            it('double pack', () => {
                test_old_prompt_carryover(z(['standard', 'canadian']), [], 'en-CA');
            });

            it('custom only', () => {
                const custom = ['test1', 'test2', 'test3', 'test4', 'test5'];
                test_old_prompt_carryover({}, custom, 'en-CA');
            });

            it('double pack w custom', () => {
                const custom = ['test1', 'test2', 'test3', 'test4', 'test5'];
                test_old_prompt_carryover(z(['standard', 'canadian']), custom, 'en-CA');
            });
        });

    });

    describe('mock files', () => {
        before(() => {
            Prompts.metas = retrieveMetas('./tests/resources/prompts');
            Prompts.intersections = retrieveIntersections(Prompts.metas);
        });

        after(() => {
            Prompts.metas = retrieveMetas('./resources/prompts');
            Prompts.intersections = retrieveIntersections(Prompts.metas);
        });

        it('single pack', () => {
            const prompts = new Prompts(z(['pack1']), []);
            test_prompts(prompts, 'en-CA', []);
        });

        it('triple pack', () => {
            const prompts = new Prompts(z(['pack1', 'pack2', 'pack3']), []);
            test_prompts(prompts, 'en-CA', []);
        });

        describe('permutations', () => {
            it('all combs', () => {
                const prompts = new Prompts(z(['a', 'b', 'c', 'd']), [], 'prm');
                test_prompts(prompts, 'prm', []);
            });

            it('all combs carryover', () => {
                test_old_prompt_carryover(z(['a', 'b', 'c', 'd']), [], 'prm');
            });
        });

        describe('french', () => {
            it('single pack', () => {
                const prompts = new Prompts(z(['pack1']), [], 'fr');
                test_prompts(prompts, 'fr', []);
            });

            it('triple pack', () => {
                const prompts = new Prompts(z(['pack1', 'pack2', 'pack3']), [], 'fr');
                test_prompts(prompts, 'fr', []);
            });
        });
    });
});

function z(pack) {
    const ret = {}
    for(const id of pack){
        ret[id] = true;
    }
    return ret;
}

function test_prompts(prompts, lang, customPrompts) {
    let lines = customPrompts;
    for (const pack of prompts.packs) {
        if (pack.id !== 'custom') {
            const meta = Prompts.metas.find(p => p.id === pack.id && p.lang === lang);
            const packLines = fs.readFileSync(meta.path, 'utf-8').split(/\r?\n/);
            lines = lines.concat(packLines);
        }
    }
    lines = lines.map(p => p.trim()).filter(Boolean);
    lines = new Set(lines);
    const used = new Set();
    for (let i = 0; i < lines.size; i++) {
        const p = prompts.newPrompt();
        assert.isFalse(used.has(p));
        used.add(p);
        assert.isTrue(lines.has(p));
    }
    const p = prompts.newPrompt();
    assert.strictEqual(p, '');
}

function test_old_prompt_carryover(packIds, customPrompts, lang) {
    let prompts = new Prompts(packIds, customPrompts, lang);
    let lines = customPrompts;
    for (const pack of prompts.packs) {
        if (pack.id !== 'custom') {
            const meta = Prompts.metas.find(p => p.id === pack.id && p.lang === lang);
            const packLines = fs.readFileSync(meta.path, 'utf-8').split(/\r?\n/);
            lines = lines.concat(packLines);
        }
    }
    lines = lines.map(p => p.trim()).filter(Boolean);
    lines = new Set(lines);

    const used = new Set();
    for (let i = 0; i < lines.size; i++) {
        const p = prompts.newPrompt();
        prompts = new Prompts(packIds, customPrompts, lang, prompts);
        assert.isFalse(used.has(p));
        used.add(p);
        assert.isTrue(lines.has(p));
    }
    const p = prompts.newPrompt();
    assert.strictEqual(p, '');
}