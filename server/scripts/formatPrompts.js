#!/usr/bin/env node
const fs = require('fs');
const klaw = require('klaw');
const through2 = require('through2');
const path = require('path');
const readline = require('readline');
const klawSync = require('klaw-sync');

// fs.open('./resources/prompts/en/48_standard.txt', 'r', (err, fd) => {
//     let buffer = Buffer.alloc(48);
//     fs.read(fd, buffer, 0, 48,0 * 48, (err, bytesRead, buffer) => {
//         console.log(buffer.toString().trim());
//         //console.log(new TextEncoder().encode(buffers[0]).toString().trim());
//     })
// });
//
// return;
const regex = /^([\d]*)x([\d]*)(.*).txt$/

const walkFilter = (item) => {
    const basename = path.basename(item.path);
    return regex.test(basename);
};

const metas = [];

const items = klawSync('./resources/prompts/', {nodir: true}).filter(walkFilter);

items.forEach(item => {
    const lang = path.basename(path.dirname(item.path));
    const basename = path.basename(item.path);
    const regex = /^([\d]*)x([\d]*)(.*).txt$/
    const [_, width, height, underscoredName] = basename.match(regex);
    const name = underscoredName;
    metas.push({
        lang,
        path: item.path,
        width,
        height,
        name
    });
});

return metas;

const excludeDirFilter = through2.obj(function (item, enc, next) {
    const basename = path.basename(item.path);
    const c = basename.charAt(0);
    const startsNumeric = c >= '0' && c <= '9';
    if (!item.stats.isDirectory() && !startsNumeric) this.push(item);
    next();
});

klaw('./resources/prompts/')
    .pipe(excludeDirFilter)
    .on('data', item => {

        let lineReader = readline.createInterface({
            input: fs.createReadStream(item.path)
        });
        // first pass: get the maximum width line length
        let maxWidth = 0;
        let height = 0;
        lineReader.on('line', function (line) {
            const width = (new TextEncoder()).encode(line).length;
            if (width > maxWidth) maxWidth = width;
            height++;
        }).on('close', function () {
            lineReader = readline.createInterface({
                input: fs.createReadStream(item.path)
            });
            // second pass: write a new file with:
            // width in the filename
            // each line padded to be exactly that width
            const newName = path.join(path.dirname(item.path),
                (maxWidth + 1) + 'x' + height + path.basename(item.path));
            const writeStream = fs.createWriteStream(newName);
            lineReader.on('line', function (line) {
                const width = (new TextEncoder()).encode(line).length;
                const diff = maxWidth - width;
                writeStream.write(line.padEnd(line.length + diff) + '\n');
            });
        });
    });