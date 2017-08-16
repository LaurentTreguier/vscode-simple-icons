#!/usr/bin/node

const os = require('os');

const colorRegexp = /(#[0-9a-fA-F]{6})|(url\(#gradient.*?\))/g;
const pipeRegexp = /\s*\|\s*/;
const operations = {
    fill: content => {
        let json = JSON.parse(content);
        let neededIcons = [json.rootFolder, json.rootFolderExpanded, json.folder, json.folderExpanded, json.file];

        traverseSections(json, (sectionName, section, key) =>
            neededIcons.push(section[key].match(pipeRegexp)
                ? section[key].split(pipeRegexp).pop()
                : section[key]));

        return neededIcons
            .map((name) => name + '.svg')
            .join(os.EOL);
    },
    gen: content => content.replace(colorRegexp, () => '#bfbfbf'),
    light: content => content.replace(colorRegexp, (color) => {
        let n = parseInt(color.slice(1), 16);
        let result = 0xffffff - n - (n === 0 ? 0 : 0x010101);
        let nString = (result > 0 ? result : 0).toString(16);
        return '#' + Array(7 - nString.length).join('0') + nString;
    }),
    json: content => {
        let result = Object.assign({ iconDefinitions: {} }, JSON.parse(content));
        let fileNames = process.argv.slice(4).sort();

        fileNames.forEach((name) =>
            result.iconDefinitions[name.replace(/\.svg$/, '')] = { iconPath: `./${process.argv[3]}/${name}` });

        traverseSections(result, (sectionName, section, key) => {
            let options = section[key].split(pipeRegexp);
            section[key] = options.find((opt) => fileNames.indexOf(opt + '.svg') !== -1);

            if (!section[key]) {
                delete section[key];
            }
        });

        let folderNamesExpanded = {};

        for (let folder in result.folderNames) {
            let expandedName = result.folderNames[folder] + '.expanded';

            if (fileNames.indexOf(expandedName + '.svg') !== -1) {
                folderNamesExpanded[folder] = result.folderNamesExpanded[folder] || expandedName;
            }
        }

        result.folderNamesExpanded = folderNamesExpanded;

        let light = JSON.parse(JSON.stringify(result));
        let baseIcons = {
            rootFolder: 'folder-root',
            rootFolderExpanded: 'folder-root.expanded',
            folder: 'folder',
            folderExpanded: 'folder.expanded',
            file: 'file'
        };

        delete light.iconDefinitions;

        for (let sectionName in baseIcons) {
            if (fileNames.indexOf(baseIcons[sectionName] + '.light.svg') !== -1) {
                light[sectionName] = light[sectionName] + '.light';
            }
        }

        traverseSections(light, (sectionName, section, key) => {
            if (fileNames.indexOf(section[key] + '.light.svg') !== -1) {
                section[key] = section[key] + '.light';
            }
        });

        result.light = light;

        return JSON.stringify(result, null, 4);
    }
};

function traverseSections(json, callback) {
    ['folderNames', 'fileNames', 'fileExtensions', 'languageIds'].forEach((sectionName) => {
        let section = json[sectionName];

        for (let key in section) {
            callback(sectionName, section, key);
        }
    });
}

process.stdin.on('data', (data) => process.stdout.write(operations[process.argv[2]](data.toString())));