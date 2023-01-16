import * as vscode from "vscode";
import { debounce, interval, Subject } from "rxjs";
import RemoteYouRepository from "../data/repository/RemoteYouRepository";
import { SuggestionRequest } from "../data/SuggestionRequest";
import { Result } from "../data/repository/ApiService";
import SuggestionDocumentProvider from "./SuggestionDocumentProvider";


export default class SuggestionProvider {
    selectionSubject = new Subject<SuggestionRequest>();
    test = '';
    solutions: Result[] = [];
    suggestionEditor: vscode.TextEditor | undefined;


    getSuggestionEditor = () => this.suggestionEditor;
    getSolutions = () => this.solutions;


    static activate(context: vscode.ExtensionContext, myProvider: SuggestionDocumentProvider, setText: (text: string) => void): SuggestionProvider {
        let suggestionProvider = new SuggestionProvider();
        const uri = vscode.Uri.parse('you-com-search:' + 'suggestions');
        vscode.window.onDidChangeTextEditorSelection((evt: vscode.TextEditorSelectionChangeEvent) => {
            // Disables suggestion on typing
            // if (evt.kind !== 2) {
            //     return;
            // }
            let selection = evt.textEditor.selection;

            if (evt.textEditor.document.uri.toString() === 'you-com-search:suggestions') {
                return;
            }
            const language = evt.textEditor.document.languageId;

            let text;
            if (selection.start.character == selection.end.character) {
                text = evt.textEditor.document.lineAt(evt.textEditor.selection.start.line).text.trim();
            } else {
                text = evt.textEditor.document.getText(selection).trim();
            }

            let cleanedText = text;
            if (text[0].startsWith('#')) {
                cleanedText = text.substring(1);
            } else if (text.startsWith('//')) {
                cleanedText = text.substring(2);
            }
            const searchText = `${language} ${cleanedText}`;
            suggestionProvider.selectionSubject.next({ editor: evt.textEditor, selection: searchText });
        });
        suggestionProvider.selectionSubject.pipe(debounce(() => interval(1000))).subscribe((selection) => {
            RemoteYouRepository.getCodeSuggestions({ codeLine: selection.selection }).subscribe((response) => {
                suggestionProvider.suggestionEditor = selection.editor;
                suggestionProvider.solutions = response.searchResults.results;
                setText(response.searchResults.results.map((result, index) => {
                    return { snippet: result.snippet_code, index };
                }).reduce((acc, curr) => {
                    return acc + (acc.length === 0 ? '' : '\n') + `==========\n` + curr.snippet;
                }, ''));
                myProvider.onDidChangeEmitter.fire(uri);
            }, (error) => {
                suggestionProvider.test = 'Request to You.com failed';
                myProvider.onDidChangeEmitter.fire(uri);
                console.log(error);
            });
        });
        return suggestionProvider;
    }
}