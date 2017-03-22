#!/usr/bin/node

const fs = require('fs');
const path = require('path');

const sections = [
    'folderNames',
    'folderNamesExpanded',
    'fileNames',
    'fileExtensions',
    'languageIds'
];

const iconsFile = path.join(process.cwd(), 'icons.json');

fs.readFile(iconsFile, (err, data) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    let json = JSON.parse(data.toString());

    for (let section of sections) {
        json.light[section] = Object.assign({}, json[section], json.light[section]);
    }

    fs.writeFile(iconsFile, JSON.stringify(json, null, 4));
});