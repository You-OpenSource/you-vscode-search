import * as vscode from 'vscode';

export interface SuggestionRequest {
    editor: vscode.TextEditor;
    selection: String
}
