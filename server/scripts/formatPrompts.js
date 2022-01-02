#!/usr/bin/env node
const fs = require('fs');
const klaw = require('klaw');
const through2 = require('through2');
const path = require('path');
const readline = require('readline');

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
        lineReader.on('line', function (line) {
            const width = (new TextEncoder()).encode(line).length;
            if (width > maxWidth) maxWidth = width;
        }).on('close', function () {
            lineReader = readline.createInterface({
                input: fs.createReadStream(item.path)
            });
            // second pass: write a new file with:
            // width in the filename
            // each line padded to be exactly that width
            const newName = path.join(path.dirname(item.path), (maxWidth + 1) + '_' + path.basename(item.path));
            const writeStream = fs.createWriteStream(newName);
            lineReader.on('line', function (line) {
                const width = (new TextEncoder()).encode(line).length;
                const diff = maxWidth - width;
                writeStream.write(line.padEnd(line.length + diff) + '\n');
            });
        });
    });