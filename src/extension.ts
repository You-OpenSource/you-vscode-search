// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {eventNames} from 'process';
import {Subject, interval, debounce} from 'rxjs';
import * as vscode from 'vscode';
import {TextEditorSelectionChangeEvent} from "vscode";
import {CodeLensSuggestionprovider} from './suggestionprovider';
import RemoteYouRepository from './data/repository/RemoteYouRepository';
import {privateEncrypt} from 'crypto';
import {Result, SearchResults} from './data/repository/ApiService';

interface SuggestionRequest {
    editor: vscode.TextEditor;
    selection: String
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const selectionSubject = new Subject<SuggestionRequest>();
    let test = '';
    let solutions: Result[] = [];
    let suggestionEditor: vscode.TextEditor | undefined;
    selectionSubject.pipe(debounce(() => interval(1000))).subscribe((selection) => {
        RemoteYouRepository.getCodeSuggestions({codeLine: selection.selection}).subscribe((response) => {
            // test = response.searchResults.results[0].snippet_code;
            suggestionEditor = selection.editor;
            solutions = response.searchResults.results;
            test = response.searchResults.results.map((result, index) => {
                return {snippet: result.snippet_code, index};
            }).reduce((acc, curr) => {
                return acc + `\n==========\n` + curr.snippet;
            }, '');
            myProvider.onDidChangeEmitter.fire(uri);
        }, (error) => {
            console.log("Request failed :(");
            test = 'Request to You.com failed :(';
            myProvider.onDidChangeEmitter.fire(uri);
            console.log(error);
        });
    });

    const command = 'you-com-search.apply';

    const commandHandler = (position: number = 0) => {
        if (suggestionEditor) {
            suggestionEditor.edit(editBuilder => {
                const selection = suggestionEditor!.selection;
                editBuilder.replace(selection, solutions[position].snippet_code);
            });
        }
    };
    const myScheme = 'you-com-search';

    context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            {scheme: myScheme}, new CodeLensSuggestionprovider()));

    const myProvider = new class implements vscode.TextDocumentContentProvider {

        // emitter and its event
        onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
        onDidChange = this.onDidChangeEmitter.event;

        provideTextDocumentContent(uri: vscode.Uri): string {
            return test;
        }
    };

    vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider);
    const uri = vscode.Uri.parse('you-com-search:' + 'test.youcomsuggestions');
    vscode.window.onDidChangeTextEditorSelection((evt: TextEditorSelectionChangeEvent) => {
        console.log(evt, 'event');
        if (evt.kind !== 2) {
            return;
        }
        const selection = evt.textEditor.selection;
        test = evt.textEditor.document.getText(selection);
        selectionSubject.next({editor: evt.textEditor, selection: test});
    });
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('you-com-search.helloWorld', async () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        // const uri = vscode.Uri.parse('you-com-search:' + 'test');
        const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
        // vscode.commands.executeCommand("vscode.openWith", uri, YouSuggestionPaneProvider.viewType, { preview: true, viewColumn: vscode.ViewColumn.Beside, preserveFocus: true });
        await vscode.window.showTextDocument(doc, {
            preview: true,
            viewColumn: vscode.ViewColumn.Beside,
            preserveFocus: true
        });
        vscode.window.showInformationMessage('Hello World from you.com search!');
    });


    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
}
