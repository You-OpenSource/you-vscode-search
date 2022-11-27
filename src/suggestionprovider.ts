// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { eventNames } from 'process';
import { Subject, interval, debounce } from 'rxjs';
import * as vscode from 'vscode';
import { CancellationToken, CodeLens, TextDocument, TextEditorSelectionChangeEvent } from "vscode";
import { YouSuggestionPaneProvider } from './paneProvider';
import RemoteYouRepository from './data/repository/RemoteYouRepository';



export class CodeLensSuggestionprovider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: TextDocument, token: CancellationToken):
        CodeLens[] | Thenable<CodeLens[]> {
        return document.getText().split('\n').map((line, index) => {
            return { line, index };
        }).filter((it) => {
            if (it.line.includes(`==========`)) {
                return true;
            }
        }).map((it, index) => {
            return new CodeLens(new vscode.Range(it.index, 0, it.index, 0), {
                title: `Try solution ${index}`,
                command: `you-com-search.apply`,
                arguments: [
                    index
                ]
            });
        }
        );
    }

}