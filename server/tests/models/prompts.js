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
            const prompts = new Prompts(['standard'], []);
            test_prompts(prompts, 'en-CA', []);
        });

        it('double pack', () => {
            const prompts = new Prompts(['standard', 'canadian'], []);
            test_prompts(prompts, 'en-CA', []);
        });

        it('double pack w custom', () => {
            const custom = ['test1', 'test2', 'test3', 'test4', 'test5']
            const prompts = new Prompts(['standard', 'canadian'], custom);
            test_prompts(prompts, 'en-CA', custom);
        });

    });

    describe('mock files', () => {
        before(() => {
            Prompts.metas = retrieveMetas('./tests/resources/prompts');
            Prompts.intersections = retrieveIntersections(Prompts.metas);
        });

        it('single pack', () => {
            const prompts = new Prompts(['pack1'], []);
            test_prompts(prompts, 'en-CA', []);
        });

        describe('french', () => {
            it('single pack', () => {
                const prompts = new Prompts(['pack1'], [], 'fr');
                test_prompts(prompts, 'fr', []);
            });
        });
    });
});

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
    for(let i = 0; i < lines.size; i++) {
        const p = prompts.newPrompt();
        assert.isFalse(used.has(p));
        used.add(p);
        assert.isTrue(lines.has(p));
    }
    const p = prompts.newPrompt();
    assert.strictEqual(p, '');
}