import * as vscode from 'vscode';
import { improveText, extendText, AzureOpenAIConfig } from './ai';

function getAzureOpenAIConfig() {
    const config = vscode.workspace.getConfiguration('markdownModifier');
    return {
        apiKey: config.get<string>('azureOpenAIApiKey') || '',
        endpoint: config.get<string>('azureOpenAIEndpoint') || '',
        deploymentName: config.get<string>('azureOpenAIDeploymentName') || ''
    };
}

class MarkdownModifierCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        vscode.window.onDidChangeTextEditorSelection(this._onSelectionChanged, this);
    }

    private _onSelectionChanged() {
        this._onDidChangeCodeLenses.fire();
    }

    async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        const editor = vscode.window.activeTextEditor;

        if (editor && editor.document === document && !editor.selection.isEmpty) {
            const range = new vscode.Range(editor.selection.start, editor.selection.end);

            const prefixLens = new vscode.CodeLens(range, {
                title: "Markdown assistant:",
                command: ""  // Empty command as this is just informational
            });

            const modifyLens = new vscode.CodeLens(range, {
                title: "Improve writing",
                command: "markdown-modifier.modify",
                arguments: [range]
            });

            const extendLens = new vscode.CodeLens(range, {
                title: "Continue writing",
                command: "markdown-modifier.extend",
                arguments: [range]
            });

            codeLenses.push(prefixLens, modifyLens, extendLens);
        }

        return codeLenses;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown Modifier is now active!');

    const codeLensProvider = new MarkdownModifierCodeLensProvider();

    let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
        { language: 'markdown', scheme: 'file' },
        codeLensProvider
    );

    let modifyDisposable = vscode.commands.registerTextEditorCommand('markdown-modifier.modify', (editor, edit, range) => {
        modifySelectedText(editor, range);
    });

    let extendDisposable = vscode.commands.registerTextEditorCommand('markdown-modifier.extend', (editor, edit, range) => {
        extendSelectedText(editor, range);
    });

    context.subscriptions.push(codeLensProviderDisposable, modifyDisposable, extendDisposable);
}


async function modifySelectedText(editor: vscode.TextEditor, range: vscode.Range) {
    return baseAction(improveText)(editor, range);
}

function extendSelectedText(editor: vscode.TextEditor, range: vscode.Range) {
    return baseAction(extendText)(editor, range);
}


function baseAction(fn: (text: string, config: AzureOpenAIConfig) => Promise<string>) {
    return async function (editor: vscode.TextEditor, range: vscode.Range) {
        const config = getAzureOpenAIConfig();

        if (!config.apiKey || !config.endpoint || !config.deploymentName) {
            const result = await vscode.window.showErrorMessage(
                'Azure OpenAI configuration is not set. Would you like to set it now?',
                'Yes', 'No'
            );
            if (result === 'Yes') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'markdownModifier.azureOpenAI');
            }
            return;
        }

        const text = editor.document.getText(range);

        try {
            const enhancedText = await fn(text, config);

            // Insert the enhanced text below the original
            const insertPosition = range.end.translate(0, 1);
            await editor.edit(editBuilder => {
                editBuilder.insert(insertPosition, `\n${enhancedText}\n`);
            });

            // Create a decoration type for the suggestion
            const decoration = vscode.window.createTextEditorDecorationType({
                backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
                isWholeLine: true,
                after: {
                    contentText: '',
                    color: '#888888',
                    margin: '0 0 0 20px'
                }
            });

            // Apply the decoration only to the suggested text
            const suggestedRange = new vscode.Range(insertPosition.translate(1, 0), insertPosition.translate(1 + enhancedText.split('\n').length, 0));
            editor.setDecorations(decoration, [suggestedRange]);

            // Show quick pick to apply or cancel
            const choice = await vscode.window.showQuickPick(['Accept', 'Reject'], {
                placeHolder: 'Do you want to apply the changes?'
            });

            if (choice === 'Accept') {
                await editor.edit(editBuilder => {
                    editBuilder.replace(range, enhancedText);
                    editBuilder.delete(new vscode.Range(range.end, suggestedRange.end));
                });
            } else {
                // Remove the suggestion if rejected
                await editor.edit(editBuilder => {
                    editBuilder.delete(new vscode.Range(insertPosition, suggestedRange.end));
                });
            }

            // Unselect the text by moving the cursor to the end of the affected area
            const newPosition = choice === 'Accept'
                ? editor.document.positionAt(editor.document.offsetAt(range.start) + enhancedText.length)
                : range.end;
            editor.selection = new vscode.Selection(newPosition, newPosition);

            // Dispose of the decoration
            decoration.dispose();
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage('Error enhancing text: ' + error.message);
            } else {
                vscode.window.showErrorMessage('An unknown error occurred while enhancing text');
            }
        }
    };
}

export function deactivate() { }
