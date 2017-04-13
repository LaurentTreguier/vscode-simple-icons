#!/usr/bin/node

const os = require('os');

const colorRegexp = /#[0-9a-fA-F]{6}/g;
const pipeRegexp = /\s*\|\s*/;
const operations = {
    fill: content => {
        let json = JSON.parse(content);
        let neededIcons = [json.folder, json.folderExpanded, json.file];

        traverseSections(json, (sectionName, section, key) => {
            if (!section[key].match(pipeRegexp)) {
                neededIcons.push(section[key]);
            } else {
                neededIcons = neededIcons.concat(section[key]
                    .split(pipeRegexp)
                    .slice(1));
            }
        });

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

        for (let folder in result.folderNames) {
            let expandedName = result.folderNames[folder] + '.expanded';

            if (fileNames.indexOf(expandedName + '.svg') !== -1) {
                result.folderNamesExpanded[folder] = expandedName;
            }
        }

        let light = JSON.parse(JSON.stringify(result));
        delete light.iconDefinitions;

        ['folder', 'folderExpanded', 'file'].forEach((sectionName) => {
            let fileBaseName = sectionName.replace(/[A-Z]/, (letter) => '.' + letter.toLowerCase());

            if (fileNames.indexOf(fileBaseName + '.light.svg') !== -1) {
                light[sectionName] = light[sectionName] + '.light';
            }
        });

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

process.stdin.on('data', (data) =>
    process.stdout.write(operations[process.argv[2]](data.toString())));