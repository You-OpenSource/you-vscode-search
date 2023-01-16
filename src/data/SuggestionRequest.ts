import * as vscode from 'vscode';

export interface SuggestionRequest {
    editor: vscode.TextEditor;
    selectionText: String
    selection: vscode.Selection
}
