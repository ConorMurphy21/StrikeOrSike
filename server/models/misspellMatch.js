const Spellchecker = require('spellchecker');
const en = new Spellchecker.Spellchecker();
en.setSpellcheckerType(Spellchecker.ALWAYS_USE_HUNSPELL);
en.setDictionary('en_CA', './resources/dictionaries');
spellcheckers = {
    en
}
module.exports = (string1, string2, lang) => {
    if(string1.includes(' ') || string2.includes(' ')) return 0;
    const spellchecker = spellcheckers[lang] ?? en;
    const mis1 = spellchecker.isMisspelled(string1);
    const mis2 = spellchecker.isMisspelled(string2);
    if(mis1 && mis2){
        const options1 = spellchecker.getCorrectionsForMisspelling(string1);
        const options2 = spellchecker.getCorrectionsForMisspelling(string2);
        const intersection = options1.filter(element => options2.includes(element));
        let percent = 1;
        for(const element of intersection){
            const ind = Math.max(options1.indexOf(element), options2.indexOf(element));
            percent *= 0.15 * (ind/3);
        }
        return 1 - percent;
    } else if(mis1 || mis2){
        const mis = mis1 ? string1 : string2;
        const correct = mis1 ? string2 : string1;
        const options = spellchecker.getCorrectionsForMisspelling(mis);
        const index = options.indexOf(correct);
        return index === -1 ? 0 : 0.95 - index * 0.03;
    }
    return 0;
}
