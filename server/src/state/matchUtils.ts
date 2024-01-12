import Spellchecker from 'spellchecker';
import pluralize from 'pluralize';
import path from 'path';

const en = new Spellchecker.Spellchecker();
en.setSpellcheckerType(Spellchecker.ALWAYS_USE_HUNSPELL);
en.setDictionary('en_CA', path.join(__dirname, '../../resources/dictionaries'));
const spellcheckers: Record<string, Spellchecker.Spellchecker> = {
  en_CA: en
};

export function getCorrections(string: string, lang: string): Promise<string[]> {
  if (string.includes(' ')) return Promise.resolve([]);
  const spellchecker = spellcheckers[lang] ?? en;
  if (spellchecker.isMisspelled(string)) {
    return Promise.resolve(spellchecker.getCorrectionsForMisspelling(string));
  }
  return Promise.resolve([]);
}

function certainMatch(string1: string, string2: string, lang: string): boolean {
  return exactMatch(string1, string2, lang) || pluralMatch(string1, string2, lang);
}
function exactMatch(string1: string, string2: string, lang: string): boolean {
  return (
    string1.localeCompare(string2, lang, {
      sensitivity: 'base',
      ignorePunctuation: true,
      usage: 'search'
    }) === 0
  );
}

function pluralMatch(string1: string, string2: string, lang: string): boolean {
  if (lang && !lang.startsWith('en')) return false;
  if (string1.includes(' ') || string2.includes(' ')) return false;
  return exactMatch(pluralize.plural(string1), pluralize.plural(string2), lang);
}

export function stringMatch(
  string1: string,
  string2: string,
  corrections1: string[],
  corrections2: string[],
  lang: string
): number {
  if (certainMatch(string1, string2, lang)) return 1;

  if (!corrections1.length && !corrections2.length) return 0;
  if (corrections1.length && corrections2.length) {
    const intersection = corrections1.filter((element) => {
      for (const el of corrections2) {
        if (certainMatch(el, element, lang)) return true;
      }
      return false;
    });
    let percent = 1;
    for (const element of intersection) {
      const ind = Math.max(corrections1.indexOf(element), corrections2.indexOf(element));
      percent *= 0.15 * (ind / 3);
    }
    return 1 - percent;
  } else {
    const mis1 = corrections1.length !== 0;
    const correct = mis1 ? string2 : string1;
    const options = mis1 ? corrections1 : corrections2;
    let index = -1;
    for (let i = 0; i < options.length; i++) {
      if (certainMatch(options[i], correct, lang)) index = i;
    }
    return index === -1 ? 0 : 0.95 - index * 0.03;
  }
}
