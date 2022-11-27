// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {debounce, interval, Subject} from 'rxjs';
import * as vscode from 'vscode';
import {TextEditorSelectionChangeEvent} from 'vscode';
import {CodeLensSuggestionProvider} from './suggestionprovider';
import RemoteYouRepository from './data/repository/RemoteYouRepository';
import {Result} from './data/repository/ApiService';
import {SuggestionRequest} from './data/SuggestionRequest';
import SuggestionDocumentProvider from "./provider/SuggestionDocumentProvider";

export function activate(context: vscode.ExtensionContext) {
    const selectionSubject = new Subject<SuggestionRequest>();
    let test = '';
    let solutions: Result[] = [];
    let suggestionEditor: vscode.TextEditor | undefined;
    selectionSubject.pipe(debounce(() => interval(1000))).subscribe((selection) => {
        RemoteYouRepository.getCodeSuggestions({codeLine: selection.selection}).subscribe((response) => {
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
            {scheme: myScheme}, new CodeLensSuggestionProvider()));

    const myProvider = SuggestionDocumentProvider.activate(() => {
        return test;
    });
    const uri = vscode.Uri.parse('you-com-search:' + 'suggestions');
    vscode.window.onDidChangeTextEditorSelection((evt: TextEditorSelectionChangeEvent) => {
        console.log(evt, 'event');
        if (evt.kind !== 2) {
            return;
        }
        const selection = evt.textEditor.selection;
        if (evt.textEditor.document.uri.toString() === 'you-com-search:suggestions') {
            return;
        }
        test = evt.textEditor.document.getText(selection);
        selectionSubject.next({editor: evt.textEditor, selection: test});
    });

    let disposable = vscode.commands.registerCommand('you-com-search.open', async () => {

        const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
        await vscode.window.showTextDocument(doc, {
            preview: true,
            viewColumn: vscode.ViewColumn.Beside,
            preserveFocus: true
        });
        vscode.window.showInformationMessage('You.com code assistant activated!');
    });


    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
}
