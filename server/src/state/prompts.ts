// retrieve meta data
import fs from 'fs';
import path from 'path';
import klawSync from 'klaw-sync';

const CUSTOM = 'custom';

type Meta = {
  id: string;
  path: string;
  lang: string;
  prompts: string[];
};

// retrieve meta info for what prompts can be served
export function retrieveMetas(root: string): Meta[] {
  const metas = [];
  const items = klawSync(root, { nodir: true });
  for (const item of items) {
    const lang = path.basename(path.dirname(item.path));
    const id = path.basename(item.path, '.txt').split(/\. ?/)[1];
    const prompts = fs
      .readFileSync(item.path, 'utf-8')
      .split(/\r?\n/)
      .map((p) => p.trim())
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

type Intersections = Record<string, Record<string, Set<number>>>;

/*
    returns: a map of intersections
    an id to the intersection is id1 + id2, for example if pack1 is standard and pack2 is canadian than standardcanadian
    is an index.ts
    the intersection just lists the index.ts of each intersecting value
 */
export function retrieveIntersections(metas: Meta[]): Intersections {
  const intersections: Intersections = {};
  for (const meta1 of metas) {
    for (const meta2 of metas) {
      if (meta1.id === meta2.id || meta1.lang !== meta2.lang) continue;
      // already computed this intersection
      if (intersections[meta2.id + meta1.id]) continue;
      const overlapsA = new Set<number>();
      const overlapsB = new Set<number>();
      for (let i = 0; i < meta1.prompts.length; i++) {
        for (let j = 0; j < meta2.prompts.length; j++) {
          if (meta1.prompts[i] === meta2.prompts[j]) {
            overlapsA.add(i);
            overlapsB.add(j);
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

const promptsRoot = path.join(__dirname, '../../resources/prompts');

type Pack = {
  id: string;
  prompts: string[];
  used: Set<number>; // used by the room
  oou: Set<number>; // out of use (used to avoid repeats)
  remaining: Set<number>;
};

export class Prompts {
  static metas = retrieveMetas(promptsRoot);
  static intersections = retrieveIntersections(this.metas);
  private readonly numPrompts: number;
  numRemaining: number;
  packs: Pack[];

  static packOptions(lang: string): Record<string, boolean> {
    const packs: Record<string, boolean> = {};
    for (const meta of Prompts.metas) {
      if (meta.lang === lang) {
        packs[meta.id] = false;
      }
    }
    packs['standard'] = true;
    packs['custom'] = false;
    return packs;
  }

  constructor(packs: Record<string, boolean>, customPrompts: string[], lang: string = 'en-CA', oldPrompts?: Prompts) {
    this.numPrompts = customPrompts?.length ?? 0;
    this.numRemaining = 0;
    this.packs = [];
    // retrieve meta for each pack
    const packIds = [];
    for (const id in packs) {
      if (packs[id]) {
        const meta = Prompts.metas.find((meta) => meta.id === id && meta.lang === lang);
        // skip any packs that can't be found
        if (!meta) continue;

        packIds.push(id);
        this.packs.push({
          id: meta.id,
          prompts: meta.prompts,
          used: new Set<number>(), // used by the room
          oou: new Set<number>(), // out of use (used to avoid repeats)
          remaining: new Set<number>()
        }); // for alternative method when too much storage is required
      }
    }
    // use prompts to avoid intersection between packs
    for (let i = 0; i < packIds.length; i++) {
      for (let j = i + 1; j < packIds.length; j++) {
        const intersect =
          Prompts.intersections[packIds[i] + packIds[j]] ?? Prompts.intersections[packIds[j] + packIds[i]];
        this.packs[i].oou = new Set([...this.packs[i].oou, ...intersect[packIds[i]]]); // Always use the smaller i to avoid intersections
      }
    }
    // add customPrompts to packs list
    customPrompts = customPrompts.map((p) => p.trim());
    this.packs.push({
      id: CUSTOM,
      prompts: customPrompts,
      used: new Set(),
      oou: new Set(),
      remaining: new Set()
    });
    if (oldPrompts) {
      this._keepOldUsed(oldPrompts);
    }

    // set counters
    for (const pack of this.packs) {
      this.numPrompts += pack.prompts.length;
      this.numRemaining += pack.prompts.length - new Set([...pack.used, ...pack.oou]).size;
    }

    if (this._useRemainingMethod(this.numRemaining)) {
      this._setRemainingSets();
    }
  }

  _keepOldUsed(oldPrompts: Prompts): void {
    // this will only work as long as the prompts are the same
    if (!oldPrompts) return;
    for (const oldPack of oldPrompts.packs) {
      if (oldPack.id === CUSTOM || oldPack.used.size === 0) continue;
      for (const newPack of this.packs) {
        if (newPack.id === CUSTOM) break;
        if (oldPack.id === newPack.id) {
          newPack.used = new Set([...newPack.used, ...oldPack.used]);
        } else {
          const intersect =
            Prompts.intersections[oldPack.id + newPack.id] ?? Prompts.intersections[newPack.id + oldPack.id];
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
      for (const customPrompt of customPack.prompts) {
        if (oldCustomPack.prompts[i] === customPrompt) {
          customPack.used.add(i);
        }
      }
    }
  }

  _useRemainingMethod(numRemaining: number): boolean {
    return numRemaining < this.numPrompts / 6;
  }

  _setRemainingSets(): void {
    for (const pack of this.packs) {
      pack.remaining = new Set<number>(
        Array.from({ length: pack.prompts.length }, (_v, i) => i).filter(
          (index) => !(pack.used.has(index) || pack.oou.has(index))
        )
      );
    }
  }

  hasNewPrompt(): boolean {
    return this.numRemaining > 0;
  }

  newPrompt(players: { name: string }[]): string {
    if (this.numRemaining <= 0) {
      return '';
    }
    let retVal;
    if (this._useRemainingMethod(this.numRemaining)) {
      retVal = this._chooseFromRemaining();
    } else {
      retVal = this._chooseRegular();
    }
    this.numRemaining--;
    return this._fillPlayerName(players, retVal);
  }

  _fillPlayerName(players: { name: string }[], prompt: string): string {
    if (prompt.includes('!n')) {
      const chosen = players[Math.floor(Math.random() * players.length)];
      return prompt.replace('!n', chosen.name);
    }
    // if there's nothing to replace
    return prompt;
  }

  // non-deterministic but with enough prompts should be better
  _chooseRegular(): string {
    let r: number;
    let pack!: Pack;
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
  _chooseFromRemaining(): string {
    // this means this is the first time using the remaining method
    if (!this._useRemainingMethod(this.numRemaining + 1)) {
      this._setRemainingSets();
    }
    let rr: number = Math.floor(Math.random() * this.numRemaining);
    let pack!: Pack;
    for (pack of this.packs) {
      if (rr >= pack.remaining.size) {
        rr -= pack.remaining.size;
      } else {
        break;
      }
    }
    const r = Array.from(pack.remaining)[rr];
    pack.used.add(r);
    pack.remaining.delete(r);
    return pack.prompts[r];
  }
}
