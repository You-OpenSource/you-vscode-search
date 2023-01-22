import * as vscode from "vscode";
import { Result } from "../data/repository/ApiService";
import { getTelemetry } from "../telemetry";


export default class ApplyCommand {
    private getActiveEditor: () => (vscode.TextEditor | undefined);
    private getSolutions: () => Result[];
    private getSelection: () => vscode.Selection | undefined;


    static activate(context: vscode.ExtensionContext, getActiveEditor: () => vscode.TextEditor | undefined,
        getSolutions: () => Result[], getSelection: () => vscode.Selection | undefined) {

        const command = 'you-com-search.apply';
        let applyCommand = new ApplyCommand(getActiveEditor, getSolutions, getSelection);
        context.subscriptions.push(vscode.commands.registerCommand(command, applyCommand.handle));
    }


    constructor(
        getActiveEditor: () => vscode.TextEditor | undefined,
        getSolutions: () => Result[],
        getSelection: () => vscode.Selection | undefined,
    ) {
        this.getActiveEditor = getActiveEditor;
        this.getSolutions = getSolutions;
        this.getSelection = getSelection;
    }

    handle = (position: number = 0) => {
        let activeEditor = this.getActiveEditor();
        const selectedSolution = this.getSolutions()[position].snippet_code;
        if (activeEditor) {
            getTelemetry().send({
                name: "vscode_user_click",
                type: "track",
                properties: {
                    "solution.number": position,
                    "solution.codeSnippet": selectedSolution
                }
            });

            activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                let selection = this.getSelection();
                if( selection && activeEditor) {
                    let selectedText = activeEditor.document.getText(selection);
                    let indentation  = selectedText.length - selectedText.trimStart().length;
                    let indendetSolution = selectedSolution.split('\n').map(line => (' '.repeat(indentation)) + line).join('\n')
                    editBuilder.replace(selection, indendetSolution);
                }
            });
        }
    };

}