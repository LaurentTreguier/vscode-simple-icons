import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const colorRegex = /#[0-9A-F]{6}(?![0-9A-F])/gi;

export async function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => probeConfiguration(context)));
    return await probeConfiguration(context);
}

export async function deactivate() {
}

async function probeConfiguration(context: vscode.ExtensionContext): Promise<void> {
    const somethingChanged = await toggleArrows(context) || await changeFolderColor(context);

    if (somethingChanged) {
        await vscode.window.showInformationMessage('The window must be reloaded for changes to take effet', 'Reload')
            .then(choice => choice ? vscode.commands.executeCommand('workbench.action.reloadWindow') : null);
    }
}

async function toggleArrows(context: vscode.ExtensionContext): Promise<boolean> {
    const jsonFiles = ['simple', 'minimalistic'].map(name => name + '-icons.json');
    let somethingChanged = false;

    for (const file of jsonFiles) {
        await changeFile(context, file, async content => {
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

    return somethingChanged;
}

async function changeFolderColor(context: vscode.ExtensionContext): Promise<boolean> {
    let color = vscode.workspace.getConfiguration('simpleIcons').get<string>('simple.folder.color', null);
    const oldColor = context.globalState.get<string>('simple.folder.color');

    if (!color) {
        if (oldColor) {
            color = oldColor;
            await context.globalState.update('simple.folder.color', undefined);
        } else {
            return false;
        }
    } else if (!color.match(colorRegex)) {
        await vscode.window.showWarningMessage('Folder color not in hex format, color not changed');
        return false;
    }

    const folders = ['folder', 'folder.expanded'].map(p => path.join('icons', 'simple-icons', p) + '.svg');
    let somethingChanged = false;

    for (const folderPath of folders) {
        await changeFile(context, folderPath, async content => {
            const contentMatches = content.match(colorRegex);
            const originalColor = contentMatches[0];

            if (originalColor === color) {
                return null;
            }

            somethingChanged = true;

            if (color !== oldColor) {
                await context.globalState.update('simple.folder.color', originalColor);
            }

            return content.replace(colorRegex, color);
        });
    }

    return somethingChanged;
}

async function changeFile(context: vscode.ExtensionContext, name: string, dg: (content: string) => Promise<string>): Promise<void> {
    const file = context.asAbsolutePath(name);
    const content = await new Promise<string>(resolve => fs.readFile(file, (err, data) => resolve(data.toString())));
    const newContent = await dg(content);

    if (newContent) {
        return await new Promise<void>(resolve => fs.writeFile(file, newContent, err => resolve()));
    }
}
