import {Prompts, retrieveIntersections, retrieveMetas} from "../../src/models/prompts";
import {assert} from "chai";
import fs from "fs";

describe('prompts tests', () => {

    describe('actual files', () => {

        before(() => {
            Prompts.metas = retrieveMetas('./resources/prompts');
            Prompts.intersections = retrieveIntersections(Prompts.metas);
        });

        it('single pack', () => {
            test_prompts(z(['standard']), [], 'en-CA');
        });

        it('double pack', () => {
            test_prompts(z(['standard', 'canadian']), [], 'en-CA');
        });

        it('custom only', () => {
            const custom = ['test1', 'test2', 'test3', 'test4', 'test5'];
            test_prompts({}, custom, 'en-CA');
        });


        it('double pack w custom', () => {
            const custom = ['test1', 'test2', 'test3', 'test4', 'test5']
            test_prompts(z(['standard', 'canadian']), custom, 'en-CA');
        });

        describe('carryover', () => {
            it('single pack', () => {
                test_prompts(z(['standard']), [], 'en-CA', true);
            });

            it('double pack', () => {
                test_prompts(z(['standard', 'canadian']), [], 'en-CA', true);
            });

            it('custom only', () => {
                const custom = ['test1', 'test2', 'test3', 'test4', 'test5'];
                test_prompts({}, custom, 'en-CA', true);
            });

            it('double pack w custom', () => {
                const custom = ['test1', 'test2', 'test3', 'test4', 'test5'];
                test_prompts(z(['standard', 'canadian']), custom, 'en-CA', true);
            });

            it('double pack reduced', () => {
                test_pack_swap_carryover(z(['standard', 'canadian']), z(['canadian']), 'en-CA', 0.5);
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
            test_prompts(z(['pack1']), [], 'en-CA');
        });

        it('triple pack', () => {
            test_prompts(z(['pack1', 'pack2', 'pack3']), [], 'en-CA');
        });

        describe('permutations', () => {
            it('all combs', () => {
                test_prompts(z(['a', 'b', 'c', 'd']), [], 'prm');
            });

            it('all combs carryover', () => {
                test_prompts(z(['a', 'b', 'c', 'd']), [], 'prm', true);
            });

            it('all combs pack swap', () => {
                test_pack_swap_carryover(z(['a', 'b']), z(['c', 'd']), 'prm', 1);
                test_pack_swap_carryover(z(['c', 'd']), z(['a', 'b']), 'prm', 1);
                test_pack_swap_carryover(z(['a', 'd']), z(['b', 'c']), 'prm', 1);
                test_pack_swap_carryover(z(['a', 'b', 'c']), z(['d']), 'prm', 0.5);
                test_pack_swap_carryover(z(['a']), z(['a', 'b']), 'prm', 1);
            });
        });

        describe('french', () => {
            it('single pack', () => {
                test_prompts(z(['pack1']), [], 'fr');
            });

            it('triple pack', () => {
                test_prompts(z(['pack1', 'pack2', 'pack3']), [], 'fr');
            });
        });
    });
});

function z(pack: string[]):Record<string, boolean> {
    const ret: Record<string, boolean> = {}
    for (const id of pack) {
        ret[id] = true;
    }
    return ret;
}


function test_prompts(packs: Record<string, boolean>, customPrompts: string[], lang: string, carryover = false) {
    let prompts = new Prompts(packs, customPrompts, lang);
    let lines = customPrompts;
    for (const pack of prompts.packs) {
        if (pack.id !== 'custom') {
            const meta = Prompts.metas.find(p => p.id === pack.id && p.lang === lang);
            const packLines = fs.readFileSync(meta!.path, 'utf-8').split(/\r?\n/);
            lines = lines.concat(packLines);
        }
    }
    lines = lines.map(p => p.trim()).filter(Boolean);
    const lineSet = new Set(lines);

    const used = new Set();
    for (let i = 0; i < lineSet.size; i++) {
        const p = prompts.newPrompt([]);
        if (carryover) {
            prompts = new Prompts(packs, customPrompts, lang, prompts);
        }
        assert.isOk(p);
        assert.isFalse(used.has(p));
        used.add(p);
        assert.isTrue(lineSet.has(p));
    }
    const p = prompts.newPrompt([]);
    assert.strictEqual(p, '');
}

function test_pack_swap_carryover(packs1: Record<string, boolean>, packs2: Record<string, boolean>, lang: string, percent: number) {
    //just to retrieve the lines
    let prompts = new Prompts(packs2, [], lang);
    let lines: string[] = [];
    for (const pack of prompts.packs) {
        if (pack.id !== 'custom') {
            const meta = Prompts.metas.find(p => p.id === pack.id && p.lang === lang);
            const packLines = fs.readFileSync(meta!.path, 'utf-8').split(/\r?\n/);
            lines = lines.concat(packLines);
        }
    }
    // no carryover start with packs1
    prompts = new Prompts(packs1, [], lang);
    lines = lines.map(p => p.trim()).filter(Boolean);
    const lineSet = new Set(lines);

    // use percent of the prompts from the first pack
    const used = new Set();
    for(let i = 0; i < prompts.numRemaining * percent; i++){
        let p = prompts.newPrompt([]);
        used.add(p);
        if(lineSet.has(p)) lineSet.delete(p);
    }
    prompts = new Prompts(packs2, [], lang, prompts);

    for (let i = 0; i < lineSet.size; i++) {
        const p = prompts.newPrompt([]);
        assert.isOk(p);
        assert.isFalse(used.has(p));
        used.add(p);
        assert.isTrue(lineSet.has(p));
    }
    const p = prompts.newPrompt([]);
    assert.strictEqual(p, '');
}