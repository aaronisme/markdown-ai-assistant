
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown Modifier is now active!');

    let modifyDisposable = vscode.commands.registerCommand('markdown-modifier.modify', () => {
        modifySelectedText();
    });

    let extendDisposable = vscode.commands.registerCommand('markdown-modifier.extend', () => {
        extendSelectedText();
    });

    context.subscriptions.push(modifyDisposable, extendDisposable);
}

function modifySelectedText() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'markdown') {
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (text) {
            vscode.window.showInputBox({ prompt: 'Enter modified text' }).then(modifiedText => {
                if (modifiedText !== undefined) {
                    editor.edit(editBuilder => {
                        editBuilder.replace(selection, modifiedText);
                    });
                }
            });
        } else {
            vscode.window.showInformationMessage('Please select some text to modify.');
        }
    }
}

function extendSelectedText() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'markdown') {
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (text) {
            vscode.window.showInputBox({ prompt: 'Enter text to append' }).then(appendText => {
                if (appendText !== undefined) {
                    editor.edit(editBuilder => {
                        editBuilder.insert(selection.end, ' ' + appendText);
                    });
                }
            });
        } else {
            vscode.window.showInformationMessage('Please select some text to extend.');
        }
    }
}

export function deactivate() {}
