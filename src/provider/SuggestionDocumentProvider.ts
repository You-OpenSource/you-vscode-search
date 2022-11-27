import * as vscode from "vscode";
import constants from "../constants";

export default class SuggestionDocumentProvider implements vscode.TextDocumentContentProvider {
    private readonly onSuggestionRequested: () => string;

    static activate(onSuggestionRequested: () => string): SuggestionDocumentProvider {
        let provider = new SuggestionDocumentProvider(onSuggestionRequested);
        vscode.workspace.registerTextDocumentContentProvider(constants.SCHEME, provider);
        return provider;
    }

    constructor(onSuggestionRequested: () => string) {
        this.onSuggestionRequested = onSuggestionRequested;
    }

    // emitter and its event
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.onSuggestionRequested();
    }
};