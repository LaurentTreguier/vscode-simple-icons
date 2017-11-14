#!/usr/bin/node

const colorRegexp = /(#[0-9a-fA-F]{6})|(url\(#gradient.*?\))/g;
const pipeRegexp = /\s*\|\s*/;
const operations = {
    redirect: iconSumsContent => {
        function betterIcon(older, newer) {
            if (!older) {
                return true;
            }

            let olderDashes = older.split('-').length;
            let newerDashes = newer.split('-').length;

            return olderDashes > newerDashes
                || (olderDashes === newerDashes && older.length > newer.length);
        }

        let iconsSums = iconSumsContent
            .trim()
            .split(' ')
            .map((sumAndFile) => sumAndFile.split('@'));
        let usedIcons = {};

        iconsSums.forEach((sumAndFile) => {
            if (betterIcon(usedIcons[sumAndFile[0]], sumAndFile[1])) {
                usedIcons[sumAndFile[0]] = sumAndFile[1];
            }
        });

        let output = [];

        iconsSums.forEach((sumAndFile) => {
            if (usedIcons[sumAndFile[0]] !== sumAndFile[1]) {
                output.push(sumAndFile[1] + '@' + usedIcons[sumAndFile[0]]);
            }
        });

        return output.join(' ');
    },
    gen: iconContent => iconContent.replace(colorRegexp, () => '#bfbfbf'),
    light: iconContent => iconContent.replace(colorRegexp, (color) => {
        let n = parseInt(color.slice(1), 16);
        let result = 0xffffff - n - (n === 0 ? 0 : 0x010101);
        let nString = (result > 0 ? result : 0).toString(16);
        return '#' + Array(7 - nString.length).join('0') + nString;
    }),
    json: jsonContent => {
        let result = Object.assign({ iconDefinitions: {} }, JSON.parse(jsonContent));
        let mixedArgs = process.argv.slice(4);
        let redirects = mixedArgs.filter((arg) => arg.match(/\S+\.svg@\S+\.svg/)).sort();
        let fileNames = mixedArgs.filter((arg) =>
            redirects.indexOf(arg) === -1 && !redirects.find((r) => r.startsWith(arg + '@'))).sort();

        fileNames.forEach((name) =>
            result.iconDefinitions[name.replace(/\.svg$/, '')] = { iconPath: `./${process.argv[3]}/${name}` });

        traverseSections(result, (section, key) => {
            let red = redirects.find((r) => r.startsWith(section[key] + '.svg@'));

            if (red) {
                section[key] = red.split('@')[1].replace('.svg', '');
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
        let baseIcons = [
            'rootFolder',
            'rootFolderExpanded',
            'folder',
            'folderExpanded',
            'file',
            'hidesExplorerArrows'
        ];

        delete light.iconDefinitions;

        for (let sectionName of baseIcons) {
            let red = redirects.find((r) => r.startsWith(light[sectionName] + '.svg@'));

            if (red) {
                light[sectionName] = red.split('@')[1].replace('.svg', '');
            }

            if (fileNames.indexOf(light[sectionName] + '.light.svg') !== -1) {
                light[sectionName] = light[sectionName] + '.light';
            }
        }

        traverseSections(light, (section, key) => {
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
            callback(section, key);
        }
    });
}

let input = '';

process.stdin.on('data', (data) => input += data.toString());
process.stdin.on('end', () => process.stdout.write(operations[process.argv[2]](input)));
