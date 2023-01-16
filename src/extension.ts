// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeLensSuggestionProvider from './provider/CodeLensSuggestionProvider';
import SuggestionDocumentProvider from "./provider/SuggestionDocumentProvider";
import ApplyCommand from "./command/ApplyCommand";
import OpenCommand from "./command/OpenCommand";
import SuggestionProvider from "./provider/SuggestionProvider";
import { getRedHatService, TelemetryService } from '@dmi3coder/vscode-redhat-telemetry';
import { activateTelemetry } from './telemetry';

export async function activate(context: vscode.ExtensionContext) {
    activateTelemetry(context);

    let suggestionDocumentContent = `
Welcome to You.com code assistant!
You can use this assistant to find code snippets for your project.
To start, select a piece of code and see suggestions.
    `;
    const myProvider = SuggestionDocumentProvider.activate(() => suggestionDocumentContent);
    CodeLensSuggestionProvider.activate(context);
    let suggestionProvider = SuggestionProvider.activate(context, myProvider, (text: string) => {
        suggestionDocumentContent = text;
    });
    OpenCommand.activate(context);
    ApplyCommand.activate(context, suggestionProvider.getSuggestionEditor, suggestionProvider.getSolutions, suggestionProvider.getSelection);

}

// This method is called when your extension is deactivated
export function deactivate() {
}
