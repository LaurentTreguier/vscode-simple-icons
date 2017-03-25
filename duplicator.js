#!/usr/bin/node

const fs = require('fs');
const path = require('path');

const iconsFiles = ['simple-icons', 'minimalistic-icons']
    .map((name) => path.join(process.cwd(), name + '.json'));
const minimalisticIconsPath = path.join(process.cwd(), 'source/minimalistic-icons');
const sections = [
    'folderNames',
    'folderNamesExpanded',
    'fileNames',
    'fileExtensions',
    'languageIds'
];

fs.readdir(minimalisticIconsPath, (err, files) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    files.filter((file) => !file.endsWith('.light.svg')).forEach((file) =>
        fs.readFile(path.join(minimalisticIconsPath, file), (err, data) =>
            fs.writeFile(path.join(minimalisticIconsPath, file).replace('.svg', '.light.svg'),
                data.toString().replace(/#[0-9a-fA-F]{6}/g, (color) => {
                    let n = parseInt(color.slice(1), 16);
                    let result = 0xffffff - n - (n === 0 ? 0 : 0x010101);
                    let nString = (result > 0 ? result : 0).toString(16);
                    return '#' + Array(7 - nString.length).join('0') + nString;
                }))));
});

iconsFiles.forEach((iconsFile) => fs.readFile(iconsFile, (err, data) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    let json = JSON.parse(data.toString());

    if (iconsFile === iconsFiles[1]) {
        let newDefs = {};

        for (let def in json.iconDefinitions) {
            if (!def.endsWith('.light')) {
                newDefs[def] = Object.assign({}, json.iconDefinitions[def]);
                newDefs[def + '.light'] = json.iconDefinitions[def];
                newDefs[def + '.light'].iconPath = newDefs[def + '.light'].iconPath.replace('.svg', '.light.svg');
            }
        }

        json.iconDefinitions = newDefs;
    }

    for (let section of sections) {
        let lightSection = json.light[section];

        if (iconsFile === iconsFiles[0]) {
            lightSection = Object.assign({}, json[section], lightSection);
        } else {
            lightSection = Object.assign({}, json[section]);

            for (let prop in lightSection) {
                lightSection[prop] = json[section][prop] + '.light';
            }
        }

        json.light[section] = lightSection;
    }

    fs.writeFile(iconsFile, JSON.stringify(json, null, 4));
}));