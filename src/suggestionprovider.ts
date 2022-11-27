import * as vscode from 'vscode';
import {CancellationToken, CodeLens, TextDocument} from 'vscode';


export class CodeLensSuggestionProvider implements vscode.CodeLensProvider {
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