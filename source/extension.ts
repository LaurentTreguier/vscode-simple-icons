import * as fs from 'fs';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => toggleArrows(context)));
    toggleArrows(context);
}

export function deactivate() {
}

async function toggleArrows(context: vscode.ExtensionContext) {
    const jsonFiles = ['simple', 'minimalistic'].map(name => context.asAbsolutePath(name + '-icons.json'));
    let somethingChanged = false;

    for (const file of jsonFiles) {
        await changeFile(file, content => {
            let json = JSON.parse(content);
            const conf = vscode.workspace.getConfiguration('simpleIcons').get('hideArrows', false);

            if (json.hidesExplorerArrows === conf) {
                return null;
            }

            somethingChanged = true;
            json.hidesExplorerArrows = conf;
            return JSON.stringify(json, null, 4);
        });
    }

    if (somethingChanged) {
        vscode.window.showInformationMessage('The window must be reloaded for changes to take effet', 'Reload')
            .then(choice => choice ? vscode.commands.executeCommand('workbench.action.reloadWindow') : null);
    }
}

async function changeFile(name: string, dg: (content: string) => string) {
    const content = await new Promise<string>(resolve => fs.readFile(name, (err, data) => resolve(data.toString())));
    const newContent = dg(content);

    if (newContent) {
        return await new Promise<void>(resolve => fs.writeFile(name, newContent, err => resolve()));
    }
}
