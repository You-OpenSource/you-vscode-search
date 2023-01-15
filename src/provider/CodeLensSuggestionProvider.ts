import * as vscode from 'vscode';
import {CancellationToken, CodeLens, TextDocument} from 'vscode';
import constants from "../constants";


export default class CodeLensSuggestionProvider implements vscode.CodeLensProvider {


    static activate(context: vscode.ExtensionContext): CodeLensSuggestionProvider {
        let provider = new CodeLensSuggestionProvider();
        context.subscriptions.push(
            vscode.languages.registerCodeLensProvider(
                {scheme: constants.SCHEME}, provider));
        return provider;
    }

    public provideCodeLenses(document: TextDocument, token: CancellationToken):
        CodeLens[] | Thenable<CodeLens[]> {
        return document.getText().split('\n').map((line, index) => {
            return {line, index};
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