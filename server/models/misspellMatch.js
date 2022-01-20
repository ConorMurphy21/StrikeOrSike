const Spellchecker = require('hunspell-spellchecker');
const fs = require('fs');
const spellchecker = new Spellchecker();

const en_CA = spellchecker.parse({
    aff: fs.readFileSync("./resources/dictionaries/en_CA.aff"),
    dic: fs.readFileSync("./resources/dictionaries/en_CA.dic")});
const misspellMatch = { en: en_CA };

module.exports = (string1, string2, lang) => {
    spellchecker.use(misspellMatch[lang]);
    const mis1 = !spellchecker.check(string1);
    const mis2 = !spellchecker.check(string2);
    const len = 5;
    if(mis1 && mis2){
        const options1 = spellchecker.suggest(string1, len);
        const options2 = spellchecker.suggest(string2, len);
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
        const options = spellchecker.suggest(mis, len);
        const index = options.indexOf(correct);
        return 0.95 - index * 0.03;
    }
    return 0;
}
