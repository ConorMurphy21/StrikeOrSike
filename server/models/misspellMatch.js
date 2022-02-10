const Spellchecker = require('spellchecker');
const en = new Spellchecker.Spellchecker();
en.setSpellcheckerType(Spellchecker.ALWAYS_USE_HUNSPELL);
en.setDictionary('en_CA', './resources/dictionaries');
spellcheckers = {
    en
}

const getCorrections = async (string, lang) => {
    if(string.includes(' ')) return [];
    const spellchecker = spellcheckers[lang] ?? en;
    if(spellchecker.isMisspelled(string)){
        return spellchecker.getCorrectionsForMisspelling(string);
    }
    return [];
}

const misspellMatch = (string1, string2, corrections1, corrections2, lang) => {
    if (!corrections1.length && !corrections2.length) return 0;
    if (corrections1.length && corrections2.length) {
        const intersection = corrections1.filter(element => {
            for (const el of corrections2) {
                if (el.localeCompare(element, lang,
                    {sensitivity: 'base', ignorePunctuation: true, usage: 'search'}) === 0) return true;
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
            if (options[i].localeCompare(correct, lang,
                {sensitivity: 'base', ignorePunctuation: true, usage: 'search'}) === 0) index = i;
        }
        return index === -1 ? 0 : 0.95 - index * 0.03;
    }
}

module.exports = {getCorrections, misspellMatch};