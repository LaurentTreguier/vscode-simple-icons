import * as fs from 'fs';
import * as vscode from 'vscode';
import * as bb from 'bluebird';

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidChangeConfiguration(() => toggleArrows(context));
    toggleArrows(context);
}

export function deactivate() {
}

function toggleArrows(context: vscode.ExtensionContext) {
    const jsonFiles = ['simple', 'minimalistic']
        .map(name => context.asAbsolutePath(name + '-icons.json'));

    jsonFiles.forEach(file =>
        bb.promisify(fs.readFile)(file)
            .then(data => JSON.parse(data.toString()))
            .then(json => {
                let conf = !!vscode.workspace.getConfiguration('simpleIcons').get('hideArrows', false);

                if (json.hidesExplorerArrows === conf) {
                    throw new Error('No changes to be made');
                }

                json.hidesExplorerArrows = conf;
                return JSON.stringify(json, null, 4);
            }).then(jsonString => bb.promisify(fs.writeFile)(file, jsonString))
            .then(() => vscode.window.showInformationMessage('The window must be reloaded for changes to take effet', 'Reload'))
            .then(choice => {
                if (choice === 'Reload') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            })
            .catch(err => ({}))
    )
}
